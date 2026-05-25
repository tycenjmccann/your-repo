import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceAuth } from '@/middleware/withWorkspaceAuth';
import { getMember, removeMember } from '@/lib/db/members';
import { getWorkspace, updateWorkspace } from '@/lib/db/workspaces';
import { emitAuditEvent } from '@/lib/audit';
import { WorkspaceAuthContext } from '@/types/workspace';

export const DELETE = withWorkspaceAuth(
  'admin',
  async (
    _req: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: WorkspaceAuthContext
  ): Promise<NextResponse> => {
    const params = await context.params;
    const targetUserId = params.userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'User ID is required' } },
        { status: 400 }
      );
    }

    // Cannot remove yourself
    if (targetUserId === auth.userId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_OPERATION',
            message: 'Cannot remove yourself from the workspace',
          },
        },
        { status: 400 }
      );
    }

    // Get target member
    let targetMember;
    try {
      targetMember = await getMember(auth.workspaceId, targetUserId);
    } catch (err) {
      console.error('[members] Failed to get target member:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve member' } },
        { status: 500 }
      );
    }

    if (!targetMember || targetMember.status !== 'active') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Member not found' } },
        { status: 404 }
      );
    }

    // Cannot remove the owner
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_OPERATION',
            message: 'Cannot remove the workspace owner',
          },
        },
        { status: 400 }
      );
    }

    // Admin cannot remove another admin (only owner can)
    if (targetMember.role === 'admin' && auth.role !== 'owner') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only the owner can remove an admin',
          },
        },
        { status: 403 }
      );
    }

    try {
      await removeMember(auth.workspaceId, targetUserId);
      const workspace = await getWorkspace(auth.workspaceId);
      if (workspace) {
        await updateWorkspace(auth.workspaceId, {
          memberCount: Math.max(0, workspace.memberCount - 1),
        });
      }
    } catch (err) {
      console.error('[members] Failed to remove member:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to remove member' } },
        { status: 500 }
      );
    }

    emitAuditEvent({
      workspaceId: auth.workspaceId,
      eventType: 'workspace.member_removed',
      actorId: auth.userId,
      targetId: targetUserId,
      metadata: { previousRole: targetMember.role },
    });

    return NextResponse.json(
      { data: { userId: targetUserId, removed: true } },
      { status: 200 }
    );
  }
);
