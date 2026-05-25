import { NextRequest, NextResponse } from 'next/server';
import { Role, WorkspaceAuthContext } from '@/types/workspace';
import { getSession } from '@/lib/auth';
import { getMember } from '@/lib/db/members';
import { hasMinRole } from '@/lib/rbac';

export function withWorkspaceAuth(
  minRole: Role,
  handler: (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: WorkspaceAuthContext
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const params = await context.params;
    const workspaceId = params.id;

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Workspace ID is required',
          },
        },
        { status: 400 }
      );
    }

    let member;
    try {
      member = await getMember(workspaceId, session.userId);
    } catch (err) {
      console.error('[auth] Failed to check membership:', err);
      return NextResponse.json(
        {
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Unable to verify authorization',
          },
        },
        { status: 503 }
      );
    }

    if (!member || member.status !== 'active') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a member of this workspace',
          },
        },
        { status: 403 }
      );
    }

    if (!hasMinRole(member.role, minRole)) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: `This action requires ${minRole} role or higher`,
          },
        },
        { status: 403 }
      );
    }

    const auth: WorkspaceAuthContext = {
      userId: session.userId,
      workspaceId,
      role: member.role,
    };

    return handler(req, context, auth);
  };
}
