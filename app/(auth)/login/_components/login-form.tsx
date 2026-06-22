"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { loginAction } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.fieldErrors?.email}
        required
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={state.fieldErrors?.password}
        required
      />

      <Button type="submit" className="w-full" isLoading={pending}>
        Sign in
      </Button>
    </form>
  );
}
