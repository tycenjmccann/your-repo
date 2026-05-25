import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAMES = {
  workspaces: 'agentis-workspaces',
  members: 'agentis-members',
  events: 'agentis-events',
  rateLimits: 'agentis-rate-limits',
} as const;
