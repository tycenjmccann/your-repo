import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createWorkspace } from '@/lib/db/workspaces';
import { createMember, getUserWorkspaces } from '@/lib/db/members';
import { emitAuditEvent } from '@/lib/audit';
import { createWorkspaceSchema } from '@/lib/validation';
import { Workspace, Member } from '@/types/workspace';
import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '@/lib/db/client';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const details: Record<string, string> = {};
    for (const [key, msgs] of Object.entries(fieldErrors)) {
      if (msgs && msgs.length > 0) {
        details[key] = msgs[0];
      }
    }
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details,
        },
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const workspaceId = crypto.randomUUID();

  const workspace: Workspace = {
    workspaceId,
    name: parsed.data.name,
    ownerId: session.userId,
    plan: 'free',
    createdAt: now,
    updatedAt: now,
    settings: {
      defaultRole: 'member',
      allowMemberInvites: false,
      workflowExecutionLimit: null,
    },
    memberCount: 1,
    status: 'active',
  };

  const member: Member = {
    workspaceId,
    userId: session.userId,
    role: 'owner',
    invitedAt: now,
    joinedAt: now,
    invitedBy: session.userId,
    email: '',
    status: 'active',
  };

  try {
    await createWorkspace(workspace);
    await createMember(member);
  } catch (err) {
    console.error('[workspaces] Failed to create workspace:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create workspace' } },
      { status: 500 }
    );
  }

  emitAuditEvent({
    workspaceId,
    eventType: 'workspace.created',
    actorId: session.userId,
    metadata: { name: workspace.name, plan: workspace.plan },
  });

  return NextResponse.json({ data: workspace }, { status: 201 });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  let memberships;
  try {
    memberships = await getUserWorkspaces(session.userId);
  } catch (err) {
    console.error('[workspaces] Failed to get user workspaces:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve workspaces' } },
      { status: 500 }
    );
  }

  if (memberships.length === 0) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }

  const keys = memberships.map((m) => ({ workspaceId: m.workspaceId }));
  const batches: typeof keys[] = [];
  for (let i = 0; i < keys.length; i += 100) {
    batches.push(keys.slice(i, i + 100));
  }

  const workspaces: Workspace[] = [];
  try {
    for (const batch of batches) {
      const result = await docClient.send(
        new BatchGetCommand({
          RequestItems: {
            [TABLE_NAMES.workspaces]: { Keys: batch },
          },
        })
      );
      const items = result.Responses?.[TABLE_NAMES.workspaces] || [];
      workspaces.push(
        ...(items.filter((w) => (w as Workspace).status === 'active') as Workspace[])
      );
    }
  } catch (err) {
    console.error('[workspaces] Failed to batch get workspaces:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve workspaces' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: workspaces }, { status: 200 });
}
