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
import { Textarea } from "@/components/ui/textarea";
import { addSupplierAction } from "../actions";

const PLATFORMS = [
  { value: "", label: "Select platform (optional)" },
  { value: "aliexpress", label: "AliExpress" },
  { value: "cjdropshipping", label: "CJ Dropshipping" },
  { value: "spocket", label: "Spocket" },
  { value: "temu", label: "Temu" },
  { value: "alibaba", label: "Alibaba" },
  { value: "manual", label: "Manual / Direct" },
  { value: "other", label: "Other" },
];

export function AddSupplierDialog({ workspaceSlug }: { workspaceSlug: string }) {
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof addSupplierAction>[1], fd: FormData) =>
      addSupplierAction(workspaceSlug, prev, fd),
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="forge" size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a supplier</DialogTitle>
          <DialogDescription>
            Track your supply chain and link suppliers to products.
          </DialogDescription>
        </DialogHeader>
        <form action={(fd) => startTransition(() => action(fd))} className="space-y-4 mt-2">
          {state.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <FormField
            label="Supplier name"
            name="name"
            placeholder="e.g. Shenzhen Electronics Co."
            error={state.fieldErrors?.name}
            required
          />
          <FormField
            label="Country"
            name="country"
            placeholder="e.g. China"
            error={state.fieldErrors?.country}
          />
          <FormField
            label="Website"
            name="website"
            type="url"
            placeholder="https://..."
            error={state.fieldErrors?.website}
          />
          <div className="space-y-1.5">
            <Label htmlFor="platform">Platform</Label>
            <select
              id="platform"
              name="platform"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="notes" name="notes" placeholder="Minimum order, lead times, quality notes…" rows={3} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="forge" disabled={pending} isLoading={pending}>
              {pending ? "Adding…" : "Add supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
