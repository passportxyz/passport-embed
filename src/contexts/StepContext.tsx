import { createContext, useContext, useMemo, useState } from "react";

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
  gotoStep: (step: Step) => void;
};

const StepContext = createContext<StepContextType>({
  currentStep: "initial",
  gotoStep: () => {
    throw new Error("StepContext not initialized");
  },
});

export const StepContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState<Step>("initial");

  const value = useMemo(
    () => ({
      currentStep,
      gotoStep: setCurrentStep,
    }),
    [currentStep, setCurrentStep]
  );

  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
};

export const useStep = (): StepContextType => useContext(StepContext);
