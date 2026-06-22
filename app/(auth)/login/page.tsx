import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your account
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
          Create one
        </Link>
      </p>
    </>
  );
}
