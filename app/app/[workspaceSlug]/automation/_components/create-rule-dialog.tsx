"use client";

import { useActionState, startTransition } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { createRuleAction } from "../actions";

const TRIGGERS = [
  { value: "PRICE_DROP", label: "Price drop detected" },
  { value: "STOCK_LOW", label: "Stock running low" },
  { value: "STOCK_OUT", label: "Out of stock" },
  { value: "TREND_SPIKE", label: "Trend spike" },
  { value: "OPPORTUNITY_SCORE_THRESHOLD", label: "Opportunity score threshold" },
];

const ACTIONS = [
  { value: "CREATE_ALERT", label: "Create in-app alert" },
  { value: "SEND_EMAIL", label: "Send email notification" },
  { value: "PAUSE_PRODUCT", label: "Pause product listing" },
  { value: "NOTIFY_WEBHOOK", label: "POST to webhook URL" },
];

export function CreateRuleDialog({ workspaceSlug }: { workspaceSlug: string }) {
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof createRuleAction>[1], fd: FormData) =>
      createRuleAction(workspaceSlug, prev, fd),
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="forge" size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Create rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create automation rule</DialogTitle>
          <DialogDescription>
            Define a trigger and action to automate your workflow.
          </DialogDescription>
        </DialogHeader>
        <form action={(fd) => startTransition(() => action(fd))} className="space-y-4 mt-2">
          {state.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <FormField
            label="Rule name"
            name="name"
            placeholder="e.g. Low stock warning"
            error={state.fieldErrors?.name}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="trigger">When (trigger)</Label>
            <select
              id="trigger"
              name="trigger"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="action">Then (action)</Label>
            <select
              id="action"
              name="action"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <FormField
            label="Threshold value"
            name="threshold"
            type="number"
            placeholder="e.g. 10 (for stock), 70 (for score)"
            hint="Optional — numeric threshold for the trigger condition"
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="forge" disabled={pending} isLoading={pending}>
              {pending ? "Creating…" : "Create rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
