import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from './client';
import { Workspace } from '@/types/workspace';

export async function createWorkspace(workspace: Workspace): Promise<Workspace> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAMES.workspaces,
      Item: workspace,
      ConditionExpression: 'attribute_not_exists(workspaceId)',
    })
  );
  return workspace;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAMES.workspaces,
      Key: { workspaceId },
    })
  );
  return (result.Item as Workspace) || null;
}

export async function updateWorkspace(
  workspaceId: string,
  updates: Partial<Workspace>
): Promise<Workspace> {
  const expressionParts: string[] = [];
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, unknown> = {};

  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'workspaceId') return;
    const attrName = `#${key}`;
    const attrValue = `:${key}`;
    expressionParts.push(`${attrName} = ${attrValue}`);
    expressionNames[attrName] = key;
    expressionValues[attrValue] = value;
  });

  expressionParts.push('#updatedAt = :updatedAt');
  expressionNames['#updatedAt'] = 'updatedAt';
  expressionValues[':updatedAt'] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAMES.workspaces,
      Key: { workspaceId },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as Workspace;
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAMES.workspaces,
      Key: { workspaceId },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':status': 'deleted',
        ':updatedAt': new Date().toISOString(),
      },
    })
  );
}
