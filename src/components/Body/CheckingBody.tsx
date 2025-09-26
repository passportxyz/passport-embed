import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";

export const CheckingBody = () => {
  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Verifying your activity...</div>
        <div className={styles.loadingText}>
          Please wait a few seconds while we automatically add points to your account based on your web3 history.
        </div>
      </div>
      <Button className={utilStyles.wFull} disabled={true}>
        Verifying...
      </Button>
    </>
  );
};
