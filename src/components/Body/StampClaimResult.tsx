import { HappyHuman } from "../../assets/happyHuman";
import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { BackToStampsButton, BackToStampsButtonProps } from "./BackToStampsButton";
import { PlatformHeader } from "./PlatformHeader";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { CredentialError } from "../../hooks/usePassportScore";
import { AmbivalentHuman } from "../../assets/ambivalentHuman";
import { TooltipIcon } from "../../assets/tooltipIcon";
import { Tooltip } from "../Tooltip";

type StampClaimSuccessProps = BackToStampsButtonProps & {
  platform: Platform;
  errors?: CredentialError[];
};

export const StampClaimResult = ({ platform, onBack, errors }: StampClaimSuccessProps) => {
  const { claimed } = usePlatformStatus({ platform });

  return (
    <>
      <div className={`${styles.blurEffect} ${claimed ? "" : styles.altBlurColor}`} />
      <PlatformHeader platform={platform} />
      <div className={`${styles.textBlock} ${styles.tight}`}>
        <div className={styles.iconWrapper}>{claimed ? <HappyHuman /> : <AmbivalentHuman />}</div>
        <div className={`${styles.heading} ${styles.textCenter}`}>
          {claimed ? "Congratulations!" : "Stamp Verification Unsuccessful"}
        </div>
        <div className={styles.textCenter}>
          {claimed ? (
            <>
              You've verified credentials within
              <br />
              the {platform.name} Stamp
            </>
          ) : (
            "Please try verifying another Stamp"
          )}
        </div>
        {!claimed && (
          <div className={`${styles.textCenter} ${styles.learnMore}`}>
            {errors ? (
              <Tooltip content={errors.map(error=>error.error).join()}>
                <TooltipIcon />
              </Tooltip>
            ) : (
              <TooltipIcon />
            )}{" "}
            Learn more
          </div>
        )}
      </div>
      <BackToStampsButton onBack={onBack} />
    </>
  );
};
