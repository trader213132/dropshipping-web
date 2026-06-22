import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.login"
  | "user.logout"
  | "user.password_changed"
  | "workspace.created"
  | "workspace.updated"
  | "workspace.deleted"
  | "workspace.member_invited"
  | "workspace.member_removed"
  | "workspace.member_role_changed"
  | "brand.created"
  | "brand.updated"
  | "brand.archived"
  | "brand.restored"
  | "store.created"
  | "store.deleted"
  | "store.published"
  | "store.unpublished"
  | "supplier.created"
  | "supplier.updated"
  | "supplier.deleted"
  | "automation_rule.created"
  | "automation_rule.updated"
  | "automation_rule.deleted"
  | "integration.connected"
  | "integration.disconnected"
  | "billing.subscription_created"
  | "billing.subscription_cancelled"
  | "billing.plan_changed"
  | "admin.impersonation_started"
  | "admin.impersonation_ended"
  | "admin.feature_flag_changed"
  | "admin.credit_adjusted"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "product.analysed"
  | "api_key.created"
  | "api_key.revoked"
  | "invitation.sent"
  | "invitation.accepted"
  | "data.exported"
  | "data.deleted";

export interface AuditEntry {
  action: AuditAction;
  userId?: string;
  workspaceId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function audit(entry: AuditEntry): Promise<void> {
  logger.info(
    {
      audit: true,
      action: entry.action,
      userId: entry.userId,
      workspaceId: entry.workspaceId,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      metadata: entry.metadata,
      ip: entry.ipAddress,
    },
    `AUDIT: ${entry.action}`,
  );

  try {
    await db.auditLog.create({
      data: {
        action: entry.action,
        userId: entry.userId,
        workspaceId: entry.workspaceId,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch {
    // DB unavailable in dev/build — log only
  }
}

export function createAuditContext(
  userId: string,
  workspaceId: string,
  ipAddress?: string,
) {
  return {
    log: (
      action: AuditAction,
      opts?: Omit<AuditEntry, "action" | "userId" | "workspaceId" | "ipAddress">,
    ) =>
      audit({
        action,
        userId,
        workspaceId,
        ipAddress,
        ...opts,
      }),
  };
}
