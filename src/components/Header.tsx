import styles from "./Header.module.css";
import { PassportLogo } from "../assets/passportLogo";
import { LoadingIcon } from "../assets/loadingIcon";
import { useWidgetIsQuerying, useWidgetPassportScore } from "../hooks/usePassportScore";
import { displayNumber } from "../utils";
import { Dispatch, SetStateAction } from "react";

const ScoreIndicator = ({ score, threshold }: { score: number; threshold: number }) => {
  const fillPercentage = Math.min((score / threshold) * 100, 100);
  const angle = (fillPercentage / 100) * 360;

  const gradientStyle = {
    background: `conic-gradient(
      from 0deg,
      rgba(var(--color-accent-c6dbf459), 1) 0deg,
      rgba(var(--color-accent-c6dbf459), 1) ${angle}deg,
      rgba(var(--color-primary-c6dbf459), 1) ${angle}deg,
      rgba(var(--color-primary-c6dbf459), 1) 360deg
    )`
  };

  return (
    <div
      className={styles.scoreIndicator}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={threshold}
      style={gradientStyle}
    >
      <div className={styles.scoreIndicatorText}>{displayNumber(score)}</div>
    </div>
  );
};

const ScoreDisplay = () => {
  const isQuerying = useWidgetIsQuerying();
  const { data } = useWidgetPassportScore();

  return (
    <>
      {isQuerying && <LoadingIcon />}
      {!isQuerying && data && <ScoreIndicator {...data} />}
    </>
  );
};

const CollapseToggle = ({ bodyIsOpen }: { bodyIsOpen: boolean }) => {
  return (
    <svg
      className={`${styles.collapseToggle} ${bodyIsOpen ? styles.collapseToggleOpen : ""}`}
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.73205 11C7.96225 12.3333 6.03775 12.3333 5.26795 11L0.937822 3.5C0.168022 2.16666 1.13027 0.499999 2.66988 0.499999L11.3301 0.5C12.8697 0.5 13.832 2.16667 13.0622 3.5L8.73205 11Z"
        fill="rgba(var(--color-primary-c6dbf459), 0.8)"
      />
    </svg>
  );
};
export const Header = ({
  bodyIsOpen,
  setBodyIsOpen,
  collapsible,
}: {
  bodyIsOpen: boolean;
  setBodyIsOpen: Dispatch<SetStateAction<boolean>>;
  collapsible: boolean;
}) => {
  return (
    <button
      className={`${styles.container} ${bodyIsOpen || !collapsible ? styles.bodyExpanded : styles.bodyCollapsed} ${
        collapsible ? styles.containerCollapseButton : styles.containerNoCollapseButton
      }`}
      onClick={() => {
        if (collapsible) {
          setBodyIsOpen((prev) => !prev);
        }
      }}
    >
      <PassportLogo />
      <div className={styles.titleStack}>Human Passport Score</div>
      <div className={styles.scoreSection}>
        <ScoreDisplay />
        {collapsible && <CollapseToggle bodyIsOpen={bodyIsOpen} />}
      </div>
    </button>
  );
};
