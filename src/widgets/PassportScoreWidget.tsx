import { PassportWidgetProps, Widget } from "./Widget";
import {
<<<<<<< HEAD
  PassportScoreProps,
=======
  PassportEmbedProps,
>>>>>>> 2964-demo-widget
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

<<<<<<< HEAD
const PassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportScoreProps) => {
=======
const PassportScore = ({ address }: PassportEmbedProps) => {
>>>>>>> 2964-demo-widget
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error } = usePassportScore({
    enabled,
<<<<<<< HEAD
    apiKey,
    address,
    scorerId,
    overrideIamUrl,
=======
    address,
>>>>>>> 2964-demo-widget
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
<<<<<<< HEAD
            passingScore={data?.passingScore}
            score={data?.score}
=======
            passingScore={data?.passing_score}
            score={data && data.score ? data.score.toString() : ""}
>>>>>>> 2964-demo-widget
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

<<<<<<< HEAD
export type PassportScoreWidgetProps = PassportScoreProps & PassportWidgetProps;
=======
export type PassportScoreWidgetProps = PassportEmbedProps & PassportWidgetProps;
>>>>>>> 2964-demo-widget

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  return (
    <Widget {...props}>
      <PassportScore {...props} />
    </Widget>
  );
};
