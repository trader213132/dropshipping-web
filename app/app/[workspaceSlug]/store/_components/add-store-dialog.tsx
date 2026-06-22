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
import { addStoreAction } from "../actions";

export function AddStoreDialog({ workspaceSlug }: { workspaceSlug: string }) {
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof addStoreAction>[1], fd: FormData) =>
      addStoreAction(workspaceSlug, prev, fd),
    {},
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="forge" size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add store
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a store</DialogTitle>
          <DialogDescription>
            Connect your e-commerce store to sync products and track performance.
          </DialogDescription>
        </DialogHeader>
        <form action={(fd) => startTransition(() => action(fd))} className="space-y-4 mt-2">
          {state.error && (
            <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <FormField
            label="Store name"
            name="name"
            placeholder="e.g. My Fashion Store"
            error={state.fieldErrors?.name}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="platform">Platform</Label>
            <select
              id="platform"
              name="platform"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="MANUAL">Manual / Custom</option>
              <option value="SHOPIFY">Shopify</option>
              <option value="WOOCOMMERCE">WooCommerce</option>
            </select>
          </div>
          <FormField
            label="Domain"
            name="domain"
            placeholder="e.g. mystore.myshopify.com"
            hint="Optional — your store's URL"
            error={state.fieldErrors?.domain}
          />
          <FormField
            label="Currency"
            name="currency"
            defaultValue="USD"
            placeholder="USD"
            maxLength={3}
            hint="3-letter code (USD, EUR, GBP…)"
            error={state.fieldErrors?.currency}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="forge" disabled={pending} isLoading={pending}>
              {pending ? "Adding…" : "Add store"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
