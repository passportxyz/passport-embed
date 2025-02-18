import { PassportWidgetTheme } from "../widgets/Widget";

export const DarkTheme: PassportWidgetTheme = {
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

export const LightTheme: PassportWidgetTheme = {
  ...DarkTheme,
  colors: {
    primary: "55, 55, 55",
    secondary: "201, 201, 201",
    background: "255, 255, 255",
    success: "36, 212, 83",
    failure: "55, 55, 55",
  },
};
