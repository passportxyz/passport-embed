import { useEffect } from "react";
import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import { Button } from "../Button";
import { useResetWidgetPassportScore } from "../../hooks/usePassportScore";

interface ErrorBodyProps {
  error: unknown;
}

export const ErrorBody = ({ error }: ErrorBodyProps) => {
  const { setSubtitle } = useHeaderControls();
  const { resetPassportScore } = useResetWidgetPassportScore();

  useEffect(() => {
    setSubtitle("ERROR");
  }, [setSubtitle]);

  const errorMessage = error instanceof Error ? error.message : "An error occurred";

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Error</div>
        <div>{errorMessage}</div>
      </div>
      <Button className={utilStyles.wFull} onClick={resetPassportScore}>
        Try Again
      </Button>
    </>
  );
};
