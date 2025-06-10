import styles from "./Ellipsis.module.css";

const Dot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" height="8px" width="8px" className={className}>
    <circle cx="50" cy="50" r="40" fill="rgb(var(--color-primary-c6dbf459))" stroke="none" />
  </svg>
);

export const Ellipsis = () => {
  return (
    <div className={styles.container}>
      <Dot className={`${styles.dot} ${styles.dot1}`} />
      <Dot className={`${styles.dot} ${styles.dot2}`} />
      <Dot className={styles.dot} />
    </div>
  );
};
