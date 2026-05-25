import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceAuth } from '@/middleware/withWorkspaceAuth';
import { getWorkspace, updateWorkspace, deleteWorkspace } from '@/lib/db/workspaces';
import { listWorkspaceMembers, removeAllMembers } from '@/lib/db/members';
import { emitAuditEvent } from '@/lib/audit';
import { updateWorkspaceSchema } from '@/lib/validation';
import { WorkspaceAuthContext } from '@/types/workspace';

export const GET = withWorkspaceAuth(
  'viewer',
  async (
    _req: NextRequest,
    _context: { params: Promise<Record<string, string>> },
    auth: WorkspaceAuthContext
  ): Promise<NextResponse> => {
    let workspace;
    try {
      workspace = await getWorkspace(auth.workspaceId);
    } catch (err) {
      console.error('[workspaces] Failed to get workspace:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve workspace' } },
        { status: 500 }
      );
    }

    if (!workspace || workspace.status === 'deleted') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Workspace not found' } },
        { status: 404 }
      );
    }

    let members;
    try {
      members = await listWorkspaceMembers(auth.workspaceId);
    } catch (err) {
      console.error('[workspaces] Failed to list members:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve members' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...workspace,
          members,
          currentUserRole: auth.role,
        },
      },
      { status: 200 }
    );
  }
);

export const PUT = withWorkspaceAuth(
  'admin',
  async (
    req: NextRequest,
    _context: { params: Promise<Record<string, string>> },
    auth: WorkspaceAuthContext
  ): Promise<NextResponse> => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const parsed = updateWorkspaceSchema.safeParse(body);
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

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) {
      updates.name = parsed.data.name;
    }
    if (parsed.data.settings !== undefined) {
      const existingWorkspace = await getWorkspace(auth.workspaceId);
      if (!existingWorkspace) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Workspace not found' } },
          { status: 404 }
        );
      }
      updates.settings = { ...existingWorkspace.settings, ...parsed.data.settings };
    }

    let workspace;
    try {
      workspace = await updateWorkspace(auth.workspaceId, updates);
    } catch (err) {
      console.error('[workspaces] Failed to update workspace:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to update workspace' } },
        { status: 500 }
      );
    }

    emitAuditEvent({
      workspaceId: auth.workspaceId,
      eventType: 'workspace.settings_changed',
      actorId: auth.userId,
      metadata: { changes: parsed.data },
    });

    return NextResponse.json({ data: workspace }, { status: 200 });
  }
);

export const DELETE = withWorkspaceAuth(
  'owner',
  async (
    _req: NextRequest,
    _context: { params: Promise<Record<string, string>> },
    auth: WorkspaceAuthContext
  ): Promise<NextResponse> => {
    try {
      await removeAllMembers(auth.workspaceId);
      await deleteWorkspace(auth.workspaceId);
    } catch (err) {
      console.error('[workspaces] Failed to delete workspace:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete workspace' } },
        { status: 500 }
      );
    }

    emitAuditEvent({
      workspaceId: auth.workspaceId,
      eventType: 'workspace.deleted',
      actorId: auth.userId,
      metadata: {},
    });

    return NextResponse.json(
      { data: { workspaceId: auth.workspaceId, deleted: true } },
      { status: 200 }
    );
  }
);
