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
export declare const Widget: ({ children, theme, className, }: GenericPassportWidgetProps) => import("react/jsx-runtime").JSX.Element;
