import styles from "./PassportScoreWidget.module.css";

// Format to integer
const displayNumber = (num?: string) => String(parseInt(num || "0"));

export const Header = ({
  score,
  passingScore,
}: {
  passingScore?: boolean;
  score?: string;
}) => (
  <div className={`${styles.flexCol}`}>
    <div className={passingScore ? styles.success : styles.failure}>
      {passingScore ? "Success!" : "Low Score"}
    </div>
    <div>Score: {displayNumber(score)}</div>
  </div>
);
