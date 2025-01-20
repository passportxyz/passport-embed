import styles from "./PlatformVerification.module.css";
import utilStyles from "../../utilStyles.module.css";
import { createRef, useEffect, useState } from "react";
import { Button } from "../Button";
import { Platform } from "./ScoreTooLowBody";
import { ScrollableDiv } from "../ScrollableDiv";

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
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div>{platform.name}</div>
        <button onClick={onClose} className={styles.closeButton}>
          <CloseIcon />
        </button>
      </div>
      <ScrollableDiv
        className={styles.description}
        invertScrollIconColor={true}
      >
        {platform.description}
      </ScrollableDiv>
      <Button className={utilStyles.wFull} onClick={onClose} invert={true}>
        Verify
      </Button>
    </div>
  );
};
