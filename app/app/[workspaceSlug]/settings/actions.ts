"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { createInvitation, revokeInvitation } from "@/server/invitations";
import { createApiKey, revokeApiKey } from "@/server/api-keys";
import { setWorkspaceFlag, clearWorkspaceFlag } from "@/server/feature-flags";
import { audit } from "@/server/audit";
import { db } from "@/lib/db";
import type { WorkspaceRole } from "@prisma/client";

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function updateWorkspaceAction(
  workspaceSlug: string,
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found" };

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) {
    return { error: "Only admins can update workspace settings" };
  }

  const parsed = updateWorkspaceSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid" };

  await db.workspace.update({
    where: { id: result.workspace.id },
    data: { name: parsed.data.name },
  });

  await audit({ action: "workspace.updated", userId: user.id, workspaceId: result.workspace.id });
  revalidatePath(`/app/${workspaceSlug}/settings`);
  return { success: true };
}

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["ADMIN", "MEMBER", "ANALYST", "DESIGNER", "CLIENT_READONLY"]),
});

export async function inviteMemberAction(
  workspaceSlug: string,
  _prev: { error?: string; success?: boolean; inviteUrl?: string },
  formData: FormData,
): Promise<{ error?: string; success?: boolean; inviteUrl?: string }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found" };

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) {
    return { error: "Only admins can invite members" };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid" };
  }

  const invitation = await createInvitation(
    result.workspace.id,
    user.id,
    parsed.data.email,
    parsed.data.role as WorkspaceRole,
  );

  await audit({
    action: "invitation.sent",
    userId: user.id,
    workspaceId: result.workspace.id,
    metadata: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath(`/app/${workspaceSlug}/settings`);
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  return { success: true, inviteUrl: `${baseUrl}/invite/${invitation.token}` };
}

export async function revokeInvitationAction(workspaceSlug: string, invitationId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await revokeInvitation(result.workspace.id, invitationId);
  revalidatePath(`/app/${workspaceSlug}/settings`);
}

export async function removeMemberAction(workspaceSlug: string, targetUserId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;
  if (targetUserId === user.id) return;

  const target = await db.membership.findFirst({
    where: { userId: targetUserId, workspaceId: result.workspace.id },
  });
  if (!target || target.role === "OWNER") return;

  await db.membership.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId: result.workspace.id } },
  });

  await audit({
    action: "workspace.member_removed",
    userId: user.id,
    workspaceId: result.workspace.id,
    metadata: { targetUserId },
  });

  revalidatePath(`/app/${workspaceSlug}/settings`);
}

export async function createApiKeyAction(
  workspaceSlug: string,
  _prev: { error?: string; rawKey?: string; keyPrefix?: string },
  formData: FormData,
): Promise<{ error?: string; rawKey?: string; keyPrefix?: string }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found" };

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) {
    return { error: "Only admins can create API keys" };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Key name is required" };

  const key = await createApiKey(result.workspace.id, user.id, name);

  await audit({
    action: "api_key.created",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceId: key.id,
  });

  revalidatePath(`/app/${workspaceSlug}/settings`);
  return { rawKey: key.rawKey, keyPrefix: key.prefix };
}

export async function revokeApiKeyAction(workspaceSlug: string, keyId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await revokeApiKey(result.workspace.id, keyId);

  await audit({
    action: "api_key.revoked",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceId: keyId,
  });

  revalidatePath(`/app/${workspaceSlug}/settings`);
}

export async function setWorkspaceFlagAction(
  workspaceSlug: string,
  flagKey: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found." };
  if (result.membership.role !== "OWNER") return { error: "Only the workspace owner can manage feature flags." };

  await setWorkspaceFlag(result.workspace.id, flagKey, enabled);
  await audit({
    action: "admin.feature_flag_changed",
    userId: user.id,
    workspaceId: result.workspace.id,
    metadata: { flagKey, enabled, scope: "workspace" },
  });
  revalidatePath(`/app/${workspaceSlug}/settings`);
  return {};
}

export async function clearWorkspaceFlagAction(
  workspaceSlug: string,
  flagKey: string,
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found." };
  if (result.membership.role !== "OWNER") return { error: "Only the workspace owner can manage feature flags." };

  await clearWorkspaceFlag(result.workspace.id, flagKey);
  revalidatePath(`/app/${workspaceSlug}/settings`);
  return {};
}
