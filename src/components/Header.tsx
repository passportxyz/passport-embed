import styles from "./Header.module.css";
import { PassportLogo } from "../assets/passportLogo";
import { CheckmarkIcon } from "../assets/checkmarkIcon";
import { XIcon } from "../assets/xIcon";
import { Ellipsis } from "./Ellipsis";
import { useHeaderControls } from "../contexts/HeaderContext";

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
  if (passingScore === undefined) {
    return <PassportLogo />;
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
  const { subtitle, showLoadingIcon } = useHeaderControls();

  return (
    <div className={styles.container}>
      <div className={styles.titleStack}>
        Passport XYZ Score
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <ScoreDisplay score={score} passingScore={passingScore} />
      {showLoadingIcon && <Ellipsis />}
    </div>
  );
};
