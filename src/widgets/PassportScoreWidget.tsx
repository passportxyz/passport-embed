import { PassportWidgetProps, Widget } from "./Widget";
import {
  PassportScoreProps,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { useState } from "react";
import { Button } from "../components/Button";

// Format to max of 2 decimal places
const displayNumber = (num?: string) =>
  String(+parseFloat(num || "0").toFixed(2));

const ScoreDisplay = ({
  className,
  passingScore,
  score,
}: {
  className?: string;
  passingScore?: boolean;
  score?: string;
}) => (
  <div className={`${styles.flexCol} ${className}`}>
    <div className={passingScore ? styles.success : styles.failure}>
      {passingScore ? "Success!" : "Low Score"}
    </div>
    <div>Score: {displayNumber(score)}</div>
  </div>
);

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

const PassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportScoreProps) => {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error } = usePassportScore({
    enabled,
    apiKey,
    address,
    scorerId,
    overrideIamUrl,
  });

  return (
    <div className={styles.container}>
      <div className={styles.title}>Passport Score</div>
      <div className={styles.text}>
        Bla bla stuff about scoring and Passports and such
      </div>
      {isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <div className={styles.centerChildren}>
          <ScoreDisplay
            className={data ? styles.visible : styles.invisible}
            passingScore={data?.passingScore}
            score={data?.score}
          />
          <ScoreButton
            className={data ? styles.invisible : styles.visible}
            onClick={() => setEnabled(true)}
            disabled={enabled}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export type PassportScoreWidgetProps = PassportScoreProps & PassportWidgetProps;

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  return (
    <Widget {...props}>
      <PassportScore {...props} />
    </Widget>
  );
};
