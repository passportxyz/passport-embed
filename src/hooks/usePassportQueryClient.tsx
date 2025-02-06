import { QueryClient } from "@tanstack/react-query";

let passportQueryClient: QueryClient;

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

export const usePassportQueryClient = () => getQueryClient();
