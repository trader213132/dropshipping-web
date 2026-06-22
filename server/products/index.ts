import { db } from "@/lib/db";
import type { ProductCategory, AnalysisStatus } from "@prisma/client";

export interface ProductFilters {
  query?: string;
  category?: ProductCategory;
  minOpportunity?: number;
  watchlistOnly?: boolean;
  sortBy?: "opportunityScore" | "trendScore" | "createdAt";
  sortDir?: "asc" | "desc";
}

export async function getProducts(workspaceId: string, filters: ProductFilters = {}) {
  const {
    query,
    category,
    minOpportunity,
    watchlistOnly,
    sortBy = "opportunityScore",
    sortDir = "desc",
  } = filters;

  return db.product.findMany({
    where: {
      workspaceId,
      ...(category ? { category } : {}),
      ...(minOpportunity ? { opportunityScore: { gte: minOpportunity } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
      ...(watchlistOnly ? { watchlistItems: { some: { workspaceId } } } : {}),
    },
    include: {
      watchlistItems: {
        where: { workspaceId },
        select: { id: true },
      },
    },
    orderBy: sortBy === "createdAt" ? { createdAt: sortDir } : { [sortBy]: { sort: sortDir, nulls: "last" } },
  });
}

export async function getProduct(workspaceId: string, productId: string) {
  return db.product.findFirst({
    where: { id: productId, workspaceId },
    include: {
      watchlistItems: {
        where: { workspaceId },
        select: { id: true },
      },
    },
  });
}

export async function createProduct(data: {
  workspaceId: string;
  name: string;
  category: ProductCategory;
  description?: string;
  costPrice?: number;
  suggestedRetailPrice?: number;
  isDemo?: boolean;
}) {
  return db.product.create({ data });
}

export async function updateProductAnalysis(
  productId: string,
  analysis: {
    trendScore: number;
    demandScore: number;
    competitionScore: number;
    opportunityScore: number;
    analysisData: object;
    analysisStatus: AnalysisStatus;
  },
) {
  return db.product.update({
    where: { id: productId },
    data: {
      ...analysis,
      analysedAt: new Date(),
    },
  });
}

export async function deleteProduct(workspaceId: string, productId: string) {
  return db.product.deleteMany({ where: { id: productId, workspaceId } });
}

export async function toggleWatchlist(
  workspaceId: string,
  productId: string,
  userId: string,
): Promise<boolean> {
  const existing = await db.watchlistItem.findUnique({
    where: { workspaceId_productId: { workspaceId, productId } },
  });

  if (existing) {
    await db.watchlistItem.delete({ where: { id: existing.id } });
    return false;
  }

  await db.watchlistItem.create({ data: { workspaceId, productId, addedById: userId } });
  return true;
}

export async function getWorkspaceProductStats(workspaceId: string) {
  const [total, watchlisted, analysed] = await Promise.all([
    db.product.count({ where: { workspaceId } }),
    db.watchlistItem.count({ where: { workspaceId } }),
    db.product.count({ where: { workspaceId, analysisStatus: "COMPLETE" } }),
  ]);

  const avgOpportunity = await db.product.aggregate({
    where: { workspaceId, analysisStatus: "COMPLETE" },
    _avg: { opportunityScore: true },
  });

  return {
    total,
    watchlisted,
    analysed,
    avgOpportunityScore: avgOpportunity._avg.opportunityScore
      ? Math.round(avgOpportunity._avg.opportunityScore)
      : null,
  };
}
