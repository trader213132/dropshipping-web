"use client";

import { useTransition } from "react";
import { ToggleLeft, ToggleRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { setWorkspaceFlagAction, clearWorkspaceFlagAction } from "../actions";
import type { FlagState } from "@/server/feature-flags";

interface FeatureFlagsSectionProps {
  workspaceSlug: string;
  flags: FlagState[];
}

function FlagRow({
  workspaceSlug,
  flag,
}: {
  workspaceSlug: string;
  flag: FlagState;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setWorkspaceFlagAction(workspaceSlug, flag.key, !flag.enabled);
    });
  }

  function reset() {
    startTransition(async () => {
      await clearWorkspaceFlagAction(workspaceSlug, flag.key);
    });
  }

  return (
    <div className="flex items-center justify-between p-4 opacity-100 transition-opacity">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-mono text-slate-800 dark:text-slate-200">{flag.key}</span>
          {flag.workspaceOverride !== null ? (
            <Badge variant="outline" className="text-xs text-violet-600 border-violet-300 dark:text-violet-400 dark:border-violet-700">
              workspace override
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {flag.description}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {flag.workspaceOverride !== null && (
          <button
            onClick={reset}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Reset to global default"
            aria-label={`Reset ${flag.key} to global default`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={toggle}
          disabled={isPending}
          className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          aria-label={`${flag.enabled ? "Disable" : "Enable"} ${flag.key}`}
        >
          {flag.enabled ? (
            <ToggleRight className="h-7 w-7 text-violet-600" />
          ) : (
            <ToggleLeft className="h-7 w-7" />
          )}
        </button>
      </div>
    </div>
  );
}

export function FeatureFlagsSection({ workspaceSlug, flags }: FeatureFlagsSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Feature Flags</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Override global platform settings for this workspace. Platform defaults are set by admins.
        </p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {flags.map((flag) => (
          <FlagRow key={flag.key} workspaceSlug={workspaceSlug} flag={flag} />
        ))}
      </div>
    </div>
  );
}
