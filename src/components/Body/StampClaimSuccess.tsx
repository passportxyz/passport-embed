import { useEffect } from "react";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import { HappyHuman } from "../../assets/happyHuman";
import { Button } from "../Button";
import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Platform } from "../../hooks/stampTypes";

const BackToStampsIcon = () => (
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_stamp_success)">
      <path
        d="M1.8335 4.66732L4.7735 1.72732C4.89753 1.60254 5.04504 1.50354 5.20752 1.43604C5.36999 1.36853 5.54422 1.33385 5.72016 1.33398H11.2802C11.4561 1.33385 11.6303 1.36853 11.7928 1.43604C11.9553 1.50354 12.1028 1.60254 12.2268 1.72732L15.1668 4.66732M1.8335 4.66732H15.1668M1.8335 4.66732V6.66732C1.8335 7.02094 1.97397 7.36008 2.22402 7.61013C2.47407 7.86018 2.81321 8.00065 3.16683 8.00065M15.1668 4.66732V6.66732C15.1668 7.02094 15.0264 7.36008 14.7763 7.61013C14.5263 7.86018 14.1871 8.00065 13.8335 8.00065M3.16683 8.00065V13.334C3.16683 13.6876 3.30731 14.0267 3.55735 14.2768C3.8074 14.5268 4.14654 14.6673 4.50016 14.6673H12.5002C12.8538 14.6673 13.1929 14.5268 13.443 14.2768C13.693 14.0267 13.8335 13.6876 13.8335 13.334V8.00065M3.16683 8.00065C3.55634 7.97921 3.92834 7.83182 4.22683 7.58065C4.30638 7.52317 4.40202 7.49223 4.50016 7.49223C4.59831 7.49223 4.69395 7.52317 4.7735 7.58065C5.07198 7.83182 5.44399 7.97921 5.8335 8.00065C6.22301 7.97921 6.59501 7.83182 6.8935 7.58065C6.97304 7.52317 7.06869 7.49223 7.16683 7.49223C7.26497 7.49223 7.36062 7.52317 7.44016 7.58065C7.73865 7.83182 8.11065 7.97921 8.50016 8.00065C8.88967 7.97921 9.26168 7.83182 9.56016 7.58065C9.63971 7.52317 9.73535 7.49223 9.8335 7.49223C9.93164 7.49223 10.0273 7.52317 10.1068 7.58065C10.4053 7.83182 10.7773 7.97921 11.1668 8.00065C11.5563 7.97921 11.9283 7.83182 12.2268 7.58065C12.3064 7.52317 12.402 7.49223 12.5002 7.49223C12.5983 7.49223 12.694 7.52317 12.7735 7.58065C13.072 7.83182 13.444 7.97921 13.8335 8.00065M10.5002 14.6673V12.0007C10.5002 11.647 10.3597 11.3079 10.1096 11.0578C9.85959 10.8078 9.52045 10.6673 9.16683 10.6673H7.8335C7.47987 10.6673 7.14074 10.8078 6.89069 11.0578C6.64064 11.3079 6.50016 11.647 6.50016 12.0007V14.6673"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_stamp_success">
        <rect width="16" height="16" fill="white" transform="translate(0.5)" />
      </clipPath>
    </defs>
  </svg>
);

interface StampClaimSuccessProps {
  platform: Platform;
  onBack: () => void;
}

export const StampClaimSuccess = ({ platform, onBack }: StampClaimSuccessProps) => {
  return (
    <>
      {/* Body content */}
      <div className={`${styles.textBlock} ${styles.tight}`}>
        {/* Header with platform name and points */}
        <div className={styles.stampSuccessHeader}>
          <div className={styles.stampSuccessPlatform}>
            {platform.icon && <span className={styles.stampSuccessIcon}>{platform.icon}</span>}
            <span>{platform.name}</span>
          </div>
          <div className={styles.stampSuccessPoints}>{platform.displayWeight}</div>
        </div>
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

      {/* Back to Stamps button */}
      <Button onClick={onBack} className={utilStyles.wFull}>
        <div className={styles.buttonContent}>
          <BackToStampsIcon />
          <span>Back to Stamps</span>
        </div>
      </Button>
    </>
  );
};
