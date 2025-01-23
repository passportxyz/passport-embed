import { createContext, useContext, useMemo, useState } from "react";

type HeaderContextValue = {
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
};

const HeaderContext = createContext<HeaderContextValue>({
  subtitle: "",
  setSubtitle: () => {},
});

export const HeaderContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subtitle, setSubtitle] = useState("");

  const value = useMemo(
    () => ({
      subtitle,
      setSubtitle,
    }),
    [subtitle]
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
};

export const useHeaderControls = (): HeaderContextValue =>
  useContext(HeaderContext);
