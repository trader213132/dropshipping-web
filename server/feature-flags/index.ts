import { db } from "@/lib/db";

// ─── Legacy env-var API (tests + middleware use this) ────────────────────────

export type FeatureFlagKey =
  | "store_builder"
  | "ai_generation"
  | "shopify_integration"
  | "billing"
  | "analytics"
  | "automations"
  | "cro_lab"
  | "supplier_hub"
  | "creative_lab"
  | "brand_studio"
  | "product_radar"
  | "demo_mode";

const ENV_FLAG_MAP: Record<FeatureFlagKey, string> = {
  store_builder:       "FEATURE_FLAG_STORE_BUILDER",
  ai_generation:       "FEATURE_FLAG_AI_GENERATION",
  shopify_integration: "FEATURE_FLAG_SHOPIFY_INTEGRATION",
  billing:             "FEATURE_FLAG_BILLING",
  analytics:           "FEATURE_FLAG_ANALYTICS",
  automations:         "FEATURE_FLAG_AUTOMATIONS",
  cro_lab:             "FEATURE_FLAG_CRO_LAB",
  supplier_hub:        "FEATURE_FLAG_SUPPLIER_HUB",
  creative_lab:        "FEATURE_FLAG_CREATIVE_LAB",
  brand_studio:        "FEATURE_FLAG_BRAND_STUDIO",
  product_radar:       "FEATURE_FLAG_PRODUCT_RADAR",
  demo_mode:           "DEMO_MODE",
};

const LEGACY_DEFAULTS: Partial<Record<FeatureFlagKey, boolean>> = {
  product_radar: true,
  brand_studio:  true,
  store_builder: true,
  supplier_hub:  true,
  demo_mode:     true,
};

export async function isFeatureEnabled(
  flag: FeatureFlagKey,
  _context?: { workspaceId?: string; userId?: string; plan?: string },
): Promise<boolean> {
  const envKey = ENV_FLAG_MAP[flag];
  const value = process.env[envKey];
  if (value !== undefined) return value === "true" || value === "1";
  return LEGACY_DEFAULTS[flag] ?? false;
}

export function isFeatureEnabledSync(flag: FeatureFlagKey): boolean {
  const envKey = ENV_FLAG_MAP[flag];
  const value = process.env[envKey];
  return value === "true" || value === "1";
}

// ─── Phase 12: DB-backed workspace feature flags ──────────────────────────────

const FLAG_META: Record<string, { description: string; defaultEnabled: boolean }> = {
  ai_analysis:      { description: "AI-powered product opportunity scoring",          defaultEnabled: true },
  brand_studio:     { description: "AI brand kit generation",                         defaultEnabled: true },
  advanced_scoring: { description: "Extended multi-factor product scoring algorithm", defaultEnabled: true },
  ai_copywriter:    { description: "AI-generated product copy and ad content",        defaultEnabled: true },
  demand_forecast:  { description: "Demand trend forecast on product detail pages",   defaultEnabled: true },
  automation_rules: { description: "Automation rules and alert engine",               defaultEnabled: true },
  api_keys:         { description: "Workspace API key management",                    defaultEnabled: true },
  team_invitations: { description: "Team invitation links",                           defaultEnabled: true },
  integrations:     { description: "Third-party integration hub",                     defaultEnabled: true },
};

export const ALL_FLAG_KEYS = Object.keys(FLAG_META) as (keyof typeof FLAG_META)[];

export interface FlagState {
  key: string;
  enabled: boolean;
  description: string;
  workspaceOverride: boolean | null;
}

export async function checkFlag(workspaceId: string | null, flagKey: string): Promise<boolean> {
  try {
    if (workspaceId) {
      const override = await db.workspaceFeatureFlag.findUnique({
        where: { workspaceId_flagKey: { workspaceId, flagKey } },
      });
      if (override !== null) return override.enabled;
    }
    const globalFlag = await db.featureFlag.findUnique({ where: { key: flagKey } });
    if (globalFlag !== null) return globalFlag.enabled;
  } catch {
    // DB unavailable — fall through to default
  }
  return FLAG_META[flagKey]?.defaultEnabled ?? true;
}

export async function getAllFlagsForWorkspace(workspaceId: string): Promise<FlagState[]> {
  let globalFlags: Array<{ key: string; enabled: boolean }> = [];
  let workspaceOverrides: Array<{ flagKey: string; enabled: boolean }> = [];
  try {
    [globalFlags, workspaceOverrides] = await Promise.all([
      db.featureFlag.findMany({ select: { key: true, enabled: true } }),
      db.workspaceFeatureFlag.findMany({
        where: { workspaceId },
        select: { flagKey: true, enabled: true },
      }),
    ]);
  } catch { /* DB unavailable */ }

  const globalMap   = new Map(globalFlags.map((f) => [f.key, f.enabled]));
  const overrideMap = new Map(workspaceOverrides.map((f) => [f.flagKey, f.enabled]));

  return ALL_FLAG_KEYS.map((key) => ({
    key,
    enabled:           overrideMap.get(key) ?? globalMap.get(key) ?? FLAG_META[key]!.defaultEnabled,
    description:       FLAG_META[key]!.description,
    workspaceOverride: overrideMap.has(key) ? (overrideMap.get(key) ?? null) : null,
  }));
}

export async function getAllGlobalFlags(): Promise<FlagState[]> {
  let globalFlags: Array<{ key: string; enabled: boolean }> = [];
  try {
    globalFlags = await db.featureFlag.findMany({ select: { key: true, enabled: true } });
  } catch { /* DB unavailable */ }

  const dbMap = new Map(globalFlags.map((f) => [f.key, f.enabled]));
  return ALL_FLAG_KEYS.map((key) => ({
    key,
    enabled:           dbMap.get(key) ?? FLAG_META[key]!.defaultEnabled,
    description:       FLAG_META[key]!.description,
    workspaceOverride: null,
  }));
}

export async function setGlobalFlag(key: string, enabled: boolean): Promise<void> {
  await db.featureFlag.upsert({
    where: { key },
    create: { key, enabled, description: FLAG_META[key]?.description },
    update: { enabled },
  });
}

export async function setWorkspaceFlag(workspaceId: string, flagKey: string, enabled: boolean): Promise<void> {
  await db.workspaceFeatureFlag.upsert({
    where: { workspaceId_flagKey: { workspaceId, flagKey } },
    create: { workspaceId, flagKey, enabled },
    update: { enabled },
  });
}

export async function clearWorkspaceFlag(workspaceId: string, flagKey: string): Promise<void> {
  await db.workspaceFeatureFlag.deleteMany({ where: { workspaceId, flagKey } });
}
