import { useEffect } from "react";
import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useHeaderControls } from "../../contexts/HeaderContext";
import { Button } from "../Button";

export const ErrorBody = ({ errorMessage }: { errorMessage: string }) => {
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("ERROR");
  });

  return (
    <>
      <div className={`${styles.textBlock}`}>
        <div className={styles.heading}>Error</div>
        <div>{errorMessage}</div>
      </div>
      <Button className={utilStyles.wFull} onClick={async () => {}}>
        Try Again
      </Button>
    </>
  );
};
