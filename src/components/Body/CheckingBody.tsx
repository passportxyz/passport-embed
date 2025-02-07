import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect } from "react";
import { useHeaderControls } from "../../hooks/useHeaderControls";

export const CheckingBody = () => {
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("VERIFYING...");
  });

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Verifying onchain activity...</div>
        <div>
          Please wait a few seconds as we analyze your onchain activities and
          verify relevant Stamps on your behalf.
        </div>
      </div>
      <Button className={utilStyles.wFull} disabled={true}>
        Verifying...
      </Button>
    </>
  );
};
