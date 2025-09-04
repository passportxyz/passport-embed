import { Platform } from "../../hooks/stampTypes";
export declare const PlatformVerification: ({ platform, onClose, generateSignatureCallback, }: {
    platform: Platform;
    onClose: () => void;
    generateSignatureCallback?: (message: string) => Promise<string | undefined>;
}) => import("react/jsx-runtime").JSX.Element;
