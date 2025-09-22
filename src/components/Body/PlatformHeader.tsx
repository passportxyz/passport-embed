import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";

export const PlatformHeader = ({ platform }: { platform: Platform }) => {
  const { pointsGained } = usePlatformStatus({ platform });

  return (
    <div className={styles.platformHeader}>
      {platform.icon && <span className={styles.platformHeaderIcon}>{platform.icon}</span>}
      <span className={styles.platformHeaderName}>{platform.name}</span>
      {parseFloat(pointsGained) > 0 && <div className={styles.platformHeaderPoints}>{pointsGained}</div>}
    </div>
  );
};
