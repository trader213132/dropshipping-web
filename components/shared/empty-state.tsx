import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className,
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {(action ?? secondaryAction) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {action && (
            <Button onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} size="sm">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
