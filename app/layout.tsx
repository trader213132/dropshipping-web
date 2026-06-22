import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CommerceForge AI",
    template: "%s | CommerceForge AI",
  },
  description:
    "The AI-powered e-commerce operating system for modern sellers. Discover products, build brands, generate stores, and scale with confidence.",
  keywords: [
    "dropshipping",
    "e-commerce",
    "AI",
    "Shopify",
    "product research",
    "brand building",
    "store builder",
  ],
  authors: [{ name: "CommerceForge AI" }],
  creator: "CommerceForge AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "CommerceForge AI",
    description: "The AI-powered e-commerce operating system for modern sellers.",
    siteName: "CommerceForge AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CommerceForge AI",
    description: "The AI-powered e-commerce operating system for modern sellers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
