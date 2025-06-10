import { QueryClient } from "@tanstack/react-query";
import { RateLimitError } from "./usePassportScore";

let passportQueryClient: QueryClient;

const DEFAULT_OPTIONS = {
  queries: {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 60000,
    gcTime: 86400000,
    retry: (failureCount: number, error: unknown) => {
      if (error instanceof RateLimitError || (error instanceof Error && error.message.includes("429"))) {
        return false; // Do not retry on rate limit error
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  },
};

const getQueryClient = () => {
  if (!passportQueryClient) {
    passportQueryClient = new QueryClient({
      defaultOptions: DEFAULT_OPTIONS,
    });
  }
  return passportQueryClient;
};

export const usePassportQueryClient = () => getQueryClient();
