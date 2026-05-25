import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './client';
import { Member, Role } from '@/types/workspace';

export async function createMember(member: Member): Promise<Member> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAMES.members,
      Item: member,
    })
  );
  return member;
}

export async function getMember(workspaceId: string, userId: string): Promise<Member | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAMES.members,
      Key: { workspaceId, userId },
    })
  );
  return (result.Item as Member) || null;
}

export async function listWorkspaceMembers(workspaceId: string): Promise<Member[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAMES.members,
      KeyConditionExpression: 'workspaceId = :wid',
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':wid': workspaceId,
        ':active': 'active',
      },
    })
  );
  return (result.Items as Member[]) || [];
}

export async function getUserWorkspaces(
  userId: string
): Promise<{ workspaceId: string; role: Role }[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAMES.members,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :uid',
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':uid': userId,
        ':active': 'active',
      },
    })
  );

  return (result.Items || []).map((item) => ({
    workspaceId: item.workspaceId as string,
    role: item.role as Role,
  }));
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: Role
): Promise<Member> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAMES.members,
      Key: { workspaceId, userId },
      UpdateExpression: 'SET #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':role': role },
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes as Member;
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAMES.members,
      Key: { workspaceId, userId },
      UpdateExpression: 'SET #status = :removed',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':removed': 'removed' },
    })
  );
}

export async function removeAllMembers(workspaceId: string): Promise<void> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAMES.members,
      KeyConditionExpression: 'workspaceId = :wid',
      ExpressionAttributeValues: { ':wid': workspaceId },
      ProjectionExpression: 'workspaceId, userId',
    })
  );

  const items = result.Items || [];
  if (items.length === 0) return;

  const batches: typeof items[] = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    const updatePromises = batch.map((item) =>
      docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAMES.members,
          Key: { workspaceId: item.workspaceId, userId: item.userId },
          UpdateExpression: 'SET #status = :removed',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':removed': 'removed' },
        })
      )
    );
    await Promise.all(updatePromises);
  }
}
