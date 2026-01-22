"use client";

import { Toggle } from "@/components/ui/Toggle";
import { PlaygroundConfig } from "@/lib/default-config";

interface LayoutSettingsProps {
  config: PlaygroundConfig;
  onChange: (updates: Partial<PlaygroundConfig>) => void;
}

const collapseModeOptions = [
  { value: "off", label: "Off" },
  { value: "shift", label: "Shift" },
  { value: "overlay", label: "Overlay" },
];

export function LayoutSettings({ config, onChange }: LayoutSettingsProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Layout
      </h3>
      <Toggle
        label="Collapse Mode"
        options={collapseModeOptions}
        value={config.collapseMode}
        onChange={(value) => onChange({ collapseMode: value as PlaygroundConfig["collapseMode"] })}
        info={
          <div className="space-y-2">
            <div><strong>Off:</strong> Widget stays fully expanded</div>
            <div><strong>Shift:</strong> Widget collapses and page content shifts up to fill the space</div>
            <div><strong>Overlay:</strong> Widget collapses with an overlay that expands on hover</div>
          </div>
        }
      />
    </div>
  );
}
