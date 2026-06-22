"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { signupAction } from "../actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <FormField
        label="Full name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Alex Smith"
        error={state.fieldErrors?.name}
        required
      />

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
        autoComplete="new-password"
        placeholder="Min. 8 characters"
        error={state.fieldErrors?.password}
        hint="At least 8 characters"
        required
      />

      <Button type="submit" className="w-full" variant="forge" isLoading={pending}>
        Create account
      </Button>
    </form>
  );
}
