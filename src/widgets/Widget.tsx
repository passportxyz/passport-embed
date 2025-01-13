import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

export type GenericPassportWidgetProps = {
  children?: React.ReactNode;
  theme?: PassportWidgetTheme;
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
    };
  };
};

export const Widget = ({ children, theme }: GenericPassportWidgetProps) => {
  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
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

  const { colors, padding, radius } = theme;

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
    ["transition-speed", theme.transition?.speed],
    ["font-family-body", theme.font?.family?.body],
    ["font-family-heading", theme.font?.family?.heading],
  ];

  propertyMap.forEach(([name, value]) => setCssProperty(name, value));
};
