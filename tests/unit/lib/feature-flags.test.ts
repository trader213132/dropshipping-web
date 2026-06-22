import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isFeatureEnabled, isFeatureEnabledSync } from "@/server/feature-flags";

describe("isFeatureEnabled", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    Object.keys(process.env).forEach((k) => {
      if (!(k in originalEnv)) delete process.env[k];
    });
    Object.assign(process.env, originalEnv);
  });

  it("returns true when env var is 'true'", async () => {
    process.env.FEATURE_FLAG_STORE_BUILDER = "true";
    expect(await isFeatureEnabled("store_builder")).toBe(true);
  });

  it("returns false when env var is 'false'", async () => {
    process.env.FEATURE_FLAG_AI_GENERATION = "false";
    expect(await isFeatureEnabled("ai_generation")).toBe(false);
  });

  it("uses default for unset flags", async () => {
    delete process.env.FEATURE_FLAG_PRODUCT_RADAR;
    // product_radar defaults to true
    expect(await isFeatureEnabled("product_radar")).toBe(true);
  });

  it("defaults unknown flags to false", async () => {
    delete process.env.FEATURE_FLAG_AUTOMATIONS;
    expect(await isFeatureEnabled("automations")).toBe(false);
  });
});

describe("isFeatureEnabledSync", () => {
  it("returns true when env var is 'true'", () => {
    process.env.FEATURE_FLAG_BILLING = "true";
    expect(isFeatureEnabledSync("billing")).toBe(true);
    delete process.env.FEATURE_FLAG_BILLING;
  });
});
