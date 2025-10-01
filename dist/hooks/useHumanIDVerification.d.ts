import { Platform } from "./stampTypes";
interface UseHumanIDVerificationParams {
    platform: Platform;
    address?: string;
    enabled?: boolean;
}
interface UseHumanIDVerificationReturn {
    isHumanIDPlatform: boolean;
    hasExistingSBT: boolean;
    isCheckingSBT: boolean;
    isVerifying: boolean;
    verifyHumanID: () => Promise<boolean>;
}
export declare const useHumanIDVerification: ({ platform, address, enabled, }: UseHumanIDVerificationParams) => UseHumanIDVerificationReturn;
export {};
