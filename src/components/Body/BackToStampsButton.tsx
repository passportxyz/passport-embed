import { Button } from "../Button";
import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { HouseIcon } from "../../assets/houseIcon";

export type BackToStampsButtonProps = {
  onBack: () => void;
};

export const BackToStampsButton = ({ onBack }: BackToStampsButtonProps) => (
  <Button onClick={onBack} className={utilStyles.wFull}>
    <div className={styles.buttonContent}>
      <HouseIcon />
      <span>Back to Stamps</span>
    </div>
  </Button>
);
