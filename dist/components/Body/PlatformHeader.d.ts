import { Platform } from "../../hooks/stampTypes";
export declare const BackButton: ({ onBack }: {
    onBack: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export declare const PlatformHeader: ({ platform, showSeeDetails, onSeeDetails, points, onBack, }: {
    platform: Platform;
    showSeeDetails: boolean;
    onSeeDetails: () => void;
    onBack?: () => void;
    points?: string;
}) => import("react/jsx-runtime").JSX.Element;
