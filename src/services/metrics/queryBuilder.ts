import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamodb";
import { DynamoDBEvent, TimeRange } from "./types";

const TABLE_NAME = "agentis-events";
const GSI_NAME = "gsi-timestamp-eventType";
const MAX_CONCURRENCY = 8;

const RANGE_HOURS: Record<TimeRange, number> = {
  "1h": 1,
  "6h": 6,
  "24h": 24,
  "7d": 168,
};

/**
 * Generate hourly bucket keys (format: YYYY-MM-DD-HH) for the given time range.
 * These correspond to the GSI partition key `eventHourBucket`.
 */
export function generateHourlyBuckets(range: TimeRange): string[] {
  const hours = RANGE_HOURS[range];
  const now = new Date();
  const buckets: string[] = [];

  for (let i = 0; i < hours; i++) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const bucket = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCHours()).padStart(2, "0")}`;
    buckets.push(bucket);
  }

  return buckets;
}

function buildQueryParams(bucket: string, rangeStart: string): QueryCommandInput {
  return {
    TableName: TABLE_NAME,
    IndexName: GSI_NAME,
    KeyConditionExpression:
      "eventHourBucket = :bucket AND #ts >= :rangeStart",
    ExpressionAttributeNames: { "#ts": "timestamp" },
    ExpressionAttributeValues: {
      ":bucket": bucket,
      ":rangeStart": rangeStart,
    },
  };
}

/**
 * Query a single hourly bucket with automatic pagination to retrieve all items.
 */
async function queryBucketWithPagination(
  bucket: string,
  rangeStart: string
): Promise<DynamoDBEvent[]> {
  const events: DynamoDBEvent[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const params: QueryCommandInput = {
      ...buildQueryParams(bucket, rangeStart),
      ExclusiveStartKey: exclusiveStartKey,
    };

    const response = await docClient.send(new QueryCommand(params));

    if (response.Items) {
      for (const item of response.Items) {
        // Skip events with missing required fields
        if (item.eventId && item.agentId && item.workflowId && item.timestamp && item.eventType) {
          events.push(item as DynamoDBEvent);
        }
      }
    }

    exclusiveStartKey = response.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (exclusiveStartKey);

  return events;
}

/**
 * Query all events within the given time range using parallel bucket queries.
 * Executes queries in batches of MAX_CONCURRENCY to avoid DynamoDB throttling.
 */
export async function queryEventsForRange(
  range: TimeRange
): Promise<DynamoDBEvent[]> {
  const buckets = generateHourlyBuckets(range);
  const rangeStart = new Date(
    Date.now() - RANGE_HOURS[range] * 60 * 60 * 1000
  ).toISOString();
  const allEvents: DynamoDBEvent[] = [];

  // Execute queries in parallel batches
  for (let i = 0; i < buckets.length; i += MAX_CONCURRENCY) {
    const batch = buckets.slice(i, i + MAX_CONCURRENCY);
    const results = await Promise.all(
      batch.map((bucket) => queryBucketWithPagination(bucket, rangeStart))
    );
    for (const events of results) {
      allEvents.push(...events);
    }
  }

  return allEvents;
}
