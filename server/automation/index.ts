import { db } from "@/lib/db";
import type { Prisma, RuleTrigger, RuleAction, AlertSeverity } from "@prisma/client";

export async function getAutomationRules(workspaceId: string) {
  return db.automationRule.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAutomationRule(
  workspaceId: string,
  data: {
    name: string;
    trigger: RuleTrigger;
    action: RuleAction;
    config: Record<string, unknown>;
    enabled?: boolean;
  },
) {
  return db.automationRule.create({
    data: {
      workspaceId,
      enabled: true,
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      config: data.config as Prisma.InputJsonValue,
    },
  });
}

export async function updateAutomationRule(
  workspaceId: string,
  ruleId: string,
  data: Partial<{
    name: string;
    enabled: boolean;
    config: Record<string, unknown>;
  }>,
) {
  return db.automationRule.update({
    where: { id: ruleId, workspaceId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.config !== undefined ? { config: data.config as Prisma.InputJsonValue } : {}),
    },
  });
}

export async function deleteAutomationRule(workspaceId: string, ruleId: string) {
  await db.automationRule.delete({ where: { id: ruleId, workspaceId } });
}

export async function getAlerts(workspaceId: string, unreadOnly = false) {
  return db.alert.findMany({
    where: { workspaceId, ...(unreadOnly ? { read: false } : {}) },
    include: { rule: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createAlert(
  workspaceId: string,
  data: {
    title: string;
    message: string;
    severity?: AlertSeverity;
    ruleId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  return db.alert.create({
    data: {
      workspaceId,
      severity: "INFO",
      title: data.title,
      message: data.message,
      ...(data.severity ? { severity: data.severity } : {}),
      ...(data.ruleId ? { ruleId: data.ruleId } : {}),
      ...(data.metadata ? { metadata: data.metadata as Prisma.InputJsonValue } : {}),
    },
  });
}

export async function markAlertsRead(workspaceId: string, alertIds: string[]) {
  await db.alert.updateMany({
    where: { id: { in: alertIds }, workspaceId },
    data: { read: true },
  });
}

export async function getUnreadAlertCount(workspaceId: string) {
  return db.alert.count({ where: { workspaceId, read: false } });
}
