import styles from "./PlatformVerification.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { Hyperlink, Platform, usePlatformStatus } from "./ScoreTooLowBody";
import { ScrollableDiv } from "../ScrollableDiv";
import {
  useWidgetIsQuerying,
  useWidgetVerifyCredentials,
} from "../../hooks/usePassportScore";

const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 11L6 6L1 1"
      stroke="rgb(var(--color-background-c6dbf459))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 1L6 6L11 11"
      stroke="rgb(var(--color-background-c6dbf459))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlatformVerification = ({
  platform,
  onClose,
}: {
  platform: Platform;
  onClose: () => void;
}) => {
  const { claimed } = usePlatformStatus({ platform });
  const [initiatedVerification, setInitiatedVerification] = useState(false);
  const [failedVerification, setFailedVerification] = useState(false);

  const { verifyCredentials } = useWidgetVerifyCredentials();
  const platformCredentialIds = platform.credentials.map(({ id }) => id);
  const isQuerying = useWidgetIsQuerying();

  useEffect(() => {
    if (initiatedVerification && !isQuerying) {
      if (claimed) {
        onClose();
      } else {
        setFailedVerification(true);
      }
    }
  }, [initiatedVerification, isQuerying, claimed, onClose]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div>{platform.name}</div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          disabled={isQuerying}
        >
          <CloseIcon />
        </button>
      </div>
      <ScrollableDiv
        className={styles.description}
        invertScrollIconColor={true}
      >
        {failedVerification ? (
          <div>
            Unable to claim this Stamp. Find{" "}
            <Hyperlink href={platform.documentationLink}>
              instructions here
            </Hyperlink>{" "}
            and come back after.
          </div>
        ) : (
          platform.description
        )}
      </ScrollableDiv>
      <Button
        className={utilStyles.wFull}
        invert={true}
        disabled={isQuerying || claimed}
        onClick={() => {
          verifyCredentials(platformCredentialIds);
          setFailedVerification(false);
          setInitiatedVerification(true);
        }}
      >
        {failedVerification
          ? "Try Again"
          : claimed
          ? "Already Verified"
          : `Verify${isQuerying ? "ing..." : ""}`}
      </Button>
    </div>
  );
};
