import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './db/client';
import { AuditEvent } from '@/types/workspace';

const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

interface EmitAuditEventParams {
  workspaceId: string;
  eventType: string;
  actorId: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export function emitAuditEvent(params: EmitAuditEventParams): void {
  const now = new Date();
  const event: AuditEvent = {
    workspaceId: params.workspaceId,
    eventId: `${now.getTime()}#${crypto.randomUUID()}`,
    eventType: params.eventType,
    actorId: params.actorId,
    targetId: params.targetId,
    metadata: params.metadata || {},
    createdAt: now.toISOString(),
    ttl: Math.floor(now.getTime() / 1000) + NINETY_DAYS_SECONDS,
  };

  docClient
    .send(
      new PutCommand({
        TableName: TABLE_NAMES.events,
        Item: event,
      })
    )
    .catch((err) => {
      console.error('[audit] Failed to emit event:', params.eventType, err);
    });
}
