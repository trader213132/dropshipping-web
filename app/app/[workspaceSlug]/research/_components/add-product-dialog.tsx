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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addProductAction } from "../actions";

const CATEGORIES = [
  { value: "ELECTRONICS",       label: "Electronics & Gadgets" },
  { value: "FASHION",           label: "Fashion & Apparel" },
  { value: "BEAUTY",            label: "Beauty & Personal Care" },
  { value: "HOME_GARDEN",       label: "Home & Garden" },
  { value: "SPORTS_OUTDOORS",   label: "Sports & Outdoors" },
  { value: "TOYS_GAMES",        label: "Toys & Games" },
  { value: "PET_SUPPLIES",      label: "Pet Supplies" },
  { value: "HEALTH_WELLNESS",   label: "Health & Wellness" },
  { value: "OFFICE_STATIONERY", label: "Office & Stationery" },
  { value: "AUTOMOTIVE",        label: "Automotive" },
  { value: "KITCHEN_DINING",    label: "Kitchen & Dining" },
  { value: "OTHER",             label: "Other" },
];

interface AddProductDialogProps {
  workspaceSlug: string;
}

export function AddProductDialog({ workspaceSlug }: AddProductDialogProps) {
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof addProductAction>[1], fd: FormData) =>
      addProductAction(workspaceSlug, prev, fd),
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="forge" size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a product to research</DialogTitle>
          <DialogDescription>
            We&apos;ll run an AI analysis and score it for opportunity, trend, demand, and competition.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => startTransition(() => action(fd))}
          className="space-y-4 mt-2"
        >
          {state.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <FormField
            label="Product name"
            name="name"
            placeholder="e.g. Portable LED Ring Light"
            error={state.fieldErrors?.name}
            required
          />

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue="OTHER"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {state.fieldErrors?.category && (
              <p role="alert" className="text-xs text-destructive">{state.fieldErrors.category}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Briefly describe the product — helps the AI give better scores."
              rows={3}
            />
          </div>

          <FormField
            label="Your cost price (USD)"
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 8.50"
            hint="Optional — used to estimate margin"
            error={state.fieldErrors?.costPrice}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="forge" disabled={pending} isLoading={pending}>
              {pending ? "Analysing…" : "Analyse product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
