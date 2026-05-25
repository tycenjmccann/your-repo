import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceAuth } from '@/middleware/withWorkspaceAuth';
import { getMember, updateMemberRole } from '@/lib/db/members';
import { emitAuditEvent } from '@/lib/audit';
import { changeRoleSchema } from '@/lib/validation';
import { WorkspaceAuthContext } from '@/types/workspace';

export const PUT = withWorkspaceAuth(
  'owner',
  async (
    req: NextRequest,
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

    // Cannot change own role
    if (targetUserId === auth.userId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_OPERATION',
            message: 'Cannot change your own role',
          },
        },
        { status: 400 }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const parsed = changeRoleSchema.safeParse(body);
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
        { error: { code: 'NOT_FOUND', message: 'Member not found or not active' } },
        { status: 404 }
      );
    }

    const previousRole = targetMember.role;

    // Perform the role update
    try {
      await updateMemberRole(auth.workspaceId, targetUserId, parsed.data.role);
    } catch (err) {
      console.error('[members] Failed to update member role:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to update role' } },
        { status: 500 }
      );
    }

    emitAuditEvent({
      workspaceId: auth.workspaceId,
      eventType: 'workspace.member_role_changed',
      actorId: auth.userId,
      targetId: targetUserId,
      metadata: { from: previousRole, to: parsed.data.role },
    });

    return NextResponse.json(
      { data: { userId: targetUserId, role: parsed.data.role, previousRole } },
      { status: 200 }
    );
  }
);
