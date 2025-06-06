import { useMemo } from "react";
import { QueryContext, DEFAULT_EMBED_SERVICE_URL } from "../contexts/QueryContext";
import { PassportEmbedProps } from "../hooks/usePassportScore";

export const QueryContextProvider = ({
  children,
  apiKey,
  address,
  scorerId,
  overrideEmbedServiceUrl,
}: {
  children: React.ReactNode;
} & PassportEmbedProps) => {
  const value = useMemo(
    () => ({
      apiKey,
      address,
      scorerId,
      embedServiceUrl: overrideEmbedServiceUrl?.replace(/\/*$/, "") || DEFAULT_EMBED_SERVICE_URL,
    }),
    [apiKey, address, scorerId, overrideEmbedServiceUrl]
  );

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>;
};
