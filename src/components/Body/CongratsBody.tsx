import { useEffect } from "react";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import styles from "./Body.module.css";

export const CongratsBody = () => {
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("CONGRATULATIONS");
  });

  return (
    <div className={`${styles.textBlock} ${styles.extraBottomMarginForBodyWithoutButton}`}>
      <div className={styles.heading}>Verified!</div>
      <div>You're a verified human -- Please proceed!</div>
    </div>
  );
};
