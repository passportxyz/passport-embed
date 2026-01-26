"use client";

import { Input } from "@/components/ui/Input";
import { PlaygroundConfig } from "@/lib/default-config";

interface ApiSettingsProps {
  config: PlaygroundConfig;
  onChange: (updates: Partial<PlaygroundConfig>) => void;
}

export function ApiSettings({ config, onChange }: ApiSettingsProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        API Configuration
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            API Key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              placeholder="YOUR_API_KEY"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
            <a
              href="https://developer.passport.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Create
            </a>
          </div>
        </div>
        <Input
          label="Scorer ID"
          type="text"
          value={config.scorerId}
          onChange={(e) => onChange({ scorerId: e.target.value })}
          placeholder="YOUR_SCORER_ID"
        />
      </div>

      {/* Required callback note */}
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Required:</span>{" "}
          Your integration must provide{" "}
          <code className="px-1 py-0.5 rounded bg-muted text-primary text-[11px]">generateSignatureCallback</code>{" "}
          for stamp verification.{" "}
          <a
            href="https://docs.passport.xyz/building-with-passport/embed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            See docs
          </a>
        </p>
      </div>
    </div>
  );
}
