import {
  DynamoDBEvent,
  AgentMetrics,
  WorkflowMetrics,
  SystemMetrics,
  DurationPair,
  TimeRange,
} from "./types";

const MAX_ITEMS = 100;

const RANGE_HOURS: Record<TimeRange, number> = {
  "1h": 1,
  "6h": 6,
  "24h": 24,
  "7d": 168,
};

/**
 * Match agent.invoked → agent.complete events using FIFO pairing.
 * Groups events by (agentId + workflowId), sorts by timestamp, then pairs sequentially.
 * Orphaned invocations (no matching complete) are excluded.
 * If complete event has a `duration` field, uses that; otherwise computes from timestamps.
 * Clock skew protection: caps negative durations at 0ms.
 */
export function computeDurations(events: DynamoDBEvent[]): DurationPair[] {
  const grouped = new Map<string, DynamoDBEvent[]>();

  for (const event of events) {
    if (!event.agentId || !event.workflowId) continue;
    if (event.eventType !== "agent.invoked" && event.eventType !== "agent.complete") continue;
    const key = `${event.agentId}::${event.workflowId}`;
    const group = grouped.get(key) ?? [];
    group.push(event);
    grouped.set(key, group);
  }

  const pairs: DurationPair[] = [];

  for (const [, group] of grouped) {
    group.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const invokeQueue: DynamoDBEvent[] = [];

    for (const event of group) {
      if (event.eventType === "agent.invoked") {
        invokeQueue.push(event);
      } else if (event.eventType === "agent.complete" && invokeQueue.length > 0) {
        const invoke = invokeQueue.shift()!;
        const invokeTs = new Date(invoke.timestamp).getTime();
        const completeTs = new Date(event.timestamp).getTime();

        // Prefer duration field on complete event if available
        let duration: number;
        if (event.duration != null && event.duration >= 0) {
          duration = event.duration;
        } else {
          // Clock skew protection: cap at 0ms
          duration = Math.max(0, completeTs - invokeTs);
        }

        pairs.push({
          agentId: event.agentId,
          workflowId: event.workflowId,
          invokeTimestamp: invokeTs,
          completeTimestamp: completeTs,
          duration,
        });
      }
    }
  }

  return pairs;
}

/**
 * Compute success rate as percentage (0-100).
 * Only counts agent.complete and agent.error events (excludes in-flight invocations).
 */
function computeSuccessRate(events: DynamoDBEvent[]): number {
  const completions = events.filter(
    (e) => e.eventType === "agent.complete"
  ).length;
  const errors = events.filter((e) => e.eventType === "agent.error").length;
  const total = completions + errors;
  if (total === 0) return 0;
  return Math.round((completions / total) * 10000) / 100; // 2 decimal places
}

/**
 * Compute per-agent metrics: invocations, success rate, avg duration, tool usage.
 * Capped at MAX_ITEMS agents sorted by invocation count descending.
 */
export function computePerAgentMetrics(
  events: DynamoDBEvent[],
  durations: DurationPair[]
): AgentMetrics[] {
  const byAgent = new Map<string, DynamoDBEvent[]>();

  for (const event of events) {
    if (!event.agentId) continue;
    const group = byAgent.get(event.agentId) ?? [];
    group.push(event);
    byAgent.set(event.agentId, group);
  }

  const durationsByAgent = new Map<string, number[]>();
  for (const pair of durations) {
    const arr = durationsByAgent.get(pair.agentId) ?? [];
    arr.push(pair.duration);
    durationsByAgent.set(pair.agentId, arr);
  }

  const metrics: AgentMetrics[] = [];

  for (const [agentId, agentEvents] of byAgent) {
    const totalInvocations = agentEvents.filter(
      (e) => e.eventType === "agent.invoked"
    ).length;

    const successRate = computeSuccessRate(agentEvents);

    const agentDurations = durationsByAgent.get(agentId) ?? [];
    const avgDuration =
      agentDurations.length > 0
        ? Math.round(agentDurations.reduce((a, b) => a + b, 0) / agentDurations.length)
        : 0;

    // Count tool usage from events that have a toolName field
    const toolUsage: Record<string, number> = {};
    for (const event of agentEvents) {
      if (event.toolName) {
        toolUsage[event.toolName] = (toolUsage[event.toolName] ?? 0) + 1;
      }
    }

    metrics.push({ agentId, totalInvocations, successRate, avgDuration, toolUsage });
  }

  // Sort by invocation count descending, cap at MAX_ITEMS
  metrics.sort((a, b) => b.totalInvocations - a.totalInvocations);
  return metrics.slice(0, MAX_ITEMS);
}

