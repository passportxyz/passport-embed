import { useEffect } from "react";
import styles from "./Body.module.css";
import { useHeaderControls } from "../../contexts/HeaderContext";

export const ErrorBody = ({ errorMessage }: { errorMessage: string }) => {
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("ERROR");
  });

  return (
    <div
      className={`${styles.textBlock} ${styles.extraBottomMarginForBodyWithoutButton}`}
    >
      <div className={styles.heading}>Error</div>
      <div>{errorMessage}</div>
    </div>
  );
};
