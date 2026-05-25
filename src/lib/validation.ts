import { z } from 'zod';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateEmail(email: string): boolean {
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(64, 'Workspace name must be 64 characters or fewer')
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Workspace name cannot be empty after trimming')),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .transform((val) => val.trim())
    .pipe(z.string().min(1))
    .optional(),
  settings: z
    .object({
      defaultRole: z.enum(['member', 'viewer']).optional(),
      allowMemberInvites: z.boolean().optional(),
      workflowExecutionLimit: z.number().nullable().optional(),
    })
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  role: z.enum(['admin', 'member', 'viewer']),
});

export const changeRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});
