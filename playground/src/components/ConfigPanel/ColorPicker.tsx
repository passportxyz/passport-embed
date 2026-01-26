"use client";

import { rgbToHex, hexToRgb } from "@/lib/config-state";

interface ColorPickerProps {
  label: string;
  value: string; // RGB string like "255, 255, 255"
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const hexValue = rgbToHex(value);

  const handleChange = (hex: string) => {
    const rgb = hexToRgb(hex);
    onChange(rgb);
  };

  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-border bg-muted text-foreground"
          placeholder="R, G, B"
        />
      </div>
    </div>
  );
}
