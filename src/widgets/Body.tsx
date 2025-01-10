import styles from "./Body.module.css";
import { Button } from "../components/Button";

const ScoreButton = ({
  onClick,
  className,
  disabled,
  isLoading,
}: {
  onClick: () => void;
  className: string;
  disabled: boolean;
  isLoading: boolean;
}) => (
  <Button onClick={onClick} className={className} disabled={disabled}>
    <div className={styles.centerChildren}>
      <div className={isLoading ? styles.visible : styles.invisible}>
        Checking...
      </div>
      <div className={isLoading ? styles.invisible : styles.visible}>
        Check your Passport score
      </div>
    </div>
  </Button>
);

export const Body = ({
  errorMessage,
  enabled,
  setEnabled,
  isLoading,
}: {
  errorMessage?: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isLoading: boolean;
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        Bla bla stuff about scoring and Passports and such
      </div>
      {errorMessage ? (
        <div>Error: {errorMessage}</div>
      ) : (
        <div className={styles.centerChildren}>
          <ScoreButton
            className=""
            onClick={() => setEnabled(true)}
            disabled={enabled}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
