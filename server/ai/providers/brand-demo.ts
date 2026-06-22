export interface BrandKit {
  name: string;
  nameAlternatives: string[];
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontDisplay: string;
  fontBody: string;
  voiceTone: string;
  targetAudience: string;
  legalNote: string;
  description: string;
}

const LEGAL_NOTE =
  "Brand name availability requires trademark/legal review before commercial use.";

const PREFIXES = [
  "Zen", "Pure", "Nova", "Apex", "Swift", "Bold", "True", "Flow",
  "Edge", "Sage", "Peak", "Nest", "Glow", "Forge", "Bright",
];
const SUFFIXES = [
  "Wave", "Lab", "Co", "Hub", "Zone", "Wear", "Life", "Fit",
  "Style", "Base", "Works", "Craft", "Gear", "Club", "Space",
];

const PALETTES = [
  { primary: "#6366f1", secondary: "#0f172a", accent: "#f59e0b", voice: "Modern and innovative" },
  { primary: "#10b981", secondary: "#064e3b", accent: "#fbbf24", voice: "Natural and trustworthy" },
  { primary: "#1e1b4b", secondary: "#f8fafc", accent: "#c4b5fd", voice: "Elegant and premium" },
  { primary: "#ef4444", secondary: "#1e1b4b", accent: "#f97316", voice: "Bold and energetic" },
  { primary: "#0ea5e9", secondary: "#f0f9ff", accent: "#8b5cf6", voice: "Clean and approachable" },
];

const FONT_PAIRS = [
  { display: "Playfair Display", body: "Inter" },
  { display: "Space Grotesk", body: "DM Sans" },
  { display: "Syne", body: "Manrope" },
  { display: "Bebas Neue", body: "Nunito" },
  { display: "Cormorant", body: "Jost" },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateBrandKitDemo(input: {
  niche: string;
  targetAudience: string;
  vibe: string;
}): BrandKit {
  const seed = hashStr(`${input.niche}${input.targetAudience}${input.vibe}`);

  const prefix = PREFIXES[seed % PREFIXES.length]!;
  const suffix = SUFFIXES[(seed >> 3) % SUFFIXES.length]!;
  const prefix2 = PREFIXES[(seed >> 6) % PREFIXES.length]!;
  const suffix2 = SUFFIXES[(seed >> 9) % SUFFIXES.length]!;
  const prefix3 = PREFIXES[(seed >> 12) % PREFIXES.length]!;
  const suffix3 = SUFFIXES[(seed >> 15) % SUFFIXES.length]!;

  const palette = PALETTES[seed % PALETTES.length]!;
  const fonts = FONT_PAIRS[(seed >> 4) % FONT_PAIRS.length]!;

  const taglines = [
    `${input.niche} for the modern ${input.targetAudience ?? "consumer"}`,
    `Quality ${input.niche.toLowerCase()} made simple`,
    `The ${input.vibe ?? "smart"} choice for ${input.niche.toLowerCase()}`,
    `Discover better ${input.niche.toLowerCase()}`,
  ];
  const tagline = taglines[seed % taglines.length]!;

  return {
    name: `${prefix}${suffix}`,
    nameAlternatives: [`${prefix2}${suffix2}`, `${prefix3}${suffix3}`],
    tagline,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    fontDisplay: fonts.display,
    fontBody: fonts.body,
    voiceTone: palette.voice,
    targetAudience: input.targetAudience,
    legalNote: LEGAL_NOTE,
    description: `A ${input.vibe ?? "modern"} brand for ${input.niche} focused on ${input.targetAudience}.`,
  };
}
