import styles from "./Body.module.css";
import { Platform } from "../../hooks/stampTypes";
import { TextButton } from "../TextButton";

export const BackButton =({
  onBack
}: {
  onBack: () => void;
}) => ( <TextButton onClick={onBack} className={styles.backButton}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
d="M12 19L5 12M5 12L12 5M5 12H19"
stroke="rgb(var(--color-secondary-c6dbf459))"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
/>
</svg>
</TextButton>
      )

export const PlatformHeader = ({
  platform,
  showSeeDetails,
  onSeeDetails,
  points,
  onBack,
}: {
  platform: Platform;
  showSeeDetails: boolean;
  onSeeDetails: () => void;
  onBack?: () => void;
  points?: string;
}) => {
  return (
    <div className={styles.platformHeader}>
      {onBack && (<BackButton onBack={onBack} />)}
      {platform.icon && <span className={styles.platformHeaderIcon}>{platform.icon}</span>}
      <span className={styles.platformHeaderName}>{platform.name}</span>
      {parseFloat(points || "0") > 0 && <div className={styles.platformHeaderPoints}>{points}</div>}
      {showSeeDetails && <TextButton onClick={onSeeDetails}>See Details ➜</TextButton>}
    </div>
  );
};
