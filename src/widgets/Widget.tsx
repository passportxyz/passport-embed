import styles from "./Widget.module.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RefObject, useEffect, useRef } from "react";
import { usePassportQueryClient } from "../hooks/usePassportQueryClient";

export type CollapseMode = "shift" | "overlay" | "off";

export type GenericPassportWidgetProps = {
  children?: React.ReactNode;
  theme?: PassportWidgetTheme;
  collapseMode?: CollapseMode;
  className?: string;
};

export type PassportWidgetTheme = {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    success?: string;
    failure?: string;
  };
  padding?: {
    widget?: {
      x?: string;
      y?: string;
    };
  };
  radius?: {
    widget?: string;
    button?: string;
  };
  transition?: {
    speed?: string;
  };
  font?: {
    family?: {
      body?: string;
      heading?: string;
      alt?: string;
    };
  };
  position?: {
    overlayZIndex?: string;
  };
};

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

export const Widget = ({
  children,
  theme,
  className,
}: GenericPassportWidgetProps) => {
  const queryClient = usePassportQueryClient();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme({ theme, ref: widgetRef });
  }, [theme]);

  return (
    <div className={`${styles.widget} ${className}`} ref={widgetRef}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
};

const CSS_VARIABLE_POSTFIX = "-c6dbf459";

const setCssProperty = ({
  ref,
  name,
  value,
}: {
  ref: RefObject<HTMLElement>;
  name: string;
  value?: string;
}) => {
  value &&
    ref.current &&
    ref.current.style.setProperty(`--${name}${CSS_VARIABLE_POSTFIX}`, value);
};

const setTheme = ({
  theme,
  ref,
}: {
  theme?: PassportWidgetTheme;
  ref: RefObject<HTMLElement>;
}) => {
  if (!theme) return;

  const { colors, padding, radius, transition, font, position } = theme;

  const propertyMap: [string, string | undefined][] = [
    ["color-primary", colors?.primary],
    ["color-secondary", colors?.secondary],
    ["color-background", colors?.background],
    ["color-success", colors?.success],
    ["color-failure", colors?.failure],
    ["widget-padding-x", padding?.widget?.x],
    ["widget-padding-y", padding?.widget?.y],
    ["widget-radius", radius?.widget],
    ["button-radius", radius?.button],
    ["transition-speed", transition?.speed],
    ["font-family-body", font?.family?.body],
    ["font-family-heading", font?.family?.heading],
    ["font-family-alt", font?.family?.alt],
    ["overlay-z-index", position?.overlayZIndex],
  ];

  propertyMap.forEach(([name, value]) => setCssProperty({ ref, name, value }));
};
