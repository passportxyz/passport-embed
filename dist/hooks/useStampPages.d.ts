import { PassportQueryProps } from "./usePassportScore";
import { StampPage } from "./stampTypes";
export declare const useStampPages: ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => {
    stampPages: StampPage[];
    isLoading: boolean;
    error: Error | null;
    refetch: (options?: import("@tanstack/react-query").RefetchOptions) => Promise<import("@tanstack/react-query").QueryObserverResult<StampPage[], Error>>;
};
