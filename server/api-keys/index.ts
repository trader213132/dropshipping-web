import { db } from "@/lib/db";
import crypto from "crypto";

function generateKey(): { raw: string; hash: string; prefix: string } {
  const raw = `forge_${crypto.randomBytes(32).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 16) + "…";
  return { raw, hash, prefix };
}

export async function createApiKey(
  workspaceId: string,
  createdById: string,
  name: string,
  expiresAt?: Date,
) {
  const { raw, hash, prefix } = generateKey();
  const apiKey = await db.apiKey.create({
    data: { workspaceId, createdById, name, keyHash: hash, prefix, expiresAt },
  });
  // Return raw only once — never stored again
  return { ...apiKey, rawKey: raw };
}

export async function getApiKeys(workspaceId: string) {
  return db.apiKey.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      createdById: true,
    },
  });
}

export async function revokeApiKey(workspaceId: string, keyId: string) {
  await db.apiKey.delete({ where: { id: keyId, workspaceId } });
}

export async function lookupApiKey(raw: string) {
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return db.apiKey.findUnique({ where: { keyHash: hash } });
}
