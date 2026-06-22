import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Commerce<span className="text-violet-600">Forge</span>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
}
