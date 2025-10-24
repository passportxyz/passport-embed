import { Platform } from "../../hooks/stampTypes";
import { BackToStampsButtonProps } from "./BackToStampsButton";
import { CredentialError } from "../../hooks/usePassportScore";
type StampClaimSuccessProps = BackToStampsButtonProps & {
    platform: Platform;
    errors?: CredentialError[];
};
export declare const StampClaimResult: ({ platform, onBack, errors }: StampClaimSuccessProps) => import("react/jsx-runtime").JSX.Element;
export {};
