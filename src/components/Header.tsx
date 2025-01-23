import styles from "./Header.module.css";
import { PassportLogo } from "../assets/passportLogo";
import { useStep } from "../contexts/StepContext";
import { CheckmarkIcon } from "../assets/checkmarkIcon";
import { XIcon } from "../assets/xIcon";
import { Ellipsis } from "./Ellipsis";

// Format to integer
const displayNumber = (num?: number) =>
  String(parseInt(num?.toString() || "0"));

const ScoreDisplay = ({
  score,
  passingScore,
}: {
  score?: number;
  passingScore?: boolean;
}) => {
  const { currentStep } = useStep();

  if (passingScore === undefined) {
    return (
      <>
        <PassportLogo />
        {currentStep === "checking" && <Ellipsis />}
      </>
    );
  }

  return (
    <>
      {passingScore ? <CheckmarkIcon /> : <XIcon />}
      <div
        className={`${passingScore ? styles.success : styles.failure} ${
          styles.score
        }`}
      >
        {displayNumber(score)}
      </div>
    </>
  );
};
export const Header = ({
  score,
  passingScore,
}: {
  passingScore?: boolean;
  score?: number;
}) => {
  const { currentStep } = useStep();

  const subtitle = (() => {
    switch (currentStep) {
      case "checking":
        return "VERIFYING...";
      case "congrats":
        return "CONGRATULATIONS";
      case "scoreTooLow":
        return "LOW SCORE";
      default:
        return "CONNECT WALLET";
    }
  })();

  return (
    <div className={styles.container}>
      <div className={styles.titleStack}>
        Passport XYZ Score
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <ScoreDisplay score={score} passingScore={passingScore} />
    </div>
  );
};
