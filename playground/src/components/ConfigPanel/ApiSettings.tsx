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
        <Input
          label="API Key"
          type="text"
          value={config.apiKey}
          onChange={(e) => onChange({ apiKey: e.target.value })}
          placeholder="YOUR_API_KEY"
        />
        <Input
          label="Scorer ID"
          type="text"
          value={config.scorerId}
          onChange={(e) => onChange({ scorerId: e.target.value })}
          placeholder="YOUR_SCORER_ID"
        />
        <Input
          label="Custom Service URL"
          type="text"
          value={config.overrideEmbedServiceUrl}
          onChange={(e) => onChange({ overrideEmbedServiceUrl: e.target.value })}
          placeholder="https://..."
          description="Override the default embed service URL"
        />
      </div>
    </div>
  );
}
