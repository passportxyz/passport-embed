import type { PassportWidgetTheme, CollapseMode } from "@human.tech/passport-embed";

export interface PlaygroundConfig {
  // API Settings
  apiKey: string;
  scorerId: string;
  overrideEmbedServiceUrl: string;

  // Layout Options
  collapseMode: CollapseMode;
  className: string;

  // Theme Settings
  themePreset: "dark" | "light" | "custom";
  theme: PassportWidgetTheme;

  // Testing
  scenario: string;
}

export const defaultTheme: PassportWidgetTheme = {
  colors: {
    primary: "255, 255, 255",
    secondary: "109, 109, 109",
    background: "0, 0, 0",
    success: "164, 255, 169",
    failure: "203, 203, 203",
  },
  padding: {
    widget: {
      x: "20px",
      y: "12px",
    },
  },
  radius: {
    widget: "16px",
    button: "8px",
  },
  transition: {
    speed: "50ms",
  },
  font: {
    family: {
      body: '"Poppins", sans-serif',
      heading: '"Poppins", sans-serif',
      alt: '"DM Mono", sans-serif',
    },
  },
  position: {
    overlayZIndex: "10",
  },
};

export const lightTheme: PassportWidgetTheme = {
  ...defaultTheme,
  colors: {
    primary: "55, 55, 55",
    secondary: "201, 201, 201",
    background: "255, 255, 255",
    success: "36, 212, 83",
    failure: "55, 55, 55",
  },
};

// Use test values when MSW is enabled, empty otherwise
const isMswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

export const defaultConfig: PlaygroundConfig = {
  apiKey: isMswEnabled ? "test-api-key" : "",
  scorerId: isMswEnabled ? "123" : "",
  overrideEmbedServiceUrl: "",
  collapseMode: "off",
  className: "",
  themePreset: "dark",
  theme: defaultTheme,
  scenario: "low-score",
};

export const scenarios = [
  { value: "low-score", label: "Low Score", description: "User below threshold (12.5)" },
  { value: "high-score", label: "High Score", description: "User above threshold (25.0)" },
];
