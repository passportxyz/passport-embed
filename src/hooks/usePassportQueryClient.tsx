import { QueryClient } from "@tanstack/react-query";

let passportQueryClient: QueryClient;

type PassportQueryClientOptions = Partial<{
  queries: Partial<{
    refetchOnWindowFocus: boolean;
    refetchOnMount: boolean;
    staleTime: number;
    gcTime: number;
    retry: number | boolean;
  }>;
}>;

const DEFAULT_OPTIONS = {
  queries: {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 60000,
    gcTime: 86400000,
    retry: 2,
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

export const __test_initializePassportQueryClient = (
  overrideOptions: PassportQueryClientOptions
) => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("This function is only for use in tests");
  }
  passportQueryClient = new QueryClient({
    defaultOptions: overrideOptions,
  });
};

export const usePassportQueryClient = () => getQueryClient();
