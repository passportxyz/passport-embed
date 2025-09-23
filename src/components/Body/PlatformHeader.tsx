import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { TextButton } from "../TextButton";

export const PlatformHeader = ({
  platform,
  showSeeDetails,
  onSeeDetails,
}: {
  platform: Platform;
  showSeeDetails: boolean;
  onSeeDetails: () => void;
}) => {
  const { pointsGained } = usePlatformStatus({ platform });

  return (
    <div className={styles.platformHeader}>
      {platform.icon && <span className={styles.platformHeaderIcon}>{platform.icon}</span>}
      <span className={styles.platformHeaderName}>{platform.name}</span>
      {parseFloat(pointsGained) > 0 && <div className={styles.platformHeaderPoints}>{pointsGained}</div>}
      {showSeeDetails && <TextButton onClick={onSeeDetails}>See Details ➜</TextButton>}
    </div>
  );
};
