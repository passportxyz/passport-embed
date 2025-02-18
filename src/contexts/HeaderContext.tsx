// Use through the `useHeaderControls` hook

import { createContext } from "react";

export type HeaderContextValue = {
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
};

export const HeaderContext = createContext<HeaderContextValue>({
  subtitle: "",
  setSubtitle: () => {},
});
