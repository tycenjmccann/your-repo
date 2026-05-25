export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type Plan = 'free' | 'pro' | 'enterprise';
export type MemberStatus = 'pending' | 'active' | 'removed';

export interface WorkspaceSettings {
  defaultRole: 'member' | 'viewer';
  allowMemberInvites: boolean;
  workflowExecutionLimit: number | null;
}

export interface Workspace {
  workspaceId: string;
  name: string;
  ownerId: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
  settings: WorkspaceSettings;
  memberCount: number;
  status: 'active' | 'deleted';
}

export interface Member {
  workspaceId: string;
  userId: string;
  role: Role;
  invitedAt: string;
  joinedAt: string | null;
  invitedBy: string;
  email: string;
  status: MemberStatus;
}

export interface AuditEvent {
  workspaceId: string;
  eventId: string;
  eventType: string;
  actorId: string;
  targetId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  ttl: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface WorkspaceAuthContext {
  userId: string;
  workspaceId: string;
  role: Role;
}
