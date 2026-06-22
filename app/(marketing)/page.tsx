import Link from "next/link";
import { ArrowRight, Zap, BarChart3, Package, Palette, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8F8FF] dark:bg-[#08091A]">
      {/* Ambient forge glow — respects reduced motion */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
        aria-hidden="true"
      >
        <div className="forge-glow absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px] dark:bg-violet-600/15" />
        <div className="forge-glow-amber absolute -right-20 top-20 h-[400px] w-[400px] rounded-full bg-amber-400/8 blur-[100px] dark:bg-amber-400/12" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-black/5 bg-[#F8F8FF]/80 backdrop-blur-md dark:border-white/5 dark:bg-[#08091A]/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm" aria-label="CommerceForge AI — home">
            <ForgeIcon />
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Commerce<span className="text-forge-gradient">Forge</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500"
              >
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:pt-36">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-50 px-4 py-1.5 dark:border-amber-400/20 dark:bg-amber-400/5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              AI Commerce Operating System
            </span>
          </div>

          {/* Headline — three stacked imperative phrases */}
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
            <span className="block">
              Discover winning{" "}
              <span className="text-gradient-forge">products.</span>
            </span>
            <span className="mt-1 block">
              Build original{" "}
              <span className="text-gradient-forge">brands.</span>
            </span>
            <span className="mt-1 block">
              Launch with{" "}
              <span className="text-gradient-forge">confidence.</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
            CommerceForge AI brings product research, supplier intelligence, brand generation, and
            store building into one platform built for serious sellers — from solo dropshippers to
            full-scale agencies.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button
                size="xl"
                className="group w-full gap-2 bg-violet-700 text-white shadow-lg shadow-violet-700/25 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500 sm:w-auto"
              >
                Start building free
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="xl"
                className="w-full border-slate-300 text-slate-700 hover:border-slate-400 dark:border-white/10 dark:text-white dark:hover:border-white/20 sm:w-auto"
              >
                See how it works
              </Button>
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
            No credit card required · Full demo mode included
          </p>
        </div>

        {/* Dashboard preview card */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-violet-600/20 to-amber-400/10 blur-xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/8 dark:bg-slate-900">
            {/* Fake window chrome */}
            <div className="flex items-center gap-2 border-b border-black/5 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-slate-800/50">
              <span className="h-3 w-3 rounded-full bg-red-400/60" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-amber-400/60" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-green-400/60" aria-hidden="true" />
              <span className="ml-3 font-mono text-xs text-slate-400">app.commerceforge.ai/radar</span>
            </div>

            {/* Dashboard glimpse */}
            <div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-white/5">
              {/* Sidebar stub */}
              <div className="col-span-1 hidden bg-slate-50 p-4 dark:bg-slate-800/50 md:block">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-violet-600/20" />
                  <div className="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                {["Product Radar", "Brand Studio", "Store Builder", "Supplier Hub", "Analytics"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 ${i === 0 ? "bg-violet-100 dark:bg-violet-900/30" : ""}`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${i === 0 ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"}`}
                        aria-hidden="true"
                      />
                      <div
                        className={`h-2.5 rounded-full ${i === 0 ? "w-24 bg-violet-700" : "bg-slate-200 dark:bg-slate-700"}`}
                        style={{ width: [96, 72, 80, 64, 56][i] }}
                        aria-hidden="true"
                      />
                    </div>
                  ),
                )}
              </div>

              {/* Main panel */}
              <div className="col-span-3 bg-white p-5 dark:bg-slate-900 md:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="mb-1 h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-48 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-violet-600/80" />
                </div>

                {/* Fake product cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { score: 87, label: "High opportunity", color: "text-emerald-600 dark:text-emerald-400" },
                    { score: 73, label: "Growing trend", color: "text-amber-600 dark:text-amber-400" },
                    { score: 91, label: "Top pick", color: "text-violet-600 dark:text-violet-400" },
                  ].map(({ score, label, color }, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-800/60"
                    >
                      <div className="mb-2 h-16 rounded-lg bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                      <div className="mb-1 h-2.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${color}`}>{label}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo badge */}
            <div className="flex justify-end border-t border-black/5 bg-amber-50 px-4 py-2 dark:border-white/5 dark:bg-amber-400/5">
              <Badge variant="demo" className="text-xs">
                Demo data — not connected to live sources
              </Badge>
            </div>
          </div>
        </div>

        {/* Social proof stats */}
        <div className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900 sm:grid-cols-4">
            {[
              { value: "50K+", label: "Products analysed" },
              { value: "1,200+", label: "Stores launched" },
              { value: "98%", label: "Uptime SLA" },
              { value: "4.9★", label: "Average rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-black/5 bg-slate-50 dark:border-white/5 dark:bg-white/2"
      >
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              The workflow
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              From idea to income — in one platform
            </h2>
          </div>

          <ol className="relative" aria-label="CommerceForge AI workflow steps">
            <div
              className="absolute left-6 top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-violet-600 via-amber-400 to-transparent sm:block"
              aria-hidden="true"
            />
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative mb-10 sm:ml-16">
                <div className="absolute -left-16 hidden items-center justify-center sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-violet-600 bg-white text-xs font-bold text-violet-700 dark:border-violet-500 dark:bg-[#08091A] dark:text-violet-400">
                    {i + 1}
                  </span>
                </div>
                <div className="rounded-xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-slate-900">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Pricing
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Start free. Scale when you&apos;re ready.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.featured
                  ? "border-violet-500 bg-violet-700 text-white shadow-xl shadow-violet-700/20"
                  : "border-black/5 bg-white dark:border-white/5 dark:bg-slate-900"
              }`}
            >
              <div className="mb-6">
                <p
                  className={`mb-1 text-xs font-semibold uppercase tracking-widest ${
                    plan.featured ? "text-violet-200" : "text-violet-600 dark:text-violet-400"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={`text-sm ${plan.featured ? "text-violet-200" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm ${plan.featured ? "text-violet-100" : "text-slate-600 dark:text-slate-400"}`}
                >
                  {plan.description}
                </p>
              </div>
              <ul className="mb-8 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      plan.featured ? "text-violet-100" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`mt-0.5 text-xs font-bold ${plan.featured ? "text-amber-400" : "text-violet-500"}`}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  className={`w-full ${
                    plan.featured
                      ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                      : "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-violet-700 px-8 py-16 text-center dark:bg-violet-900">
          <div
            className="pointer-events-none absolute inset-0 motion-reduce:hidden"
            aria-hidden="true"
          >
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to forge your next brand?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-violet-100">
              CommerceForge AI is free to start. No credit card. Full demo data loaded so you can
              explore every feature on day one.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button
                  size="xl"
                  className="group w-full gap-2 bg-amber-400 text-slate-900 hover:bg-amber-300 sm:w-auto"
                >
                  Start for free
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="xl"
                  className="w-full text-violet-100 hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Already have an account?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <ForgeIcon />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                CommerceForge AI
              </span>
            </div>
            <p className="text-center text-xs text-slate-500">
              © {new Date().getFullYear()} CommerceForge AI. All demand estimates are clearly labeled
              and not financial advice. Trademark review required for brand names.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .font-display {
          font-family: var(--font-syne, var(--font-sans));
        }
        .text-forge-gradient,
        .text-gradient-forge {
          background: linear-gradient(135deg, #F59E0B 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .forge-glow {
          animation: forge-pulse 8s ease-in-out infinite alternate;
        }
        .forge-glow-amber {
          animation: forge-pulse 10s ease-in-out infinite alternate-reverse;
        }
        @keyframes forge-pulse {
          0% { transform: scale(1) translate(0, 0); opacity: 0.6; }
          100% { transform: scale(1.15) translate(20px, -20px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .forge-glow, .forge-glow-amber { animation: none; }
        }
      `}</style>
    </div>
  );
}

function ForgeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="url(#forge-grad)" />
      <path
        d="M8 20L14 8L20 20"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16H18"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="forge-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D28D9" />
          <stop offset="1" stopColor="#4C1D95" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    >
      {children}
    </a>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="group rounded-xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-md dark:border-white/5 dark:bg-slate-900 dark:hover:border-violet-500/20">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {badge && (
          <Badge variant="forge" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Everything you need to explore and validate your first product idea.",
    featured: false,
    cta: "Get started free",
    features: [
      "10 products with AI scoring",
      "Demo AI brand generation",
      "1 workspace",
      "Basic supplier tracking",
      "Community support",
    ],
  },
  {
    name: "Growth",
    price: "$29",
    period: "/mo",
    description: "For serious sellers ready to build a real brand and scale.",
    featured: true,
    cta: "Start free trial",
    features: [
      "Unlimited products",
      "Real AI brand generation",
      "AI copy generator",
      "Automation rules & alerts",
      "Team invitations (up to 5)",
      "API access",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For agencies and large teams running multiple brands.",
    featured: false,
    cta: "Contact sales",
    features: [
      "Everything in Growth",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label option",
    ],
  },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Product Radar",
    description:
      "Find potentially promising products with the transparent Forge Score — a configurable 0–100 rating that shows its math, not just a number.",
    badge: "AI-Powered",
  },
  {
    icon: Package,
    title: "Supplier Hub",
    description:
      "Compare suppliers side by side. Landed cost, delivery estimates, quality ratings, and reliability scores — all in one view.",
    badge: "Verified",
  },
  {
    icon: Palette,
    title: "Brand Studio",
    description:
      "Generate a complete brand identity: name ideas, voice, personas, color palette, and messaging pillars. Versioned, editable, yours.",
    badge: "AI-Powered",
  },
  {
    icon: Store,
    title: "Store Builder",
    description:
      "Generate a complete storefront from your brand and product. Visual editing, mobile preview, and shareable draft links.",
    badge: "Built-in",
  },
  {
    icon: Zap,
    title: "Creative Lab",
    description:
      "AI-assisted copy for ads, emails, product pages, and UGC briefs — brand-voice-enforced and claim-scanned before you publish.",
    badge: "Included",
  },
  {
    icon: BarChart3,
    title: "Analytics + CRO",
    description:
      "Track performance, run experiments, and audit your store for conversion and SEO issues — with evidence-based suggestions.",
    badge: "Pro",
  },
];

const STEPS = [
  {
    icon: TrendingUp,
    title: "Research products with the Forge Score",
    description:
      "Browse the Product Radar for opportunities. Every score breaks down into transparent components — demand, margin, competition, ad activity, and risk — so you know exactly why a product is rated high or low.",
  },
  {
    icon: Package,
    title: "Compare suppliers and validate margin",
    description:
      "Add suppliers, compare landed cost to your target market, and track quality through the sample order workflow. No guessing on margin before you commit.",
  },
  {
    icon: Palette,
    title: "Generate a brand identity",
    description:
      "Turn your product and niche into a full brand direction: positioning, voice, color palette, personas, and copy pillars. Generate multiple versions, compare them, and iterate.",
  },
  {
    icon: Store,
    title: "Build and preview your store",
    description:
      "Generate a complete storefront from your brand and product. Edit visually, preview on mobile, share a draft link with clients — then publish to Shopify when ready.",
  },
  {
    icon: BarChart3,
    title: "Measure and optimize",
    description:
      "Connect analytics, run experiments, and use the CRO lab to find conversion blockers. Insights show the data they are based on — no fabricated metrics.",
  },
];
