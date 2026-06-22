"use server";

import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getProduct } from "@/server/products";
import { generateCopyKit } from "@/server/ai/copywriter";
import type { CopyKit } from "@/server/ai/copywriter";

export async function generateCopyAction(
  workspaceSlug: string,
  productId: string,
  _prevState: { error?: string; kit?: CopyKit },
  _formData: FormData,
): Promise<{ error?: string; kit?: CopyKit }> {
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) return { error: "Workspace not found." };

  const product = await getProduct(result.workspace.id, productId);
  if (!product) return { error: "Product not found." };

  type AnalysisData = { targetAudience?: string };
  const analysis = product.analysisData as AnalysisData | null;

  const kit = await generateCopyKit({
    productName:    product.name,
    category:       product.category,
    description:    product.description ?? undefined,
    targetAudience: analysis?.targetAudience,
  });

  return { kit };
}
