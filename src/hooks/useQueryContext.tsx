import { useContext } from "react";
import { QueryContext } from "../contexts/QueryContext";
import { PassportQueryProps } from "./usePassportScore";

export const useQueryContext = (): PassportQueryProps =>
  useContext(QueryContext);
