"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, description, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${className}`}
          {...props}
        />
        {description && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
