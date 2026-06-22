"use client";

import { useActionState, useTransition, startTransition, useState } from "react";
import { Key, Plus, Eye, EyeOff, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createApiKeyAction, revokeApiKeyAction } from "../actions";

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

function RevealableKey({ rawKey }: { rawKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
    toast.success("API key copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 dark:bg-emerald-950/20 dark:border-emerald-800 space-y-2">
      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
        Copy this key now — it won&apos;t be shown again
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs font-mono text-emerald-800 dark:text-emerald-300 break-all">
          {revealed ? rawKey : rawKey.slice(0, 20) + "…"}
        </code>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setRevealed(!revealed)}>
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

function RevokeButton({ workspaceSlug, keyId }: { workspaceSlug: string; keyId: string }) {
  const [pending, startRevoke] = useTransition();

  function handleRevoke() {
    startRevoke(async () => {
      await revokeApiKeyAction(workspaceSlug, keyId);
      toast.success("API key revoked");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-slate-400 hover:text-red-500"
      onClick={handleRevoke}
      disabled={pending}
      aria-label="Revoke key"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function ApiKeysSection({
  workspaceSlug,
  apiKeys,
}: {
  workspaceSlug: string;
  apiKeys: ApiKeyRow[];
}) {
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof createApiKeyAction>[1], fd: FormData) =>
      createApiKeyAction(workspaceSlug, prev, fd),
    {},
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create new API key
        </h3>
        <form
          action={(fd) => startTransition(() => action(fd))}
          className="flex items-start gap-3"
        >
          <div className="flex-1">
            <FormField label="" name="name" placeholder="Key name (e.g. Production)" error={state.error} />
          </div>
          <Button type="submit" variant="forge" size="sm" disabled={pending} isLoading={pending} className="mt-0">
            {pending ? "Creating…" : "Create"}
          </Button>
        </form>
        {state.rawKey && <RevealableKey rawKey={state.rawKey} />}
      </div>

      {apiKeys.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-8 text-center">
          <Key className="h-7 w-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No API keys yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{key.name}</p>
                  {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                    <Badge variant="destructive" className="text-xs">Expired</Badge>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">{key.prefix}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <RevokeButton workspaceSlug={workspaceSlug} keyId={key.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
