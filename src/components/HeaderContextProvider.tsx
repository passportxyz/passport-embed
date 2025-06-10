import { useMemo, useState } from "react";
import { HeaderContext } from "../contexts/HeaderContext";

export const HeaderContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [subtitle, setSubtitle] = useState("");

  const value = useMemo(
    () => ({
      subtitle,
      setSubtitle,
    }),
    [subtitle]
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
};
