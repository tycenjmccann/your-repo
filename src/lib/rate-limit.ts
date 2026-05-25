import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { docClient, TABLE_NAMES } from './db/client';

interface RateLimitConfig {
  action: string;
  resourceId: string;
  maxPerHour: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const now = new Date();
  const hourBucket = `${config.action}#${config.resourceId}`;
  const windowStart = new Date(now);
  windowStart.setMinutes(0, 0, 0);
  const windowKey = windowStart.toISOString();
  const ttl = Math.floor(windowStart.getTime() / 1000) + 7200;

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAMES.rateLimits,
        Key: { limitKey: hourBucket, windowStart: windowKey },
        UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :one, #ttl = :ttl',
        ConditionExpression: 'attribute_not_exists(#count) OR #count < :max',
        ExpressionAttributeNames: {
          '#count': 'count',
          '#ttl': 'ttl',
        },
        ExpressionAttributeValues: {
          ':zero': 0,
          ':one': 1,
          ':max': config.maxPerHour,
          ':ttl': ttl,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    const currentCount = (result.Attributes?.count as number) || 1;
    return {
      allowed: true,
      remaining: config.maxPerHour - currentCount,
    };
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      const minutesUntilReset = 60 - now.getUTCMinutes();
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: minutesUntilReset * 60,
      };
    }
    throw err;
  }
}
