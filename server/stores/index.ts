import { db } from "@/lib/db";
import type { StorePlatform, StoreStatus } from "@prisma/client";

export async function getStores(workspaceId: string) {
  return db.store.findMany({
    where: { workspaceId },
    include: { brand: { select: { id: true, name: true, primaryColor: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStore(workspaceId: string, storeId: string) {
  return db.store.findFirst({
    where: { id: storeId, workspaceId },
    include: { brand: true },
  });
}

export async function createStore(
  workspaceId: string,
  data: {
    name: string;
    platform: StorePlatform;
    domain?: string;
    currency?: string;
    description?: string;
    brandId?: string;
  },
) {
  return db.store.create({
    data: { workspaceId, status: "PENDING", ...data },
    include: { brand: { select: { id: true, name: true } } },
  });
}

export async function updateStoreStatus(
  workspaceId: string,
  storeId: string,
  status: StoreStatus,
) {
  return db.store.update({ where: { id: storeId, workspaceId }, data: { status } });
}

export async function deleteStore(workspaceId: string, storeId: string) {
  await db.store.delete({ where: { id: storeId, workspaceId } });
}
