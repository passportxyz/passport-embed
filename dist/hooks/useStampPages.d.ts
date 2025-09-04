import { PassportQueryProps } from "./usePassportScore";
import { StampPage } from "./stampTypes";
export declare const usePaginatedStampPages: ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => {
    page: StampPage | null;
    nextPage: () => void;
    prevPage: () => void;
    isFirstPage: boolean;
    isLastPage: boolean;
    isLoading: boolean;
    error: Error | null;
    refetch: (options?: import("@tanstack/react-query").RefetchOptions) => Promise<import("@tanstack/react-query").QueryObserverResult<StampPage[], Error>>;
};
