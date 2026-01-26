"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  label?: string;
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  info?: ReactNode;
}

export function Toggle({ label, options, value, onChange, className = "", info }: ToggleProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showInfo && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.left - 100), // Center-ish but don't go off screen
      });
    }
  }, [showInfo]);

  return (
    <div>
      {label && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            {label}
          </label>
          {info && (
            <>
              <button
                ref={buttonRef}
                type="button"
                className="w-4 h-4 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-[10px] font-medium flex items-center justify-center transition-colors"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onClick={() => setShowInfo(!showInfo)}
              >
                ?
              </button>
              {showInfo && typeof document !== "undefined" && createPortal(
                <div
                  className="fixed z-[9999] w-72 p-3 rounded-lg bg-foreground text-background text-xs leading-relaxed shadow-lg"
                  style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                >
                  {info}
                </div>,
                document.body
              )}
            </>
          )}
        </div>
      )}
      <div className={`inline-flex p-1 rounded-lg border border-border bg-muted ${className}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              value === option.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
