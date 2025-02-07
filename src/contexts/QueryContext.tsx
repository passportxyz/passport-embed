// Use this through the `useQueryContext` hook

import { createContext } from "react";
import { PassportQueryProps } from "../hooks/usePassportScore";

export const DEFAULT_EMBED_SERVICE_URL = "https://embed.passport.xyz";

export const QueryContext = createContext<PassportQueryProps>({
  apiKey: "",
  scorerId: "",
  embedServiceUrl: DEFAULT_EMBED_SERVICE_URL,
});
