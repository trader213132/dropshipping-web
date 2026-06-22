"use client";

import { use, useActionState, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Sparkles, Copy, CheckCheck, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCopyAction } from "./actions";
import type { CopyKit } from "@/server/ai/copywriter";

interface Props {
  params: Promise<{ workspaceSlug: string; productId: string }>;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <><CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy</>
          )}
        </button>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}

export default function CopyPage({ params }: Props) {
  const { workspaceSlug, productId } = use(params);

  const [state, formAction, isPending] = useActionState<{ error?: string; kit?: CopyKit }, FormData>(
    (prev, fd) => generateCopyAction(workspaceSlug, productId, prev, fd),
    {},
  );

  const kit = state.kit;
  const backHref = `/app/${workspaceSlug}/research/${productId}` as Route;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus-visible:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to product
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">AI Copy Generator</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generate product listings, ads, social captions, and SEO copy in one click.
        </p>
      </div>

      {!kit && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Sparkles className="h-10 w-10 text-violet-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Generate your copy kit
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Listings, ads, social captions, email subjects, and SEO copy — tailored to this product.
          </p>
          <form action={formAction}>
            <Button type="submit" variant="forge" disabled={isPending} className="gap-2">
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate copy kit</>
              )}
            </Button>
          </form>
          {state.error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}
        </div>
      )}

      {kit && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CopyField label="Listing title"       value={kit.listingTitle} />
            </div>
            <div className="sm:col-span-2">
              <CopyField label="Listing description" value={kit.listingDescription} />
            </div>
            <CopyField label="Ad headline"        value={kit.adHeadline} />
            <CopyField label="Email subject line"  value={kit.emailSubjectLine} />
            <div className="sm:col-span-2">
              <CopyField label="Ad body"           value={kit.adBody} />
            </div>
            <div className="sm:col-span-2">
              <CopyField label="Social caption"    value={kit.socialCaption} />
            </div>
            <CopyField label="SEO title"       value={kit.seoTitle} />
            <CopyField label="SEO description" value={kit.seoDescription} />
          </div>

          <div className="flex gap-2 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              {kit.disclaimer}
            </p>
          </div>

          <form action={formAction} className="pt-2">
            <Button type="submit" variant="outline" size="sm" disabled={isPending} className="gap-2">
              {isPending ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Regenerating…</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Regenerate</>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
