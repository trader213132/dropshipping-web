import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start your free trial — no credit card required
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-slate-600">terms</Link> and{" "}
        <Link href="/privacy" className="underline hover:text-slate-600">privacy policy</Link>.
      </p>
    </>
  );
}
