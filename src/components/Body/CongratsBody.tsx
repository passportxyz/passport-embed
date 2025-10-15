import { HappyHuman } from "../../assets/happyHuman";
import { Button } from "../Button";
import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";

interface CongratsBodyProps {
  collapseMode?: string;
  onClose?: () => void;
}

export const CongratsBody = ({ collapseMode, onClose }: CongratsBodyProps) => {
  const shouldShowCloseButton = collapseMode && collapseMode !== "off";

  return (
    <>
      <div className={styles.blurEffect}></div>
      <div
        className={
          shouldShowCloseButton
            ? styles.textBlock
            : `${styles.textBlock} ${styles.extraBottomMarginForBodyWithoutButton}`
        }
      >
        <div className={styles.iconWrapper}>
          <HappyHuman />
        </div>
        <div className={`${styles.heading} ${styles.textCenter}`}>Human Verification Complete!</div>
        <div className={styles.accentText}>You can now participate</div>
      </div>
      {shouldShowCloseButton && (
        <Button onClick={onClose} className={utilStyles.wFull}>
          <div className={styles.buttonContent}>
            <span className={styles.closeIcon}>✕</span>
            <span>Close</span>
          </div>
        </Button>
      )}
    </>
  );
};
