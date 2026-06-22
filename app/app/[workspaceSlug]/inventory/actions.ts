"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { createSupplier, deleteSupplier } from "@/server/suppliers";
import { audit } from "@/server/audit";
import type { WorkspaceRole } from "@prisma/client";

const addSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  country: z.string().max(100).optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  platform: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function addSupplierAction(
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
    country: (formData.get("country") as string | null) ?? undefined,
    website: (formData.get("website") as string | null) ?? undefined,
    platform: (formData.get("platform") as string | null) ?? undefined,
    notes: (formData.get("notes") as string | null) ?? undefined,
  };

  const parsed = addSupplierSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const supplier = await createSupplier(result.workspace.id, {
    ...parsed.data,
    website: parsed.data.website || undefined,
    platform: parsed.data.platform || undefined,
    country: parsed.data.country || undefined,
    notes: parsed.data.notes || undefined,
  });
  await audit({
    action: "supplier.created",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "supplier",
    resourceId: supplier.id,
  });

  revalidatePath(`/app/${workspaceSlug}/inventory`);
  return {};
}

export async function deleteSupplierAction(workspaceSlug: string, supplierId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await deleteSupplier(result.workspace.id, supplierId);
  await audit({
    action: "supplier.deleted",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "supplier",
    resourceId: supplierId,
  });

  revalidatePath(`/app/${workspaceSlug}/inventory`);
}
