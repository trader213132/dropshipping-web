import type { Metadata } from "next";
import { requireAuth } from "@/server/auth/session";
import { getUserWorkspaces } from "@/server/workspace";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./_components/onboarding-form";

export const metadata: Metadata = { title: "Create your workspace" };

export default async function OnboardingPage() {
  const user = await requireAuth();
  const existing = await getUserWorkspaces(user.id);
  if (existing.length > 0) redirect(`/app/${existing[0]!.slug}/dashboard`);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Welcome, {user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Name your workspace to get started. You can change this later.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
