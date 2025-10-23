import { createContext, useContext, ReactNode } from "react";
import type { PassportWidgetTheme } from "../widgets/Widget";

export type { PassportWidgetTheme } from "../widgets/Widget";

interface ThemeContextValue {
  theme?: PassportWidgetTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ theme, children }: { theme?: PassportWidgetTheme; children: ReactNode }) => {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

// Hook to access theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper function to parse RGB color string to array
export function parseRgbColor(rgbString?: string): [number, number, number] {
  if (!rgbString) return [0, 0, 0];

  const parts = rgbString.split(",").map(s => parseInt(s.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) {
    console.warn(`Invalid RGB color string: "${rgbString}". Using black as fallback.`);
    return [0, 0, 0];
  }

  return parts as [number, number, number];
};