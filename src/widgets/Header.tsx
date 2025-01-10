import styles from "./Header.module.css";

// Format to integer
const displayNumber = (num?: number) =>
  String(parseInt(num?.toString() || "0"));

export const Header = ({
  enabled,
  score,
  passingScore,
}: {
  enabled: boolean;
  passingScore?: boolean;
  score?: number;
}) => (
  <div
    className={`${styles.container} ${
      enabled
        ? passingScore
          ? styles.successBorder
          : styles.failureBorder
        : styles.disabledBorder
    }`}
  >
    <div className={`${styles.titleStack}`}>
      Passport XYZ Score
      <div className={styles.subtitle}>CONNECT WALLET</div>
    </div>
    <div className={passingScore ? styles.success : styles.failure}>
      {displayNumber(score)}
    </div>
  </div>
);
