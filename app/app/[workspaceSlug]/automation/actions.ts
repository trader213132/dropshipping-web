"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { createAutomationRule, deleteAutomationRule, updateAutomationRule, markAlertsRead } from "@/server/automation";
import { audit } from "@/server/audit";
import type { WorkspaceRole, RuleTrigger, RuleAction } from "@prisma/client";

const createRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(100),
  trigger: z.enum(["PRICE_DROP", "STOCK_LOW", "STOCK_OUT", "TREND_SPIKE", "OPPORTUNITY_SCORE_THRESHOLD"]),
  action: z.enum(["SEND_EMAIL", "CREATE_ALERT", "PAUSE_PRODUCT", "NOTIFY_WEBHOOK"]),
  threshold: z.string().optional(),
});

export async function createRuleAction(
  workspaceSlug: string,
  _prev: { error?: string; fieldErrors?: Record<string, string> },
  formData: FormData,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found" };

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) {
    return { error: "Only admins can create automation rules" };
  }

  const raw = {
    name: formData.get("name") as string,
    trigger: formData.get("trigger") as string,
    action: formData.get("action") as string,
    threshold: (formData.get("threshold") as string) || undefined,
  };

  const parsed = createRuleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const rule = await createAutomationRule(result.workspace.id, {
    name: parsed.data.name,
    trigger: parsed.data.trigger as RuleTrigger,
    action: parsed.data.action as RuleAction,
    config: parsed.data.threshold ? { threshold: Number(parsed.data.threshold) } : {},
  });

  await audit({
    action: "automation_rule.created",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "automation_rule",
    resourceId: rule.id,
  });

  revalidatePath(`/app/${workspaceSlug}/automation`);
  return {};
}

export async function toggleRuleAction(workspaceSlug: string, ruleId: string, enabled: boolean) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await updateAutomationRule(result.workspace.id, ruleId, { enabled });
  revalidatePath(`/app/${workspaceSlug}/automation`);
}

export async function deleteRuleAction(workspaceSlug: string, ruleId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await deleteAutomationRule(result.workspace.id, ruleId);
  await audit({
    action: "automation_rule.deleted",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "automation_rule",
    resourceId: ruleId,
  });

  revalidatePath(`/app/${workspaceSlug}/automation`);
}

export async function markAllAlertsReadAction(workspaceSlug: string, alertIds: string[]) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  await markAlertsRead(result.workspace.id, alertIds);
  revalidatePath(`/app/${workspaceSlug}/automation`);
}
