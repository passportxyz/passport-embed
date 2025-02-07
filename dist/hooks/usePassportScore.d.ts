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
    error: unknown;
};
export declare const useWidgetPassportScore: () => PassportEmbedResult;
export declare const useWidgetVerifyCredentials: () => {
    verifyCredentials: (credentialIds: string[]) => void;
};
export declare const useWidgetIsQuerying: () => boolean;
export declare const useResetWidgetPassportScore: () => {
    resetPassportScore: () => void;
};
export declare const usePassportScore: ({ apiKey, address, scorerId, embedServiceUrl, }: PassportQueryProps) => PassportEmbedResult;
export {};
