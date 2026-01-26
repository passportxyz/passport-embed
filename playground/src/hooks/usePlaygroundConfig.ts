"use client";

import { useState, useCallback, useEffect } from "react";
import {
  PlaygroundConfig,
  defaultConfig,
  defaultTheme,
  lightTheme,
} from "@/lib/default-config";
import {
  getConfigFromUrl,
  updateUrlWithConfig,
  getThemeForPreset,
} from "@/lib/config-state";

export function usePlaygroundConfig() {
  const [config, setConfigState] = useState<PlaygroundConfig>(defaultConfig);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize config from URL on mount
  useEffect(() => {
    const urlConfig = getConfigFromUrl();
    setConfigState(urlConfig);
    setIsInitialized(true);
  }, []);

  // Update URL when config changes
  useEffect(() => {
    if (isInitialized) {
      updateUrlWithConfig(config);
    }
  }, [config, isInitialized]);

  // Update config with partial values
  const setConfig = useCallback((updates: Partial<PlaygroundConfig>) => {
    // Update URL for scenario changes BEFORE state update so MSW picks it up
    // This must be outside the state setter to avoid "setState during render" errors
    if (updates.scenario && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("scenario", updates.scenario);
      window.history.replaceState({}, "", url.toString());
    }

    setConfigState((prev) => {
      const newConfig = { ...prev, ...updates };

      // Auto-update theme when preset changes
      if (updates.themePreset && updates.themePreset !== prev.themePreset) {
        if (updates.themePreset === "dark") {
          newConfig.theme = defaultTheme;
        } else if (updates.themePreset === "light") {
          newConfig.theme = lightTheme;
        }
        // For custom, keep the current theme
      }

      return newConfig;
    });
  }, []);

  // Reset to defaults
  const resetConfig = useCallback(() => {
    setConfigState(defaultConfig);
  }, []);

  // Get the effective theme
  const effectiveTheme = getThemeForPreset(config.themePreset, config.theme);

  // Copy shareable URL
  const copyShareableUrl = useCallback(async () => {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    }
    return false;
  }, []);

  return {
    config,
    setConfig,
    resetConfig,
    effectiveTheme,
    copyShareableUrl,
    isInitialized,
  };
}
