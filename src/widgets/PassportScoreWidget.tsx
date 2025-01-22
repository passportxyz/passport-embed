import { PassportWidgetProps, Widget } from "./Widget";
import {
  PassportEmbedProps,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { useState } from "react";
import { Button } from "../components/Button";
import { config } from "../config";

// "https://embed.review.passport.xyz/popup",  // "http://localhost:3005";
const DEFAULT_EMBED_POPUP_URL = "https://embed.review.passport.xyz/popup";
// const IAM_URL = "https://iam.staging.passport.xyz"; // TODO: this should be clarifyied after deployment
const IAM_URL = "http://localhost:8003";
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

const PassportScore = ({ address, generateSignature }: PassportEmbedProps) => {
  const [enabled, setEnabled] = useState(false);
  const [_, setRefresh] = useState(false);

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
    // try {
    // Get challenge from the IAM service

    const payload = {
      address: address,
      signatureType: "EIP712",
      type: "Linkedin",
    };

    // Make a POST request to get the challenge
    // "http://localhost:8003/api/v0.0.0/challenge"
    const response = await fetch(`${IAM_URL}/api/v0.0.0/challenge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });

    const challenge = await response.json();
    const _challenge = challenge.credential.credentialSubject.challenge;

    // Generate signature for the challenge
    const signedMessage = await generateSignature(_challenge);
    console.log("Generated signature for LinkedIn OAuth Stamp:", signedMessage);

    const _embedPopUpUrl = `${
      config.overrideEmbedPopUpUrl || DEFAULT_EMBED_POPUP_URL
    }?address=${encodeURIComponent(address)}&signature=${encodeURIComponent(
      signedMessage
    )}&challenge=${encodeURIComponent(_challenge)}`;

    // const _embedPopUpUrl = `${
    //   config.overrideEmbedPopUpUrl || DEFAULT_EMBED_POPUP_URL
    // }?address=${encodeURIComponent(address)}&signature=${encodeURIComponent(
    //   signedMessage
    // )}&challenge=${encodeURIComponent(
    //   JSON.stringify(challenge)
    // )}&originUrl=${encodeURIComponent(window.location.href)} `;
    console.log("Embed PopUp URL:", _embedPopUpUrl);
    const popup = window.open(
      _embedPopUpUrl,
      "passportPopup",
      "width=600,height=700"
    );

    if (!popup) {
      console.error("Failed to open pop-up");
      return;
    }

    // Check if the pop-up is closed every 100ms
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        console.log("Pop-up closed");
        alert("LinkedIn OAuth process completed or cancelled. Interval check");
        // Refresh stamps
        setRefresh(true);
      }
    }, 100);

    // window.addEventListener("message", (event) => {
    //   console.log("GOT POPUP MESSAGE", event);
    //   // if (
    //   //   event.origin !==
    //   //   `${config.overrideEmbedPopUpUrl || DEFAULT_EMBED_POPUP_URL})`
    //   // ) {
    //   //   console.error("Invalid origin:", event.origin);
    //   //   return;
    //   // }
    //   if (event.data?.step === "popup_closed") {
    //     console.log("Popup has been closed.");
    //     alert("The LinkedIn OAuth pop-up was closed.");
    //   }
    // });

    // Alternativ to pass all data to the popup window
    // But this is insecure , if we want this approach we should request
    // form integrators the main link and verify the surce of the message in the popup window
    // and consider it valid only if it comes from the a list of configured valid hosts.
    // if (popup) {
    //   popup.onload = () => {
    //     popup.postMessage({ msg: "Hello" }, "*");
    //   };
    // }
    // } catch (error) {
    //   console.error("Error during LinkedIn OAuth:", error);
    // }
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
