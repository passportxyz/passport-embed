"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: SelectOption[];
  description?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, description, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {description && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
