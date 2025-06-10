import { useContext } from "react";
import { HeaderContext, HeaderContextValue } from "../contexts/HeaderContext";

export const useHeaderControls = (): HeaderContextValue => useContext(HeaderContext);
