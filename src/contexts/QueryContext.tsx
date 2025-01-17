import { createContext, useContext, useMemo } from "react";
import { PassportEmbedProps } from "../hooks/usePassportScore";

type QueryContextValue = Pick<
  PassportEmbedProps,
  "apiKey" | "address" | "scorerId" | "overrideIamUrl" | "queryClient"
>;

export const QueryContext = createContext<QueryContextValue>({
  apiKey: "",
  scorerId: "",
});

export const QueryContextProvider = ({
  children,
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  queryClient,
}: {
  children: React.ReactNode;
} & QueryContextValue) => {
  const value = useMemo(
    () => ({
      apiKey,
      address,
      scorerId,
      overrideIamUrl,
      queryClient,
    }),
    [apiKey, address, scorerId, overrideIamUrl, queryClient]
  );

  return (
    <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
  );
};

export const useQueryContext = (): QueryContextValue =>
  useContext(QueryContext);
