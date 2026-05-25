import { NextRequest } from 'next/server';
import { Pool } from 'pg';

/**
 * Event types supported by the activity stream.
 */
type ActivityEventType =
  | 'workflow.started'
  | 'agent.invoked'
  | 'agent.complete'
  | 'agent.error'
  | 'ticket.status_changed'
  | 'workflow.nudge';

interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  description: string;
  agentName: string;
  metadata: Record<string, unknown>;
}

/**
 * Database connection pool for querying the agentis-events table.
 * Uses environment variables for configuration (server-only).
 */
function createPool(): Pool {
  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'agentis',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

/**
 * Query recent events from the agentis-events table.
 * Returns events from the last 5 minutes, ordered by timestamp ascending.
 */
async function queryRecentEvents(
  pool: Pool,
  lastEventId: string | null
): Promise<ActivityEvent[]> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  let query: string;
  let params: string[];

  if (lastEventId) {
    // Fetch events newer than the last sent event
    query = `
      SELECT id, type, timestamp, description, agent_name, metadata
      FROM "agentis-events"
      WHERE timestamp > $1
        AND id > $2
      ORDER BY timestamp ASC, id ASC
      LIMIT 100
    `;
    params = [fiveMinutesAgo, lastEventId];
  } else {
    // Initial fetch: get all events from the last 5 minutes
    query = `
      SELECT id, type, timestamp, description, agent_name, metadata
      FROM "agentis-events"
      WHERE timestamp > $1
      ORDER BY timestamp ASC, id ASC
      LIMIT 100
    `;
    params = [fiveMinutesAgo];
  }

  const result = await pool.query(query, params);

  return result.rows.map((row) => ({
    id: row.id,
    type: row.type as ActivityEventType,
    timestamp: row.timestamp,
    description: row.description || '',
    agentName: row.agent_name || '',
    metadata: row.metadata || {},
  }));
}

/**
 * Format an ActivityEvent as an SSE data frame.
 */
function formatSSEEvent(event: ActivityEvent): string {
  const json = JSON.stringify(event);
  return `data: ${json}\n\n`;
}

/**
 * SSE heartbeat comment to keep the connection alive.
 */
function formatHeartbeat(): string {
  return `:keepalive\n\n`;
}

/**
 * GET /api/activity/stream
 *
 * Server-Sent Events endpoint that streams activity events from the
 * agentis-events database table. Polls every 2 seconds for new events,
 * deduplicates by event ID, and sends heartbeats to maintain connection.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();
  let pool: Pool | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Track the last event ID to avoid sending duplicates
      let lastEventId: string | null = null;
      // Track all sent event IDs within the 5-minute window for deduplication
      const sentEventIds = new Set<string>();

      // Initialize database connection pool
      try {
        pool = createPool();
      } catch (err) {
        console.error('[SSE] Failed to create database pool:', err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Database connection failed' })}\n\n`));
        controller.close();
        return;
      }

      /**
       * Cleanup function to release all resources.
       */
      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;

        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        if (pool) {
          pool.end().catch((err) => {
            console.error('[SSE] Error closing database pool:', err);
          });
          pool = null;
        }
      };

      // Listen for client disconnect via AbortSignal
      request.signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      });

      /**
       * Poll the database for new events and stream them to the client.
       */
      const pollEvents = async () => {
        if (isClosed || !pool) return;

        try {
          const events = await queryRecentEvents(pool, lastEventId);

          for (const event of events) {
            // Skip events we've already sent (deduplication)
            if (sentEventIds.has(event.id)) {
              continue;
            }

            // Validate event has required fields
            if (!event.id || !event.type || !event.timestamp) {
              console.warn('[SSE] Skipping malformed event:', event.id);
              continue;
            }

            try {
              const sseFrame = formatSSEEvent(event);
              controller.enqueue(encoder.encode(sseFrame));
              sentEventIds.add(event.id);
              lastEventId = event.id;
            } catch (err) {
              // If enqueue fails, client likely disconnected
              console.error('[SSE] Failed to enqueue event:', err);
              cleanup();
              return;
            }
          }

          // Periodically clean up old event IDs from the Set to prevent memory leaks
          // Keep only the last 1000 event IDs
          if (sentEventIds.size > 1000) {
            const idsArray = Array.from(sentEventIds);
            const toRemove = idsArray.slice(0, idsArray.length - 500);
            for (const id of toRemove) {
              sentEventIds.delete(id);
            }
          }
        } catch (err) {
          // Database query failed — log and retry on next cycle
          console.error('[SSE] Database query error:', err);
          // Don't crash the stream; the next poll cycle will retry
        }
      };

      // Send initial heartbeat to confirm connection
      try {
        controller.enqueue(encoder.encode(formatHeartbeat()));
      } catch {
        cleanup();
        return;
      }

      // Perform initial poll immediately
      await pollEvents();

      // Set up polling interval (every 2 seconds)
      pollInterval = setInterval(pollEvents, 2000);

      // Set up heartbeat interval (every 15 seconds)
      heartbeatInterval = setInterval(() => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(formatHeartbeat()));
        } catch {
          // Client disconnected
          cleanup();
        }
      }, 15000);
    },

    cancel() {
      // Called when the client closes the connection
      isClosed = true;
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      if (pool) {
        pool.end().catch((err) => {
          console.error('[SSE] Error closing database pool on cancel:', err);
        });
        pool = null;
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/**
 * Disable static optimization for this route.
 * SSE endpoints must be dynamic.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
