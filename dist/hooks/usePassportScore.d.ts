import { QueryObserverResult } from "@tanstack/react-query";
export type PassportEmbedProps = {
    apiKey: string;
    scorerId: string;
    address?: string;
    connectWalletCallback?: () => Promise<void>;
    generateSignatureCallback?: (message: string) => Promise<string | undefined>;
    overrideEmbedServiceUrl?: string;
};
export type PassportQueryProps = Pick<PassportEmbedProps, "apiKey" | "address" | "scorerId"> & {
    embedServiceUrl: PassportEmbedProps["overrideEmbedServiceUrl"];
};
type PassportProviderPoints = {
    score: number;
    dedup: boolean;
    expirationDate: Date;
};
export type PassportScore = {
    address: string;
    score: number;
    passingScore: boolean;
    lastScoreTimestamp: Date;
    expirationTimestamp: Date;
    threshold: number;
    stamps: Record<string, PassportProviderPoints>;
};
export type PassportEmbedResult = {
    data: PassportScore | undefined;
    isPending: boolean;
    isFetching: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
    refetch: () => Promise<QueryObserverResult<PassportScore | undefined, Error>>;
};
export declare const useWidgetPassportScoreAndVerifyCredentials: () => {
    data: PassportScore | undefined;
};
export declare class RateLimitError extends Error {
    constructor(message: string);
}
export declare const useWidgetPassportScore: () => PassportEmbedResult;
export declare const useWidgetVerifyCredentials: () => import("@tanstack/react-query").UseMutationResult<PassportScore, Error, void, unknown>;
export declare const useWidgetIsQuerying: () => boolean;
export declare const useResetWidgetPassportScore: () => {
    resetPassportScore: () => void;
};
export declare const usePassportScore: ({ apiKey, address, scorerId, embedServiceUrl, }: PassportQueryProps) => PassportEmbedResult;
export {};
