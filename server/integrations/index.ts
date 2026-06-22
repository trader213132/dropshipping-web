import { db } from "@/lib/db";
import type { Prisma, IntegrationProvider, IntegrationStatus } from "@prisma/client";

export const INTEGRATION_META: Record<
  IntegrationProvider,
  { label: string; description: string }
> = {
  SHOPIFY: {
    label: "Shopify",
    description: "Sync products, orders, and inventory with your Shopify store.",
  },
  STRIPE: {
    label: "Stripe",
    description: "Accept payments and manage subscriptions.",
  },
  ALIEXPRESS: {
    label: "AliExpress",
    description: "Source products directly from AliExpress suppliers.",
  },
  CJDROPSHIPPING: {
    label: "CJ Dropshipping",
    description: "Access CJ Dropshipping catalog and fulfillment.",
  },
  RESEND: {
    label: "Resend",
    description: "Send transactional emails for invitations and alerts.",
  },
  OPENAI: {
    label: "OpenAI",
    description: "Use GPT-4 for additional AI analysis (optional).",
  },
  ANTHROPIC: {
    label: "Anthropic",
    description: "Claude powers AI product scoring and brand generation.",
  },
};

export async function getIntegrations(workspaceId: string) {
  const existing = await db.integration.findMany({ where: { workspaceId } });
  const byProvider = Object.fromEntries(existing.map((i) => [i.provider, i]));

  return (Object.keys(INTEGRATION_META) as IntegrationProvider[]).map((provider) => ({
    provider,
    meta: INTEGRATION_META[provider]!,
    record: byProvider[provider] ?? null,
  }));
}

export async function upsertIntegration(
  workspaceId: string,
  provider: IntegrationProvider,
  status: IntegrationStatus,
  metadata?: Record<string, unknown>,
) {
  const metaJson = metadata
    ? (metadata as Prisma.InputJsonValue)
    : undefined;

  return db.integration.upsert({
    where: { workspaceId_provider: { workspaceId, provider } },
    create: {
      workspaceId,
      provider,
      status,
      ...(metaJson !== undefined ? { metadata: metaJson } : {}),
      connectedAt: status === "CONNECTED" ? new Date() : undefined,
    },
    update: {
      status,
      ...(metaJson !== undefined ? { metadata: metaJson } : {}),
      connectedAt: status === "CONNECTED" ? new Date() : undefined,
      updatedAt: new Date(),
    },
  });
}

export async function disconnectIntegration(workspaceId: string, provider: IntegrationProvider) {
  await db.integration.upsert({
    where: { workspaceId_provider: { workspaceId, provider } },
    create: { workspaceId, provider, status: "REVOKED" },
    update: { status: "REVOKED", connectedAt: null },
  });
}
