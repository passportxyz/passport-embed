import styles from "./PlatformVerification.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { Button } from "../Button";
import { Hyperlink } from "./ScoreTooLowBody";
import { ScrollableDiv } from "../ScrollableDiv";
import {
  useWidgetIsQuerying,
  useWidgetVerifyCredentials,
} from "../../hooks/usePassportScore";
import { useQueryContext } from "../../contexts/QueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { Platform } from "../../hooks/useStampPages";

const DEFAULT_CHALLENGE_URL =
  "https://iam.review.passport.xyz/api/v0.0.0/challenge";

const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 11L6 6L1 1"
      stroke="rgb(var(--color-background-c6dbf459))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 1L6 6L11 11"
      stroke="rgb(var(--color-background-c6dbf459))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlatformVerification = ({
  platform,
  onClose,
  generateSignatureCallback,
}: {
  platform: Platform;
  onClose: () => void;
  generateSignatureCallback: (message: string) => Promise<string | undefined>;
}) => {
  const { claimed } = usePlatformStatus({ platform });
  const [initiatedVerification, setInitiatedVerification] = useState(false);
  const [failedVerification, setFailedVerification] = useState(false);

  const { verifyCredentials } = useWidgetVerifyCredentials();
  const platformCredentialIds = platform.credentials.map(({ id }) => id);
  const isQuerying = useWidgetIsQuerying();
  const queryProps = useQueryContext();

  useEffect(() => {
    if (initiatedVerification && !isQuerying) {
      if (claimed) {
        onClose();
      } else {
        setFailedVerification(true);
      }
    }
  }, [initiatedVerification, isQuerying, claimed, onClose]);

  const getChallenge = async (
    challengeUrl: string,
    address: string,
    providerType: string
  ) => {
    const payload = {
      address: address,
      signatureType: "EIP712",
      type: providerType,
    };

    const response = await fetch(challengeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });

    return response.json();
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div>{platform.name}</div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          disabled={isQuerying}
          data-testid="close-platform-button"
        >
          <CloseIcon />
        </button>
      </div>
      <ScrollableDiv
        className={styles.description}
        invertScrollIconColor={true}
      >
        {failedVerification ? (
          <div>
            Unable to claim this Stamp. Find{" "}
            <Hyperlink href={platform.documentationLink}>
              instructions here
            </Hyperlink>{" "}
            and come back after.
          </div>
        ) : (
          <div>{platform.description}</div>
        )}
      </ScrollableDiv>
      <Button
        className={utilStyles.wFull}
        invert={true}
        disabled={isQuerying || claimed}
        onClick={async () => {
          //

          console.log("DEBUG  THIS ON CLICK VERIFY CREDENTIALS platform");
          let signature, credential;
          if (platform.requireSignature) {
            // get the challenge and  sign it
            if (!queryProps.address) {
              console.error("No address found");
              // TODO: manage error state
              setFailedVerification(true);
              return;
            }

            // TODO: fix this URL
            const challengeEndpoint = `${
              queryProps.challengeSignatureUrl || DEFAULT_CHALLENGE_URL
            }`;
            const challenge = await getChallenge(
              challengeEndpoint,
              queryProps.address,
              platform.name
            );
            credential = challenge.credential;
            const _challenge = challenge.credential.credentialSubject.challenge;

            const challengeToSign = `0x${Buffer.from(
              _challenge,
              "utf8"
            ).toString("hex")}`;

            signature = await generateSignatureCallback(challengeToSign);
          }

          if (platform.requiresPopup && platform.popUpUrl) {
            // open the popup
            const oAuthPopUpUrl = `${
              platform.popUpUrl
            }?address=${encodeURIComponent(
              queryProps.address || ""
            )}&scorerId=${encodeURIComponent(
              queryProps.scorerId || ""
            )}&platform=${encodeURIComponent(
              platform.name
            )}&signature=${encodeURIComponent(
              signature || ""
            )}&credential=${encodeURIComponent(JSON.stringify(credential))}`;

            console.log("THIS IS OAUTH POPUP URL", oAuthPopUpUrl);

            const popup = window.open(
              oAuthPopUpUrl,
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
                alert(
                  "LinkedIn OAuth process completed or cancelled. Interval check"
                );
                // Refresh stamps
                verifyCredentials(platformCredentialIds);
              }
            }, 100);
          } else {
            verifyCredentials(platformCredentialIds);
            setFailedVerification(false);
            setInitiatedVerification(true);
          }
        }}
      >
        {failedVerification
          ? "Try Again"
          : claimed
          ? "Already Verified"
          : `Verify${isQuerying ? "ing..." : ""}`}
      </Button>
    </div>
  );
};
