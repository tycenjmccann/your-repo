import { Role } from '@/types/workspace';

export const ROLE_HIERARCHY = ['viewer', 'member', 'admin', 'owner'] as const;

export function roleLevel(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function hasMinRole(actualRole: Role, requiredRole: Role): boolean {
  return roleLevel(actualRole) >= roleLevel(requiredRole);
}
