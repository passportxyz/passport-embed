import { createContext, useContext, useMemo, useState } from "react";

type HeaderContextValue = {
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
  showLoadingIcon: boolean;
  setShowLoadingIcon: (showLoadingIcon: boolean) => void;
};

const HeaderContext = createContext<HeaderContextValue>({
  subtitle: "",
  setSubtitle: () => {},
  showLoadingIcon: false,
  setShowLoadingIcon: () => {},
});

export const HeaderContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subtitle, setSubtitle] = useState("");
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

  const value = useMemo(
    () => ({
      subtitle,
      setSubtitle,
      showLoadingIcon,
      setShowLoadingIcon,
    }),
    [subtitle, showLoadingIcon]
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
};

export const useHeaderControls = (): HeaderContextValue =>
  useContext(HeaderContext);
