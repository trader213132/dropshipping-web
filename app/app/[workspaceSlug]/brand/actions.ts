"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { createBrandFromKit, archiveBrand, generateBrandKit } from "@/server/brands";
import { audit } from "@/server/audit";
import type { WorkspaceRole } from "@prisma/client";

const generateBrandSchema = z.object({
  niche: z.string().min(2, "Niche is required").max(100),
  targetAudience: z.string().min(2, "Target audience is required").max(100),
  vibe: z.string().min(2, "Vibe/tone is required").max(100),
});

export async function generateBrandAction(
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
    niche: formData.get("niche") as string,
    targetAudience: formData.get("targetAudience") as string,
    vibe: formData.get("vibe") as string,
  };

  const parsed = generateBrandSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const kit = await generateBrandKit(parsed.data);
  const brand = await createBrandFromKit(result.workspace.id, kit, parsed.data.niche);

  await audit({
    action: "brand.created",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "brand",
    resourceId: brand.id,
    metadata: { aiGenerated: true, name: brand.name },
  });

  revalidatePath(`/app/${workspaceSlug}/brand`);
  redirect(`/app/${workspaceSlug}/brand/${brand.id}`);
}

export async function archiveBrandAction(workspaceSlug: string, brandId: string) {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return;

  if (!hasRole(result.membership.role as WorkspaceRole, "ADMIN")) return;

  await archiveBrand(result.workspace.id, brandId);
  await audit({
    action: "brand.archived",
    userId: user.id,
    workspaceId: result.workspace.id,
    resourceType: "brand",
    resourceId: brandId,
  });

  revalidatePath(`/app/${workspaceSlug}/brand`);
}
