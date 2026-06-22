"use client";

import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  severity?: "error" | "warning";
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  severity = "error",
  className,
}: ErrorStateProps) {
  const Icon = severity === "warning" ? AlertTriangle : XCircle;
  const iconClass = severity === "warning" ? "text-yellow-500" : "text-destructive";

  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={cn("mb-4 h-10 w-10", iconClass)} aria-hidden="true" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
}

export function ErrorBoundaryFallback({ error, reset }: ErrorBoundaryFallbackProps) {
  return (
    <ErrorState
      title="Page error"
      message={
        process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred."
      }
      onRetry={reset}
    />
  );
}
