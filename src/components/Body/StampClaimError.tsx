import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { BackToStampsButton, BackToStampsButtonProps } from "./BackToStampsButton";
import { PlatformHeader } from "./PlatformHeader";

type StampClaimErrorProps = BackToStampsButtonProps & {
  platform: Platform;
};

const ErrorIcon = ({ width, stroke }: { width: number; stroke: number }) => (
  <svg width={width} height={width} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.99984 6.66602V9.99935M9.99984 13.3327H10.0082M18.3332 9.99935C18.3332 14.6017 14.6022 18.3327 9.99984 18.3327C5.39746 18.3327 1.6665 14.6017 1.6665 9.99935C1.6665 5.39698 5.39746 1.66602 9.99984 1.66602C14.6022 1.66602 18.3332 5.39698 18.3332 9.99935Z"
      stroke="rgb(var(--color-failure-c6dbf459))"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const StampClaimError = ({ platform, onBack }: StampClaimErrorProps) => {
  return (
    <>
      <div className={`${styles.textBlock} ${styles.tight}`}>
        <PlatformHeader platform={platform} />
        <div className={styles.iconWrapper}>
          <ErrorIcon width={56} stroke={0.8} />
        </div>
        <div className={`${styles.heading} ${styles.textCenter}`}>Error</div>
        <div className={styles.textCenter}>Unable to verify the {platform.name} Stamp</div>
      </div>
      <BackToStampsButton onBack={onBack} />
    </>
  );
};

