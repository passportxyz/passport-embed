import { useEffect } from "react";
import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useHeaderControls } from "../../contexts/HeaderContext";
import { Button } from "../Button";
import { useResetPassportScore } from "../../hooks/usePassportScore";

export const ErrorBody = ({ errorMessage }: { errorMessage: string }) => {
  const { setSubtitle } = useHeaderControls();
  const { resetPassportScore } = useResetPassportScore();

  useEffect(() => {
    setSubtitle("ERROR");
  });

  return (
    <>
      <div className={`${styles.textBlock}`}>
        <div className={styles.heading}>Error</div>
        <div>{errorMessage}</div>
      </div>
      <Button className={utilStyles.wFull} onClick={resetPassportScore}>
        Try Again
      </Button>
    </>
  );
};