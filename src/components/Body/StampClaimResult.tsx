import { HappyHuman } from "../../assets/happyHuman";
import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { BackToStampsButton, BackToStampsButtonProps } from "./BackToStampsButton";
import { PlatformHeader } from "./PlatformHeader";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { CredentialError } from "../../hooks/usePassportScore";
import { AmbivalentHuman } from "../../assets/ambivalentHuman";
import { Tooltip } from "../Tooltip";
import { useState } from "react";
import { TextButton } from "../TextButton";
import { DocLink } from "./DocLink";

type StampClaimSuccessProps = BackToStampsButtonProps & {
  platform: Platform;
  errors?: CredentialError[];
};

const ChevronRight = (props: React.ComponentProps<typeof TextButton>) => (
  <TextButton {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </TextButton>
);

const ChevronLeft = (props: React.ComponentProps<typeof TextButton>) => (
  <TextButton {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </TextButton>
);

export const StampClaimResult = ({ platform, onBack, errors }: StampClaimSuccessProps) => {
  const { claimed } = usePlatformStatus({ platform });
  const [seeErrors, setSeeErrors] = useState(false);
  const [errorIndex, setErrorIndex] = useState(0);
  const { pointsGained } = usePlatformStatus({ platform });

  return (
    <>
      <PlatformHeader
        platform={platform}
        showSeeDetails={Boolean(errors?.length && !seeErrors)}
        onSeeDetails={() => setSeeErrors(true)}
        points={claimed ? pointsGained : undefined}
      />
      {seeErrors && errors?.length ? (
        <>
          <div className={styles.errorSection}>
            <div className={styles.errorSubHeader}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.99984 6.66602V9.99935M9.99984 13.3327H10.0082M18.3332 9.99935C18.3332 14.6017 14.6022 18.3327 9.99984 18.3327C5.39746 18.3327 1.6665 14.6017 1.6665 9.99935C1.6665 5.39698 5.39746 1.66602 9.99984 1.66602C14.6022 1.66602 18.3332 5.39698 18.3332 9.99935Z"
                  stroke="rgb(var(--color-error-c6dbf459))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Error{errors.length > 1 ? "s" : ""}</span>
              <span className={styles.errorCounterSpan}>
                {errors.length > 1 ? (
                  <div className={styles.errorCounter}>
                    {errorIndex + 1}/{errors.length}
                  </div>
                ) : (
                  ""
                )}
              </span>
              {errors.length > 1 && (
                <div className={styles.errorArrows}>
                  <ChevronLeft
                    className={styles.errorArrow}
                    onClick={() => setErrorIndex((i) => Math.max(0, i - 1))}
                    disabled={errorIndex === 0}
                  />
                  <ChevronRight
                    className={styles.errorArrow}
                    onClick={() => setErrorIndex((i) => Math.min(errors.length - 1, i + 1))}
                    disabled={errorIndex === errors.length - 1}
                  />
                </div>
              )}
            </div>
            <div className={styles.error}>
              {errors[errorIndex]?.code && <div className={styles.errorCode}>Code: {errors[errorIndex].code}</div>}
              <Tooltip content={errors[errorIndex].error}>{errors[errorIndex].error}</Tooltip>
            </div>
          </div>
          <DocLink href={platform.documentationLink}>Support</DocLink>
        </>
      ) : (
        <>
          <div className={`${styles.blurEffect} ${claimed ? "" : styles.altBlurColor}`} />
          <div className={`${styles.textBlock} ${styles.tight}`}>
            <div className={styles.iconWrapper}>{claimed ? <HappyHuman /> : <AmbivalentHuman />}</div>
            <div className={`${styles.heading} ${styles.textCenter}`}>
              {claimed ? "Congratulations!" : "Stamp Verification Unsuccessful"}
            </div>
            <div className={styles.accentText}>
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
            {!claimed && <DocLink href={platform.documentationLink}>Learn more</DocLink>}
          </div>
        </>
      )}
      <BackToStampsButton onBack={onBack} />
    </>
  );
};
