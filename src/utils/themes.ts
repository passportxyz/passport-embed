import { PassportWidgetTheme } from "../widgets/Widget";

export const DarkTheme: PassportWidgetTheme = {
  colors: {
    // Human Passport brand: emerald accent (#10B981), near-black surface.
    primary: "255, 255, 255",
    secondary: "115, 115, 115",
    background: "10, 10, 10",
    accent: "16, 185, 129",
    error: "252, 103, 100",
    white: "255, 255, 255",
    black: "0, 0, 0",
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
      body: '"Suisse Intl", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      heading: '"Suisse Intl", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      alt: '"Suisse Intl", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  position: {
    overlayZIndex: "10",
  },
};

export const LightTheme: PassportWidgetTheme = {
  ...DarkTheme,
  colors: {
    // Human Passport brand emerald accent (#10B981). primary darkened to near-black
    // (10,10,10) so secondary/muted text (rgba over primary) clears WCAG-AA ≥4.5:1
    // on the white surface — previously 55,55,55 which failed at low alphas.
    primary: "10, 10, 10",
    secondary: "115, 115, 115",
    background: "255, 255, 255",
    accent: "16, 185, 129",
    // Real error red, legible on the light (white) surface.
    error: "220, 38, 38",
  },
};
