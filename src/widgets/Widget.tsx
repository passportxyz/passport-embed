import styles from "./Widget.module.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RefObject, useEffect, useRef } from "react";
import { usePassportQueryClient } from "../hooks/usePassportQueryClient";

export type CollapseMode = "shift" | "overlay" | "off";

export type GenericPassportWidgetProps = {
  theme?: PassportWidgetTheme;
  collapseMode?: CollapseMode;
  className?: string;
};

export type PassportWidgetTheme = {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    accent: string;
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

export const Widget = ({ children, theme, className }: GenericPassportWidgetProps & { children: React.ReactNode }) => {
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

const setCssProperty = ({ ref, name, value }: { ref: RefObject<HTMLElement>; name: string; value?: string }) => {
  if (value && ref.current) ref.current.style.setProperty(`--${name}${CSS_VARIABLE_POSTFIX}`, value);
};

const setTheme = ({ theme, ref }: { theme?: PassportWidgetTheme; ref: RefObject<HTMLElement> }) => {
  if (!theme) return;

  const { colors, padding, radius, transition, font, position } = theme;

  const propertyMap: [string, string | undefined][] = [
    ["color-primary", colors?.primary],
    ["color-secondary", colors?.secondary],
    ["color-background", colors?.background],
    ["color-accent", colors?.accent],
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
