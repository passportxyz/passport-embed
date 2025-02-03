import { createContext, useContext, useMemo } from "react";
import { PassportEmbedProps } from "../hooks/usePassportScore";

type QueryContextValue = Pick<
  PassportEmbedProps,
  | "apiKey"
  | "address"
  | "scorerId"
  | "overrideIamUrl"
  | "challengeSignatureUrl"
  | "oAuthPopUpUrl"
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
  challengeSignatureUrl,
  oAuthPopUpUrl,
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
    }),
    [
      apiKey,
      address,
      scorerId,
      overrideIamUrl,
      challengeSignatureUrl,
      oAuthPopUpUrl,
    ]
  );

  return (
    <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
  );
};

export const useQueryContext = (): QueryContextValue =>
  useContext(QueryContext);
