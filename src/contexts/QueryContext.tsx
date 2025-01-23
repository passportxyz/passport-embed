import { createContext, useContext, useMemo } from "react";
import { PassportEmbedProps } from "../hooks/usePassportScore";
import { QueryClient } from "@tanstack/react-query";
import { widgetQueryClient } from "../widgets/Widget";

type QueryContextValue = Pick<
  PassportEmbedProps,
  | "apiKey"
  | "address"
  | "scorerId"
  | "overrideIamUrl"
  | "challengeSignatureUrl"
  | "oAuthPopUpUrl"
> & {
  queryClient: QueryClient; // This makes queryClient required
};

export const QueryContext = createContext<QueryContextValue>({
  apiKey: "",
  scorerId: "",
  queryClient: widgetQueryClient,
});

export const QueryContextProvider = ({
  children,
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  challengeSignatureUrl,
  oAuthPopUpUrl,
  queryClient,
}: {
  children: React.ReactNode;
} & PassportEmbedProps) => {
  const value = useMemo(
    () => ({
      apiKey,
      address,
      scorerId,
      overrideIamUrl,
      challengeSignatureUrl,
      oAuthPopUpUrl,
      // Use override if passed in, otherwise use the widget query client
      queryClient: queryClient || widgetQueryClient,
    }),
    [
      apiKey,
      address,
      scorerId,
      overrideIamUrl,
      challengeSignatureUrl,
      oAuthPopUpUrl,
      queryClient,
    ]
  );

  return (
    <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
  );
};

export const useQueryContext = (): QueryContextValue =>
  useContext(QueryContext);
