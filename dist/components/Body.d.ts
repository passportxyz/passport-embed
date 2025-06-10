import { PassportEmbedProps } from "../hooks/usePassportScore";
import { CollapseMode } from "../widgets/Widget";
export declare const Body: ({ className, isOpen, collapseMode, connectWalletCallback, generateSignatureCallback, showLoading, }: {
    className?: string;
    isOpen: boolean;
    collapseMode: CollapseMode;
    showLoading?: boolean;
} & Pick<PassportEmbedProps, "connectWalletCallback" | "generateSignatureCallback">) => import("react/jsx-runtime").JSX.Element;
