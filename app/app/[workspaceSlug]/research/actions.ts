"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { analyzeProduct } from "@/server/ai";
import { createProduct, updateProductAnalysis, toggleWatchlist, deleteProduct } from "@/server/products";
import { audit } from "@/server/audit";
import type { ProductCategory } from "@prisma/client";

const PRODUCT_CATEGORIES = [
  "ELECTRONICS", "FASHION", "BEAUTY", "HOME_GARDEN", "SPORTS_OUTDOORS",
  "TOYS_GAMES", "PET_SUPPLIES", "HEALTH_WELLNESS", "OFFICE_STATIONERY",
  "AUTOMOTIVE", "KITCHEN_DINING", "OTHER",
] as const;

const addProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  category: z.enum(PRODUCT_CATEGORIES),
  description: z.string().max(1000).optional(),
  costPrice: z.coerce.number().positive().optional(),
  suggestedRetailPrice: z.coerce.number().positive().optional(),
});

export type AddProductState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "category" | "description" | "costPrice", string>>;
};

export async function addProductAction(
  workspaceSlug: string,
  _prev: AddProductState,
  formData: FormData,
): Promise<AddProductState> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found." };
  if (!hasRole(result.membership.role, "MEMBER")) return { error: "You don't have permission to add products." };

  const parsed = addProductSchema.safeParse({
    name:                 formData.get("name"),
    category:             formData.get("category"),
    description:          formData.get("description") || undefined,
    costPrice:            formData.get("costPrice")    || undefined,
    suggestedRetailPrice: formData.get("suggestedRetailPrice") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: AddProductState["fieldErrors"] = {};
    for (const [field, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = msgs?.[0];
    }
    return { fieldErrors };
  }

  const { name, category, description, costPrice } = parsed.data;
  const { workspace } = result;

  // Create product record first
  const product = await createProduct({
    workspaceId: workspace.id,
    name,
    category: category as ProductCategory,
    description,
    costPrice,
    suggestedRetailPrice: parsed.data.suggestedRetailPrice,
  });

  // Run AI analysis
  try {
    const analysis = await analyzeProduct({ name, category, description, costPrice });

    await updateProductAnalysis(product.id, {
      trendScore:       analysis.trendScore,
      demandScore:      analysis.demandScore,
      competitionScore: analysis.competitionScore,
      opportunityScore: analysis.opportunityScore,
      analysisData:     analysis,
      analysisStatus:   "COMPLETE",
    });
  } catch {
    await updateProductAnalysis(product.id, {
      trendScore: 0, demandScore: 0, competitionScore: 0, opportunityScore: 0,
      analysisData: {},
      analysisStatus: "ERROR",
    });
  }

  await audit({
    action: "product.created",
    userId: user.id,
    workspaceId: workspace.id,
    metadata: { productId: product.id, name, category },
  });

  revalidatePath(`/app/${workspaceSlug}/research`);
  redirect(`/app/${workspaceSlug}/research/${product.id}`);
}

export async function toggleWatchlistAction(
  workspaceSlug: string,
  productId: string,
): Promise<{ watchlisted: boolean } | { error: string }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found." };

  const watchlisted = await toggleWatchlist(result.workspace.id, productId, user.id);
  revalidatePath(`/app/${workspaceSlug}/research`);
  return { watchlisted };
}

export async function deleteProductAction(
  workspaceSlug: string,
  productId: string,
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found." };
  if (!hasRole(result.membership.role, "ADMIN")) return { error: "Only admins can delete products." };

  await deleteProduct(result.workspace.id, productId);

  await audit({
    action: "product.deleted",
    userId: user.id,
    workspaceId: result.workspace.id,
    metadata: { productId },
  });

  revalidatePath(`/app/${workspaceSlug}/research`);
  redirect(`/app/${workspaceSlug}/research`);
}
