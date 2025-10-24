import { ReactNode } from "react";
import type { PassportWidgetTheme } from "../widgets/Widget";
export type { PassportWidgetTheme } from "../widgets/Widget";
interface ThemeContextValue {
    theme?: PassportWidgetTheme;
}
export declare const ThemeProvider: ({ theme, children }: {
    theme?: PassportWidgetTheme;
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): ThemeContextValue;
export declare function parseRgbColor(rgbString?: string): [number, number, number];
