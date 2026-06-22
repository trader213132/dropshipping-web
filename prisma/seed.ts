/**
 * Seed script — creates demo data for local development.
 * Run with: pnpm db:seed
 *
 * Demo login: demo@commerceforge.ai / Demo1234!
 */

import { PrismaClient, ProductCategory, RuleTrigger, RuleAction } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CommerceForge AI demo data…");

  // ── Demo user ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Demo1234!", 12);

  const user = await db.user.upsert({
    where: { email: "demo@commerceforge.ai" },
    update: { passwordHash },
    create: {
      email:        "demo@commerceforge.ai",
      name:         "Demo User",
      passwordHash,
    },
  });
  console.log("  ✓ Demo user:", user.email);

  // ── Workspace ──────────────────────────────────────────────────────────────
  const workspace = await db.workspace.upsert({
    where: { slug: "demo-store" },
    update: {},
    create: {
      name: "Demo Store",
      slug: "demo-store",
      plan: "GROWTH",
    },
  });

  await db.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
  });
  console.log("  ✓ Workspace:", workspace.name);

  // ── Products ───────────────────────────────────────────────────────────────
  const products: Array<{
    id: string;
    name: string;
    category: ProductCategory;
    description: string;
    costPrice: number;
    suggestedRetailPrice: number;
    imageUrl: string | null;
    trendScore: number;
    demandScore: number;
    competitionScore: number;
    opportunityScore: number;
    analysisData: object;
  }> = [
    {
      id: "seed-product-posture-corrector-pro",
      name: "Posture Corrector Pro",
      category: ProductCategory.HEALTH_WELLNESS,
      description: "Adjustable shoulder brace that helps correct posture during long work sessions.",
      costPrice: 8.5,
      suggestedRetailPrice: 29.99,
      imageUrl: null,
      trendScore: 84,  demandScore: 82, competitionScore: 62, opportunityScore: 73,
      analysisData: {
        confidence: "high",
        estimatedMarginRange: "65–75%",
        targetAudience: "Remote workers and office professionals aged 25–50",
        keyStrengths: ["High search volume trending upward", "Pain point product with strong emotional hook", "Repeat purchase potential via brand loyalty"],
        keyRisks: ["Competitive market with established brands", "Customer education required", "Return rate can be high if sizing is poor"],
        reasoning: "Posture products have seen consistent search growth driven by remote work adoption. The emotional pain point creates strong buying intent.",
        demandForecast: {
          trend: "rising",
          seasonality: "Slight spike in January (New Year health resolutions) and September (back-to-office)",
          nextQuarterOutlook: "Demand signals suggest continued upward trend, supported by ongoing remote-work adoption.",
          disclaimer: "Demand forecasts are AI estimates based on general market trends. Actual demand is inherently uncertain.",
        },
      },
    },
    {
      id: "seed-product-led-sunset-lamp",
      name: "LED Sunset Lamp",
      category: ProductCategory.HOME_GARDEN,
      description: "Colour-adjustable LED projector lamp creating sunset gradient aesthetics for room decor.",
      costPrice: 12.0,
      suggestedRetailPrice: 39.99,
      imageUrl: null,
      trendScore: 78, demandScore: 74, competitionScore: 58, opportunityScore: 70,
      analysisData: {
        confidence: "medium",
        estimatedMarginRange: "60–70%",
        targetAudience: "Gen Z and millennial home decor enthusiasts, content creators aged 18–32",
        keyStrengths: ["Viral social media appeal", "Low cost, high perceived value", "Gift-friendly product"],
        keyRisks: ["Trend-driven — saturation risk", "Multiple cheap alternatives on marketplaces", "Short product lifecycle"],
        reasoning: "Aesthetic home decor lamps have been trending on TikTok and Instagram. Strong gift demand in Q4.",
        demandForecast: {
          trend: "stable",
          seasonality: "Strong Q4 peak (holiday gifting); stable baseline otherwise",
          nextQuarterOutlook: "Demand appears stable with seasonal uplift expected in Q4.",
          disclaimer: "Demand forecasts are AI estimates based on general market trends. Actual demand is inherently uncertain.",
        },
      },
    },
    {
      id: "seed-product-portable-dog-water-bottle",
      name: "Portable Dog Water Bottle",
      category: ProductCategory.PET_SUPPLIES,
      description: "One-squeeze dog water bottle with attached bowl for walks and hikes. 350ml capacity.",
      costPrice: 5.5,
      suggestedRetailPrice: 19.99,
      imageUrl: null,
      trendScore: 76, demandScore: 80, competitionScore: 55, opportunityScore: 74,
      analysisData: {
        confidence: "high",
        estimatedMarginRange: "62–72%",
        targetAudience: "Dog owners aged 22–55 who walk or hike with their pets",
        keyStrengths: ["Evergreen problem-solving product", "Strong pet owner community", "Easy to photograph and market"],
        keyRisks: ["Multiple similar products at low price points", "Quality differentiation challenging", "Seasonal demand dip in winter"],
        reasoning: "Pet spending has grown consistently year-over-year. Practical, affordable pet accessories with clear use cases perform well.",
        demandForecast: {
          trend: "rising",
          seasonality: "Spring and summer peaks (outdoor activities with pets)",
          nextQuarterOutlook: "Demand signals indicate a rising trend, with warm season likely to increase outdoor pet product purchases.",
          disclaimer: "Demand forecasts are AI estimates based on general market trends. Actual demand is inherently uncertain.",
        },
      },
    },
    {
      id: "seed-product-bamboo-cable-organiser",
      name: "Bamboo Cable Organiser",
      category: ProductCategory.OFFICE_STATIONERY,
      description: "Natural bamboo cable management box that hides power strips and cable clutter on desks.",
      costPrice: 14.0,
      suggestedRetailPrice: 44.99,
      imageUrl: null,
      trendScore: 62, demandScore: 65, competitionScore: 48, opportunityScore: 65,
      analysisData: {
        confidence: "medium",
        estimatedMarginRange: "55–65%",
        targetAudience: "Home office workers and minimalism enthusiasts aged 28–45",
        keyStrengths: ["Eco-friendly angle appeals to premium buyers", "Desk setup content drives discovery", "Moderate competition"],
        keyRisks: ["Lower urgency purchase", "Bamboo sourcing adds complexity", "Price-sensitive market segment"],
        reasoning: "Work-from-home desk setups remain popular content. Bamboo eco-products command a modest premium.",
        demandForecast: {
          trend: "stable",
          seasonality: "Back-to-work peaks in September; stable otherwise",
          nextQuarterOutlook: "Demand signals are stable. No major disruption anticipated.",
          disclaimer: "Demand forecasts are AI estimates based on general market trends. Actual demand is inherently uncertain.",
        },
      },
    },
    {
      id: "seed-product-resistance-band-set",
      name: "Resistance Band Set (5-Pack)",
      category: ProductCategory.SPORTS_OUTDOORS,
      description: "Set of 5 latex resistance bands in progressive resistance levels, with carry bag and door anchor.",
      costPrice: 6.0,
      suggestedRetailPrice: 24.99,
      imageUrl: null,
      trendScore: 72, demandScore: 76, competitionScore: 70, opportunityScore: 65,
      analysisData: {
        confidence: "high",
        estimatedMarginRange: "58–68%",
        targetAudience: "Home fitness enthusiasts and gym-goers aged 20–45",
        keyStrengths: ["High-volume evergreen search terms", "Easy to bundle and upsell", "Strong influencer marketing potential"],
        keyRisks: ["Very saturated market", "Price wars with budget alternatives", "Brand differentiation difficult"],
        reasoning: "Resistance bands are a consistently high-volume fitness product. Market is saturated but demand is stable.",
        demandForecast: {
          trend: "stable",
          seasonality: "January spike (New Year fitness resolutions); otherwise consistent",
          nextQuarterOutlook: "Stable demand expected. Opportunity exists around January if stock is positioned early.",
          disclaimer: "Demand forecasts are AI estimates based on general market trends. Actual demand is inherently uncertain.",
        },
      },
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id:                   p.id,
        workspaceId:          workspace.id,
        name:                 p.name,
        category:             p.category,
        description:          p.description,
        costPrice:            p.costPrice,
        suggestedRetailPrice: p.suggestedRetailPrice,
        imageUrl:             p.imageUrl,
        trendScore:           p.trendScore,
        demandScore:          p.demandScore,
        competitionScore:     p.competitionScore,
        opportunityScore:     p.opportunityScore,
        analysisStatus:       "COMPLETE",
        isDemo:               false,
        analysisData:         p.analysisData,
      },
    });
  }
  console.log(`  ✓ ${products.length} products`);

  // ── Suppliers ──────────────────────────────────────────────────────────────
  await db.supplier.upsert({
    where: { id: "seed-supplier-brightship" },
    update: {},
    create: {
      id:          "seed-supplier-brightship",
      workspaceId: workspace.id,
      name:        "BrightShip Trading Co.",
      platform:    "ALIEXPRESS",
      country:     "CN",
      rating:      4.6,
      website:     "https://example.com/supplier/brightship",
      notes:       "Reliable electronics and wellness supplier. Lead time 10-14 days.",
    },
  });

  await db.supplier.upsert({
    where: { id: "seed-supplier-ecoflow" },
    update: {},
    create: {
      id:          "seed-supplier-ecoflow",
      workspaceId: workspace.id,
      name:        "EcoFlow Logistics",
      platform:    "CJDROPSHIPPING",
      country:     "CN",
      rating:      4.2,
      website:     "https://example.com/supplier/ecoflow",
      notes:       "Good for eco and home products. Packaging quality is above average.",
    },
  });
  console.log("  ✓ 2 suppliers");

  // ── Brand ──────────────────────────────────────────────────────────────────
  await db.brand.upsert({
    where: { id: "seed-brand-velara" },
    update: {},
    create: {
      id:             "seed-brand-velara",
      workspaceId:    workspace.id,
      name:           "Velara",
      tagline:        "Live well, feel good.",
      niche:          "Health & wellness lifestyle",
      targetAudience: "Health-conscious adults 25-45",
      primaryColor:   "#7C3AED",
      secondaryColor: "#A78BFA",
      accentColor:    "#C4B5FD",
      fontDisplay:    "Playfair Display",
      fontBody:       "Inter",
      voiceTone:      "Warm, empowering, and science-backed without being clinical.",
      status:         "ACTIVE",
      aiGenerated:    true,
      legalNote:      "Brand name availability requires trademark/legal review before commercial use.",
    },
  });
  console.log("  ✓ Brand: Velara");

  // ── Automation rules ───────────────────────────────────────────────────────
  await db.automationRule.upsert({
    where: { id: "seed-rule-low-score" },
    update: {},
    create: {
      id:          "seed-rule-low-score",
      workspaceId: workspace.id,
      name:        "Alert when opportunity score crosses threshold",
      trigger:     RuleTrigger.OPPORTUNITY_SCORE_THRESHOLD,
      action:      RuleAction.CREATE_ALERT,
      config:      { threshold: 50, message: "Product opportunity score dropped below threshold" },
      enabled:     true,
    },
  });

  await db.automationRule.upsert({
    where: { id: "seed-rule-stock-low" },
    update: {},
    create: {
      id:          "seed-rule-stock-low",
      workspaceId: workspace.id,
      name:        "Alert on low stock",
      trigger:     RuleTrigger.STOCK_LOW,
      action:      RuleAction.CREATE_ALERT,
      config:      { message: "Supplier stock is running low — review reorder levels" },
      enabled:     true,
    },
  });
  console.log("  ✓ 2 automation rules");

  // ── Feature flags defaults ─────────────────────────────────────────────────
  const flagKeys = [
    "ai_analysis", "brand_studio", "advanced_scoring", "ai_copywriter",
    "demand_forecast", "automation_rules", "api_keys", "team_invitations", "integrations",
  ];

  for (const key of flagKeys) {
    await db.featureFlag.upsert({
      where:  { key },
      update: {},
      create: { key, enabled: true },
    });
  }
  console.log("  ✓ Feature flags initialised");

  console.log("\n✅ Seeding complete.");
  console.log("   Login:     demo@commerceforge.ai / Demo1234!");
  console.log("   Workspace: /app/demo-store");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
