import { PassportWidgetProps, Widget } from "./Widget";
import {
  PassportEmbedProps,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { useState } from "react";
import { Button } from "../components/Button";

// "https://embed.review.passport.xyz/popup",
const embedPopUpUrl = "http://localhost:3002";

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
  address,
  generateSignature,
  signature,
}: PassportEmbedProps) => {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error } = usePassportScore({
    enabled,
    address,
  });

  // This will handle the popup window for Web2 OAuth stamps
  const openWeb2PopUp = async () => {
    if (!generateSignature) {
      console.warn("generateSignature function is not provided");
      return;
    }
    try {
      const signedMessage = await generateSignature("Hello World!");
      console.log(
        "Generated signature for LinkedIn OAuth Stamp:",
        signedMessage
      );
      // Additional logic to handle LinkedIn OAuth can go here
      const _embedPopUpUrl = `${embedPopUpUrl}?address=${encodeURIComponent(
        address
      )}&signature=${encodeURIComponent(signedMessage)}`;
      // Open Popup window for LinkedIn OAuth
      const popup = window.open(
        // The content of the popup will be deployed on AWS
        _embedPopUpUrl,
        "passportPopup",
        "width=600,height=700"
      );

      // if (popup) {
      //   // Communicate with the popup (optional)
      //   popup.onload = () => {
      //     popup.postMessage({ msg: "Hello" }, "*");
      //   };
      // }
    } catch (error) {
      console.error("Error during LinkedIn OAuth:", error);
    }
  };

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
            passingScore={data?.passing_score}
            score={data && data.score ? data.score.toString() : ""}
          />
          <ScoreButton
            className={data ? styles.invisible : styles.visible}
            onClick={() => setEnabled(true)}
            disabled={enabled}
            isLoading={isLoading}
          />
          {/* Display Signature if it exists */}
          {/* {signature && (
            <div>
              <h3>Generated Signature:</h3>
              <p>{signature}</p>
            </div>
          )} */}

          {/* Increase Your Score Section */}
          <div className={styles.increaseScoreSection}>
            <h3>Increase Your Score</h3>
            <p>Connect your LinkedIn profile to boost your Passport Score.</p>
            <Button onClick={openWeb2PopUp} className={styles.linkedinButton}>
              LinkedIn OAuth
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export type PassportScoreWidgetProps = PassportEmbedProps & PassportWidgetProps;

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  return (
    <Widget {...props}>
      <PassportScore {...props} />
    </Widget>
  );
};
