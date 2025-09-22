import { HappyHuman } from "../../assets/happyHuman";
import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { BackToStampsButton, BackToStampsButtonProps } from "./BackToStampsButton";
import { PlatformHeader } from "./PlatformHeader";

type StampClaimSuccessProps = BackToStampsButtonProps & {
  platform: Platform;
};

export const StampClaimSuccess = ({ platform, onBack }: StampClaimSuccessProps) => {
  return (
    <>
      <div className={styles.blurEffect}></div>
      <div className={`${styles.textBlock} ${styles.tight}`}>
        <PlatformHeader platform={platform} />
        <div className={styles.iconWrapper}>
          <HappyHuman />
        </div>
        <div className={`${styles.heading} ${styles.textCenter}`}>Congratulations!</div>
        <div className={styles.textCenter}>
          You've verified credentials within
          <br />
          the {platform.name} Stamp
        </div>
      </div>
      <BackToStampsButton onBack={onBack} />
    </>
  );
};
