import styles from "./Header.module.css";
import { PassportLogo } from "../assets/passportLogo";

// Format to integer
const displayNumber = (num?: number) =>
  String(parseInt(num?.toString() || "0"));

export const Header = ({
  score,
  passingScore,
}: {
  passingScore?: boolean;
  score?: number;
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.titleStack}>
        Passport XYZ Score
        <div className={styles.subtitle}>CONNECT WALLET</div>
      </div>
      <PassportLogo className={styles.logo} />
      <div className={passingScore ? styles.success : styles.failure}>
        {displayNumber(score)}
      </div>
    </div>
  );
};