/**
 * Compute per-workflow metrics: time to completion, agent utilization, bottleneck.
 * Time to completion = last complete timestamp - first invoke timestamp.
 * Bottleneck = agent with highest average duration in the workflow.
 * Capped at MAX_ITEMS workflows.
 */
export function computePerWorkflowMetrics(
  events: DynamoDBEvent[],
  durations: DurationPair[]
): WorkflowMetrics[] {
  const byWorkflow = new Map<string, DynamoDBEvent[]>();

  for (const event of events) {
    if (!event.workflowId) continue;
    const group = byWorkflow.get(event.workflowId) ?? [];
    group.push(event);
    byWorkflow.set(event.workflowId, group);
  }

  const durationsByWorkflow = new Map<string, DurationPair[]>();
  for (const pair of durations) {
    const arr = durationsByWorkflow.get(pair.workflowId) ?? [];
    arr.push(pair);
    durationsByWorkflow.set(pair.workflowId, arr);
  }

  const metrics: WorkflowMetrics[] = [];

  for (const [workflowId, workflowEvents] of byWorkflow) {
    const uniqueAgents = new Set(workflowEvents.map((e) => e.agentId));
    const agentUtilization = uniqueAgents.size;

    const wfDurations = durationsByWorkflow.get(workflowId) ?? [];

    // Time to completion: last complete timestamp - first invoke timestamp
    let timeToCompletion = 0;
    if (wfDurations.length > 0) {
      const firstInvoke = Math.min(...wfDurations.map((p) => p.invokeTimestamp));
      const lastComplete = Math.max(...wfDurations.map((p) => p.completeTimestamp));
      timeToCompletion = Math.max(0, lastComplete - firstInvoke);
    }

    // Bottleneck: agent with highest average duration in this workflow
    let bottleneckAgent = "";
    if (wfDurations.length > 0) {
      const agentDurations = new Map<string, number[]>();
      for (const pair of wfDurations) {
        const arr = agentDurations.get(pair.agentId) ?? [];
        arr.push(pair.duration);
        agentDurations.set(pair.agentId, arr);
      }
      let maxAvg = 0;
      for (const [agent, durs] of agentDurations) {
        const avg = durs.reduce((a, b) => a + b, 0) / durs.length;
        if (avg > maxAvg) {
          maxAvg = avg;
          bottleneckAgent = agent;
        }
      }
    }

    metrics.push({ workflowId, timeToCompletion, agentUtilization, bottleneckAgent });
  }

  return metrics.slice(0, MAX_ITEMS);
}

/**
 * Compute system-wide metrics:
 * - throughputPerHour: completed workflows / hours in range
 * - errorRateTrend: array of hourly error counts
 * - mostActiveAgents: top 5 agents by invocation count
 */
export function computeSystemWideMetrics(
  events: DynamoDBEvent[],
  range: TimeRange
): SystemMetrics {
  const totalHours = RANGE_HOURS[range];

  // Throughput = unique workflows with at least one agent.complete / hours in range
  const completedWorkflows = new Set(
    events
      .filter((e) => e.eventType === "agent.complete")
      .map((e) => e.workflowId)
  );
  const throughputPerHour =
    totalHours > 0
      ? Math.round((completedWorkflows.size / totalHours) * 100) / 100
      : 0;

  // Error rate trend: error count per hour bucket
  const now = Date.now();
  const errorRateTrend: number[] = [];

  for (let i = totalHours - 1; i >= 0; i--) {
    const hourStart = now - (i + 1) * 60 * 60 * 1000;
    const hourEnd = now - i * 60 * 60 * 1000;

    const errorCount = events.filter((e) => {
      if (e.eventType !== "agent.error") return false;
      const ts = new Date(e.timestamp).getTime();
      return ts >= hourStart && ts < hourEnd;
    }).length;

    errorRateTrend.push(errorCount);
  }

  // Most active agents: top 5 by invocation count
  const agentInvocations = new Map<string, number>();
  for (const event of events) {
    if (!event.agentId || event.eventType !== "agent.invoked") continue;
    agentInvocations.set(
      event.agentId,
      (agentInvocations.get(event.agentId) ?? 0) + 1
    );
  }

  const mostActiveAgents = [...agentInvocations.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agentId]) => agentId);

  return { throughputPerHour, errorRateTrend, mostActiveAgents };
}
