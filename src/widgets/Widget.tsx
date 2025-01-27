import styles from "./Widget.module.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

export type CollapseMode = "shift" | "overlay" | "off";

export type GenericPassportWidgetProps = {
  children?: React.ReactNode;
  theme?: PassportWidgetTheme;
  collapseMode?: CollapseMode;
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

export const Widget = ({ children, theme }: GenericPassportWidgetProps) => {
  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <div className={styles.widget}>
      <QueryClientProvider client={widgetQueryClient}>
        {children}
      </QueryClientProvider>
    </div>
  );
};

export const widgetQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With this config, the query will be re-fetched when this tab/window
      // is refocused or after the component is mounted, and the data has
      // not been fetched for at least 1 minute
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 1,
      // The query will be garbage collected after 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
    },
  },
});

const CSS_VARIABLE_POSTFIX = "-c6dbf459";

const setCssProperty = (name: string, value?: string) => {
  value &&
    document.documentElement.style.setProperty(
      `--${name}${CSS_VARIABLE_POSTFIX}`,
      value
    );
};

const setTheme = (theme?: PassportWidgetTheme) => {
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

  propertyMap.forEach(([name, value]) => setCssProperty(name, value));
};
