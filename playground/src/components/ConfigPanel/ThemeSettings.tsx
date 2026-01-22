"use client";

import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { ColorPicker } from "./ColorPicker";
import { PlaygroundConfig } from "@/lib/default-config";

interface ThemeSettingsProps {
  config: PlaygroundConfig;
  onChange: (updates: Partial<PlaygroundConfig>) => void;
}

const themePresetOptions = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "custom", label: "Custom" },
];

export function ThemeSettings({ config, onChange }: ThemeSettingsProps) {
  const updateThemeColor = (key: keyof NonNullable<PlaygroundConfig["theme"]["colors"]>, value: string) => {
    onChange({
      themePreset: "custom",
      theme: {
        ...config.theme,
        colors: {
          ...config.theme.colors,
          [key]: value,
        },
      },
    });
  };

  const updateThemeRadius = (key: keyof NonNullable<PlaygroundConfig["theme"]["radius"]>, value: string) => {
    onChange({
      themePreset: "custom",
      theme: {
        ...config.theme,
        radius: {
          ...config.theme.radius,
          [key]: value,
        },
      },
    });
  };

  const updateThemeFont = (key: keyof NonNullable<NonNullable<PlaygroundConfig["theme"]["font"]>["family"]>, value: string) => {
    onChange({
      themePreset: "custom",
      theme: {
        ...config.theme,
        font: {
          ...config.theme.font,
          family: {
            ...config.theme.font?.family,
            [key]: value,
          },
        },
      },
    });
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Theme
      </h3>
      <div className="space-y-4">
        <Toggle
          label="Preset"
          options={themePresetOptions}
          value={config.themePreset}
          onChange={(value) => onChange({ themePreset: value as PlaygroundConfig["themePreset"] })}
        />

        {config.themePreset === "custom" && (
          <>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                <ColorPicker
                  label="Primary"
                  value={config.theme.colors?.primary || "255, 255, 255"}
                  onChange={(value) => updateThemeColor("primary", value)}
                />
                <ColorPicker
                  label="Secondary"
                  value={config.theme.colors?.secondary || "109, 109, 109"}
                  onChange={(value) => updateThemeColor("secondary", value)}
                />
                <ColorPicker
                  label="Background"
                  value={config.theme.colors?.background || "0, 0, 0"}
                  onChange={(value) => updateThemeColor("background", value)}
                />
                <ColorPicker
                  label="Success"
                  value={config.theme.colors?.success || "164, 255, 169"}
                  onChange={(value) => updateThemeColor("success", value)}
                />
                <ColorPicker
                  label="Failure"
                  value={config.theme.colors?.failure || "203, 203, 203"}
                  onChange={(value) => updateThemeColor("failure", value)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Border Radius</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Widget"
                  type="text"
                  value={config.theme.radius?.widget || "16px"}
                  onChange={(e) => updateThemeRadius("widget", e.target.value)}
                  placeholder="16px"
                />
                <Input
                  label="Button"
                  type="text"
                  value={config.theme.radius?.button || "8px"}
                  onChange={(e) => updateThemeRadius("button", e.target.value)}
                  placeholder="8px"
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Typography</h4>
              <div className="space-y-2">
                <Input
                  label="Body Font"
                  type="text"
                  value={config.theme.font?.family?.body || '"Poppins", sans-serif'}
                  onChange={(e) => updateThemeFont("body", e.target.value)}
                  placeholder='"Poppins", sans-serif'
                />
                <Input
                  label="Heading Font"
                  type="text"
                  value={config.theme.font?.family?.heading || '"Poppins", sans-serif'}
                  onChange={(e) => updateThemeFont("heading", e.target.value)}
                  placeholder='"Poppins", sans-serif'
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
