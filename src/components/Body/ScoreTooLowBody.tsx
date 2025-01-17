import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect, useState } from "react";
import { useHeaderControls } from "../../contexts/HeaderContext";

type VerifyStampsStep = "initialTooLow" | "KYC" | "biometric" | "finalTooLow";

export const ScoreTooLowBody = ({ threshold }: { threshold?: number }) => {
  const { setShowLoadingIcon, setSubtitle } = useHeaderControls();
  const [verifyStampsStep, setVerifyStampsStep] =
    useState<VerifyStampsStep>("initialTooLow");

  useEffect(() => {
    setShowLoadingIcon(true);
    setSubtitle("LOW SCORE");

    return () => {
      setShowLoadingIcon(false);
    };
  });

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>
          Your score is too low to participate.
        </div>
        <div>
          Increase your score to {threshold || 20}+ by verifying additional
          Stamps.
        </div>
      </div>
      <Button
        className={utilStyles.wFull}
        onClick={() => {
          alert("TODO: Implement this");
        }}
      >
        Add Stamps
      </Button>
    </>
  );
};
