export interface DynamoDBEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  agentId: string;
  workflowId: string;
  eventHourBucket: string;
  toolName?: string;
  duration?: number;
  errorType?: string;
  errorMessage?: string;
}

export interface AgentMetrics {
  agentId: string;
  totalInvocations: number;
  successRate: number;
  avgDuration: number;
  toolUsage: Record<string, number>;
}

export interface WorkflowMetrics {
  workflowId: string;
  timeToCompletion: number;
  agentUtilization: number;
  bottleneckAgent: string;
}

export interface SystemMetrics {
  throughputPerHour: number;
  errorRateTrend: number[];
  mostActiveAgents: string[];
}

export interface MetricsResponse {
  range: "1h" | "6h" | "24h" | "7d";
  computedAt: string;
  perAgent: AgentMetrics[];
  perWorkflow: WorkflowMetrics[];
  systemWide: SystemMetrics;
}

export type TimeRange = "1h" | "6h" | "24h" | "7d";

export interface DurationPair {
  agentId: string;
  workflowId: string;
  invokeTimestamp: number;
  completeTimestamp: number;
  duration: number;
}
