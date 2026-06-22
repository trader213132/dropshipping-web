import { db } from "@/lib/db";
import type { BrandStatus } from "@prisma/client";
import { generateBrandKitDemo, type BrandKit } from "@/server/ai/providers/brand-demo";
import Anthropic from "@anthropic-ai/sdk";

const LEGAL_NOTE =
  "Brand name availability requires trademark/legal review before commercial use.";

async function generateBrandKitAI(input: {
  niche: string;
  targetAudience: string;
  vibe: string;
}): Promise<BrandKit> {
  const client = new Anthropic();
  const prompt = `You are a brand strategist. Generate a complete brand kit for a dropshipping business.

Niche: ${input.niche}
Target audience: ${input.targetAudience}
Desired vibe/tone: ${input.vibe}

Respond with valid JSON only, no markdown:
{
  "name": "string",
  "nameAlternatives": ["string", "string"],
  "tagline": "string (max 8 words)",
  "primaryColor": "#hexcolor",
  "secondaryColor": "#hexcolor",
  "accentColor": "#hexcolor",
  "fontDisplay": "string (Google Font name)",
  "fontBody": "string (Google Font name)",
  "voiceTone": "string",
  "targetAudience": "string",
  "description": "string (2 sentences)",
  "legalNote": "${LEGAL_NOTE}"
}

The legalNote field must always be exactly: "${LEGAL_NOTE}"`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(text) as BrandKit;
  parsed.legalNote = LEGAL_NOTE;
  return parsed;
}

export async function generateBrandKit(input: {
  niche: string;
  targetAudience: string;
  vibe: string;
}): Promise<BrandKit> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await generateBrandKitAI(input);
    } catch {
      // fall through to demo
    }
  }
  return generateBrandKitDemo(input);
}

export async function getBrands(workspaceId: string) {
  return db.brand.findMany({
    where: { workspaceId },
    include: {
      assets: { select: { id: true, type: true, url: true, data: true } },
      stores: { select: { id: true, name: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBrand(workspaceId: string, brandId: string) {
  return db.brand.findFirst({
    where: { id: brandId, workspaceId },
    include: {
      assets: true,
      stores: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function createBrand(
  workspaceId: string,
  data: {
    name: string;
    tagline?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontDisplay?: string;
    fontBody?: string;
    voiceTone?: string;
    targetAudience?: string;
    niche?: string;
    aiGenerated?: boolean;
    legalNote?: string;
  },
) {
  return db.brand.create({ data: { workspaceId, ...data } });
}

export async function createBrandFromKit(workspaceId: string, kit: BrandKit, niche: string) {
  return db.brand.create({
    data: {
      workspaceId,
      name: kit.name,
      tagline: kit.tagline,
      description: kit.description,
      primaryColor: kit.primaryColor,
      secondaryColor: kit.secondaryColor,
      accentColor: kit.accentColor,
      fontDisplay: kit.fontDisplay,
      fontBody: kit.fontBody,
      voiceTone: kit.voiceTone,
      targetAudience: kit.targetAudience,
      niche,
      aiGenerated: true,
      legalNote: kit.legalNote,
    },
  });
}

export async function updateBrand(
  workspaceId: string,
  brandId: string,
  data: Partial<{
    name: string;
    tagline: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontDisplay: string;
    fontBody: string;
    voiceTone: string;
    targetAudience: string;
    niche: string;
    status: BrandStatus;
    logoUrl: string;
  }>,
) {
  return db.brand.update({ where: { id: brandId, workspaceId }, data });
}

export async function archiveBrand(workspaceId: string, brandId: string) {
  return db.brand.update({
    where: { id: brandId, workspaceId },
    data: { status: "ARCHIVED" },
  });
}

export async function deleteBrand(workspaceId: string, brandId: string) {
  await db.brand.delete({ where: { id: brandId, workspaceId } });
}
