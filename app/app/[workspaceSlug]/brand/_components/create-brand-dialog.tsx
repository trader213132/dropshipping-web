"use client";

import { useActionState, startTransition } from "react";
import { Sparkles } from "lucide-react";
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
import { generateBrandAction } from "../actions";

export function CreateBrandDialog({ workspaceSlug }: { workspaceSlug: string }) {
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof generateBrandAction>[1], fd: FormData) =>
      generateBrandAction(workspaceSlug, prev, fd),
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="forge" size="sm">
          <Sparkles className="mr-1.5 h-4 w-4" />
          Generate brand kit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate a brand kit with AI</DialogTitle>
          <DialogDescription>
            Describe your niche and we&apos;ll generate a complete brand identity — name, colors, fonts, and voice.
          </DialogDescription>
        </DialogHeader>
        <form action={(fd) => startTransition(() => action(fd))} className="space-y-4 mt-2">
          {state.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <FormField
            label="Niche / product category"
            name="niche"
            placeholder="e.g. Minimalist home decor"
            hint="The type of products you sell"
            error={state.fieldErrors?.niche}
            required
          />
          <FormField
            label="Target audience"
            name="targetAudience"
            placeholder="e.g. Young professionals aged 25-35"
            error={state.fieldErrors?.targetAudience}
            required
          />
          <FormField
            label="Brand vibe / tone"
            name="vibe"
            placeholder="e.g. Clean, modern, and aspirational"
            error={state.fieldErrors?.vibe}
            required
          />
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 dark:bg-amber-950/30 dark:text-amber-400">
            Brand name availability requires trademark/legal review before commercial use.
          </p>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="forge" disabled={pending} isLoading={pending}>
              {pending ? "Generating…" : "Generate brand kit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
