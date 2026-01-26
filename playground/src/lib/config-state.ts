import { PlaygroundConfig, defaultConfig, defaultTheme, lightTheme } from "./default-config";

// Encode config to URL-safe base64
export function encodeConfigToUrl(config: PlaygroundConfig): string {
  try {
    const json = JSON.stringify(config);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

// Decode config from URL-safe base64
export function decodeConfigFromUrl(encoded: string): PlaygroundConfig | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as PlaygroundConfig;
  } catch {
    return null;
  }
}

// Get config from URL search params
export function getConfigFromUrl(): PlaygroundConfig {
  if (typeof window === "undefined") return defaultConfig;

  const params = new URLSearchParams(window.location.search);
  const encodedConfig = params.get("config");

  if (encodedConfig) {
    const decoded = decodeConfigFromUrl(encodedConfig);
    if (decoded) return decoded;
  }

  // Check for individual params as fallback
  return {
    ...defaultConfig,
    scenario: params.get("scenario") || defaultConfig.scenario,
    collapseMode: (params.get("collapseMode") as PlaygroundConfig["collapseMode"]) || defaultConfig.collapseMode,
    themePreset: (params.get("theme") as PlaygroundConfig["themePreset"]) || defaultConfig.themePreset,
  };
}

// Update URL with config
export function updateUrlWithConfig(config: PlaygroundConfig): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const encoded = encodeConfigToUrl(config);

  if (encoded) {
    url.searchParams.set("config", encoded);
  }

  window.history.replaceState({}, "", url.toString());
}

// Get theme based on preset
export function getThemeForPreset(
  preset: PlaygroundConfig["themePreset"],
  customTheme?: PlaygroundConfig["theme"]
): PlaygroundConfig["theme"] {
  switch (preset) {
    case "light":
      return lightTheme;
    case "custom":
      return customTheme || defaultTheme;
    case "dark":
    default:
      return defaultTheme;
  }
}

// Parse RGB string to object
export function parseRgb(rgb: string): { r: number; g: number; b: number } {
  const parts = rgb.split(",").map((p) => parseInt(p.trim(), 10));
  return {
    r: parts[0] || 0,
    g: parts[1] || 0,
    b: parts[2] || 0,
  };
}

// Format RGB object to string
export function formatRgb(rgb: { r: number; g: number; b: number }): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

// Convert RGB to hex for color input
export function rgbToHex(rgb: string): string {
  const { r, g, b } = parseRgb(rgb);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Convert hex to RGB string
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
