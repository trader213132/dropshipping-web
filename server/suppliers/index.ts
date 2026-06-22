import { db } from "@/lib/db";

export async function getSuppliers(workspaceId: string) {
  return db.supplier.findMany({
    where: { workspaceId },
    include: {
      productLinks: {
        include: { product: { select: { id: true, name: true, category: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSupplier(workspaceId: string, supplierId: string) {
  return db.supplier.findFirst({
    where: { id: supplierId, workspaceId },
    include: {
      productLinks: {
        include: { product: { select: { id: true, name: true, category: true } } },
      },
    },
  });
}

export async function createSupplier(
  workspaceId: string,
  data: {
    name: string;
    country?: string;
    website?: string;
    platform?: string;
    rating?: number;
    notes?: string;
  },
) {
  return db.supplier.create({
    data: { workspaceId, ...data },
  });
}

export async function updateSupplier(
  workspaceId: string,
  supplierId: string,
  data: Partial<{
    name: string;
    country: string;
    website: string;
    platform: string;
    rating: number;
    notes: string;
  }>,
) {
  return db.supplier.update({
    where: { id: supplierId, workspaceId },
    data,
  });
}

export async function deleteSupplier(workspaceId: string, supplierId: string) {
  await db.supplier.delete({ where: { id: supplierId, workspaceId } });
}

export async function linkProductToSupplier(
  workspaceId: string,
  productId: string,
  supplierId: string,
  data: {
    price: number;
    currency?: string;
    moq?: number;
    leadTimeDays?: number;
    url?: string;
    inStock?: boolean;
  },
) {
  const [product, supplier] = await Promise.all([
    db.product.findFirst({ where: { id: productId, workspaceId } }),
    db.supplier.findFirst({ where: { id: supplierId, workspaceId } }),
  ]);
  if (!product || !supplier) throw new Error("Product or supplier not found");

  const { price, currency, moq, leadTimeDays, url, inStock } = data;
  return db.productSupplier.upsert({
    where: { productId_supplierId: { productId, supplierId } },
    create: { productId, supplierId, price, currency, moq, leadTimeDays, url, inStock },
    update: { price, currency, moq, leadTimeDays, url, inStock },
  });
}

export async function unlinkProductFromSupplier(
  workspaceId: string,
  productId: string,
  supplierId: string,
) {
  const link = await db.productSupplier.findFirst({
    where: {
      productId,
      supplierId,
      product: { workspaceId },
    },
  });
  if (!link) return;
  await db.productSupplier.delete({ where: { id: link.id } });
}
