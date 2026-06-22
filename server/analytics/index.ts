import { db } from "@/lib/db";

export async function getWorkspaceAnalytics(workspaceId: string) {
  const [
    productStats,
    brandCount,
    activeStoreCount,
    supplierCount,
    unreadAlertCount,
    recentAlerts,
    topProducts,
    watchlistCount,
    auditLogs,
  ] = await Promise.all([
    db.product.aggregate({
      where: { workspaceId },
      _count: { id: true },
      _avg: { opportunityScore: true, trendScore: true, demandScore: true },
    }),
    db.brand.count({ where: { workspaceId, status: "ACTIVE" } }),
    db.store.count({ where: { workspaceId, status: "CONNECTED" } }),
    db.supplier.count({ where: { workspaceId } }),
    db.alert.count({ where: { workspaceId, read: false } }),
    db.alert.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, severity: true, createdAt: true, read: true },
    }),
    db.product.findMany({
      where: { workspaceId, analysisStatus: "COMPLETE" },
      orderBy: { opportunityScore: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        opportunityScore: true,
        trendScore: true,
        demandScore: true,
        competitionScore: true,
      },
    }),
    db.watchlistItem.count({ where: { workspaceId } }),
    db.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, action: true, resourceType: true, createdAt: true },
    }),
  ]);

  const analysedCount = await db.product.count({
    where: { workspaceId, analysisStatus: "COMPLETE" },
  });

  return {
    products: {
      total: productStats._count.id,
      analysed: analysedCount,
      avgOpportunityScore: productStats._avg.opportunityScore
        ? Math.round(productStats._avg.opportunityScore)
        : null,
      avgTrendScore: productStats._avg.trendScore
        ? Math.round(productStats._avg.trendScore)
        : null,
      avgDemandScore: productStats._avg.demandScore
        ? Math.round(productStats._avg.demandScore)
        : null,
    },
    brands: {
      active: brandCount,
    },
    stores: {
      connected: activeStoreCount,
    },
    suppliers: {
      total: supplierCount,
    },
    alerts: {
      unread: unreadAlertCount,
      recent: recentAlerts,
    },
    topProducts,
    watchlistCount,
    recentActivity: auditLogs,
  };
}

export type WorkspaceAnalytics = Awaited<ReturnType<typeof getWorkspaceAnalytics>>;
