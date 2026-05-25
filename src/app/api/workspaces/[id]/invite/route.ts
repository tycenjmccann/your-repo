import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceAuth } from '@/middleware/withWorkspaceAuth';
import { createMember, getMember } from '@/lib/db/members';
import { updateWorkspace, getWorkspace } from '@/lib/db/workspaces';
import { emitAuditEvent } from '@/lib/audit';
import { checkRateLimit } from '@/lib/rate-limit';
import { inviteMemberSchema, validateEmail } from '@/lib/validation';
import { Member, WorkspaceAuthContext } from '@/types/workspace';

export const POST = withWorkspaceAuth(
  'admin',
  async (
    req: NextRequest,
    _context: { params: Promise<Record<string, string>> },
    auth: WorkspaceAuthContext
  ): Promise<NextResponse> => {
    // Check rate limit first
    let rateLimitResult;
    try {
      rateLimitResult = await checkRateLimit({
        action: 'invite',
        resourceId: auth.workspaceId,
        maxPerHour: 10,
      });
    } catch (err) {
      console.error('[invite] Rate limit check failed:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Rate limit check failed' } },
        { status: 500 }
      );
    }

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Invite limit reached. Try again later.',
            details: { retryAfterSeconds: String(rateLimitResult.retryAfterSeconds || 3600) },
          },
        },
        { status: 429 }
      );
      response.headers.set('Retry-After', String(rateLimitResult.retryAfterSeconds || 3600));
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set('X-RateLimit-Remaining', '0');
      return response;
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

    const parsed = inviteMemberSchema.safeParse(body);
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

    // Validate email format
    if (!validateEmail(parsed.data.email)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
            details: { email: 'Must be a valid RFC 5322 email address' },
          },
        },
        { status: 400 }
      );
    }

    // Check for existing membership
    const existingMember = await getMember(auth.workspaceId, parsed.data.email);
    if (existingMember && existingMember.status !== 'removed') {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'User already has a pending invite or is a member of this workspace',
          },
        },
        { status: 409 }
      );
    }

    // Create the member record
    const now = new Date().toISOString();
    const member: Member = {
      workspaceId: auth.workspaceId,
      userId: parsed.data.email,
      role: parsed.data.role,
      invitedAt: now,
      joinedAt: null,
      invitedBy: auth.userId,
      email: parsed.data.email,
      status: 'pending',
    };

    try {
      await createMember(member);
      const workspace = await getWorkspace(auth.workspaceId);
      if (workspace) {
        await updateWorkspace(auth.workspaceId, {
          memberCount: workspace.memberCount + 1,
        });
      }
    } catch (err) {
      console.error('[invite] Failed to create invitation:', err);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to create invitation' } },
        { status: 500 }
      );
    }

    emitAuditEvent({
      workspaceId: auth.workspaceId,
      eventType: 'workspace.member_invited',
      actorId: auth.userId,
      targetId: parsed.data.email,
      metadata: { email: parsed.data.email, role: parsed.data.role },
    });

    const response = NextResponse.json(
      {
        data: {
          email: parsed.data.email,
          role: parsed.data.role,
          invitedAt: now,
          status: 'pending',
        },
      },
      { status: 201 }
    );
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    return response;
  }
);
