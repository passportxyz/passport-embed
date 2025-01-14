import { createContext, useContext, useMemo, useState } from "react";
import { PassportScore } from "../hooks/usePassportScore";

export type Step =
  | "initial"
  | "checking"
  | "congrats"
  | "mint"
  | "minting"
  | "minted"
  | "verifyStamps"
  | "scoreTooLow";

type StepContextType = {
  currentStep: Step;
};

const StepContext = createContext<StepContextType>({
  currentStep: "initial",
});

export const StepContextProvider = ({
  children,
  isLoading,
  data,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  data?: PassportScore;
}) => {
  const currentStep: Step = useMemo(() => {
    if (isLoading) {
      return "checking";
    }

    if (data) {
      return data.passingScore ? "congrats" : "scoreTooLow";
    }

    return "initial";
  }, [isLoading, data]);

  const value = useMemo(
    () => ({
      currentStep,
    }),
    [currentStep]
  );

  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
};

export const useStep = (): StepContextType => useContext(StepContext);
