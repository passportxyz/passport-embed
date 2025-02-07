import { PassportEmbedProps } from "../hooks/usePassportScore";
import { CollapseMode } from "../widgets/Widget";
export declare const Body: ({ className, isOpen, collapseMode, connectWalletCallback, generateSignatureCallback, }: {
    className?: string;
    isOpen: boolean;
    collapseMode: CollapseMode;
} & Pick<PassportEmbedProps, "connectWalletCallback" | "generateSignatureCallback">) => import("react/jsx-runtime").JSX.Element;
