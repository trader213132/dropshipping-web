"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { createStore, deleteStore } from "@/server/stores";
import { audit } from "@/server/audit";
import type { WorkspaceRole, StorePlatform } from "@prisma/client";

const addStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  platform: z.enum(["SHOPIFY", "WOOCOMMERCE", "MANUAL"]),
  domain: z.string().max(200).optional().or(z.literal("")),
  currency: z.string().length(3, "Must be 3-letter currency code").default("USD"),
  description: z.string().max(500).optional(),
});

export async function addStoreAction(
  workspaceSlug: string,
  _prev: { error?: string; fieldErrors?: Record<string, string> },
  formData: FormData,
): Promise<{ error?: string; fieldErrors?: Record<string, string> }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found" };

  if (!hasRole(result.membership.role as WorkspaceRole, "MEMBER")) {
    return { error: "Insufficient permissions" };
  }

  const raw = {
    name: formData.get("name") as string,
    platform: formData.get("platform") as string,
    domain: (formData.get("domain") as string) || undefined,
    currency: (formData.get("currency") as string) || "USD",
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = addStoreSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const store = await createStore(result.workspace.id, {
    name: parsed.data.name,
    platform: parsed.data.platform as StorePlatform,
    domain: parsed.data.domain || undefined,
    currency: parsed.data.currency,
    description: parsed.data.description || undefined,
  });

  await audit({
    action: "store.created",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "store",
    resourceId: store.id,
  });

  revalidatePath(`/app/${workspaceSlug}/store`);
  return {};
}

export async function deleteStoreAction(workspaceSlug: string, storeId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await deleteStore(result.workspace.id, storeId);
  await audit({
    action: "store.deleted",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "store",
    resourceId: storeId,
  });

  revalidatePath(`/app/${workspaceSlug}/store`);
}
