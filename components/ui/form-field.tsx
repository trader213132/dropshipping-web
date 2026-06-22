import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          ref={ref}
          id={fieldId}
          aria-describedby={[error ? errorId : "", hint ? hintId : ""].filter(Boolean).join(" ") || undefined}
          aria-invalid={!!error}
          error={!!error}
          className={cn(className)}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";

export { FormField };
