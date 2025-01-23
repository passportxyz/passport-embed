import styles from "./Header.module.css";
import { PassportLogo } from "../assets/passportLogo";
import { CheckmarkIcon } from "../assets/checkmarkIcon";
import { XIcon } from "../assets/xIcon";
import { Ellipsis } from "./Ellipsis";
import { useHeaderControls } from "../contexts/HeaderContext";
import {
  useWidgetIsQuerying,
  useWidgetPassportScore,
} from "../hooks/usePassportScore";
import { displayNumber } from "../utils";

const ScoreDisplay = () => {
  const { data } = useWidgetPassportScore();

  if (!data) {
    return <PassportLogo />;
  }

  return (
    <>
      {data?.passingScore ? <CheckmarkIcon /> : <XIcon />}
      <div
        className={`${data?.passingScore ? styles.success : styles.failure} ${
          styles.score
        }`}
      >
        {displayNumber(data?.score)}
      </div>
    </>
  );
};
export const Header = () => {
  const { subtitle } = useHeaderControls();
  const isQuerying = useWidgetIsQuerying();

  return (
    <div className={styles.container}>
      <div className={styles.titleStack}>
        Passport XYZ Score
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <ScoreDisplay />
      {isQuerying && <Ellipsis />}
    </div>
  );
};
