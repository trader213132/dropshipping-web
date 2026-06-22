"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { createWorkspaceAction } from "../actions";

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createWorkspaceAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <FormField
        label="Workspace name"
        name="workspaceName"
        type="text"
        placeholder="My Brand Co."
        error={state.fieldErrors?.workspaceName}
        hint="This is the name of your team or business"
        autoFocus
        required
      />

      <Button type="submit" variant="forge" className="w-full" isLoading={pending}>
        Create workspace
      </Button>
    </form>
  );
}
