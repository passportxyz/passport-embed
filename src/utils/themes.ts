import { PassportWidgetTheme } from "../widgets/Widget";

export const DarkTheme: PassportWidgetTheme = {
  colors: {
    primary: "255, 255, 255",
    secondary: "109, 109, 109",
    background: "0, 0, 0",
    accent: "0, 212, 170",
    error: "235, 48, 45",
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
    primary: "55, 55, 55",
    secondary: "200, 200, 200",
    background: "255, 255, 255",
    accent: "113, 248, 194",
    error: "55, 55, 55",
  },
};
