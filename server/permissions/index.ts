import type { WorkspaceRole } from "@prisma/client";

const ROLE_RANK: Record<WorkspaceRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  MEMBER: 60,
  ANALYST: 40,
  DESIGNER: 40,
  CLIENT_READONLY: 20,
};

export function hasRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}

export function canManageWorkspace(role: WorkspaceRole): boolean {
  return hasRole(role, "OWNER");
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return hasRole(role, "ADMIN");
}

export function canEditContent(role: WorkspaceRole): boolean {
  return hasRole(role, "MEMBER");
}

export function canViewAnalytics(role: WorkspaceRole): boolean {
  return hasRole(role, "ANALYST");
}

export function canReadOnly(role: WorkspaceRole): boolean {
  return hasRole(role, "CLIENT_READONLY");
}
