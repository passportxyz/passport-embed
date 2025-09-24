import styles from "./PlatformVerification.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { Hyperlink } from "./ScoreTooLowBody";
import { ScrollableDivWithFade } from "../ScrollableDivWithFade";
import { useWidgetIsQuerying, useWidgetVerifyCredentials } from "../../hooks/usePassportScore";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../hooks/usePlatformDeduplication";
import { Platform } from "../../hooks/stampTypes";
import { useHumanIDVerification } from "../../hooks/useHumanIDVerification";
import { StampClaimResult } from "./StampClaimResult";
import { PlatformHeader } from "./PlatformHeader";
import { DocLink } from "./DocLink";

const getChallenge = async (challengeUrl: string, address: string, providerType: string) => {
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

export const PlatformVerification = ({
  platform,
  onClose,
  generateSignatureCallback,
}: {
  platform: Platform;
  onClose: () => void;
  generateSignatureCallback?: (message: string) => Promise<string | undefined>;
}) => {
  const { claimed } = usePlatformStatus({ platform });
  const isDeduped = usePlatformDeduplication({ platform });
  const [initiatedVerification, setInitiatedVerification] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isOAuthPopupOpen, setIsOAuthPopupOpen] = useState(false);
  const [wasQuerying, setWasQuerying] = useState(false);
  const [preVerificationError, setPreVerificationError] = useState<string>("");

  const isQuerying = useWidgetIsQuerying();
  const queryProps = useQueryContext();
  const { verifyCredentials, error, credentialErrors } = useWidgetVerifyCredentials();
  const platformCredentialIds = platform.credentials.map(({ id }) => id);

  const hasConfigurationError = platform.requiresSignature && !generateSignatureCallback;

  // Human ID verification hook
  const {
    isHumanIDPlatform,
    verifyHumanID,
    isVerifying: isVerifyingHumanID,
  } = useHumanIDVerification({
    platform,
    address: queryProps.address,
    enabled: false, // We'll trigger manually
  });

  // Combined pending state for cleaner code
  const isPending = isQuerying || isVerifyingHumanID || isOAuthPopupOpen;

  // Track when query starts after initiation
  useEffect(() => {
    if (initiatedVerification && isQuerying) {
      setWasQuerying(true);
    }
  }, [initiatedVerification, isQuerying]);

  // Check completion
  useEffect(() => {
    const isFullyComplete =
      initiatedVerification &&
      wasQuerying && // Ensures query actually ran
      !isPending;

    if (isFullyComplete) {
      setVerificationComplete(true);
      // Reset for next attempt
      setInitiatedVerification(false);
      setWasQuerying(false);
    }
  }, [initiatedVerification, wasQuerying, isPending]);

  // Show success screen immediately if claimed
  if (claimed || verificationComplete) {
    const errors = preVerificationError
      ? [{ error: preVerificationError }]
      : credentialErrors?.length
        ? credentialErrors
        : error
          ? [{ error: error.toString() }]
          : undefined;
    return <StampClaimResult platform={platform} onBack={onClose} errors={errors} />;
  }

  return (
    <>
      <PlatformHeader
        platform={platform}
        showSeeDetails={false}
        onSeeDetails={() => {}}
        onBack={onClose}
        points={platform.displayWeight}
      />
      <div className={styles.heading}>Verify the {platform.name} Stamp</div>
      <ScrollableDivWithFade className={styles.description} invertFadeColor={true}>
        {hasConfigurationError ? (
          <div>
            Something's missing! This Stamp needs an extra setup step to work properly. If you're the site owner, please
            add a generateSignatureCallback to the widget configuration.
          </div>
        ) : (
          <div>
            {isDeduped && (
              <div className={styles.deduplicationNotice}>
                ⚠️{" "}
                <Hyperlink href="https://support.passport.xyz/passport-knowledge-base/common-questions/why-am-i-receiving-zero-points-for-a-verified-stamp">
                  Already claimed elsewhere
                </Hyperlink>
              </div>
            )}
            {platform.description}
          </div>
        )}
        <div className={styles.learnMore}>
          <DocLink href={platform.documentationLink}>Learn more</DocLink>
        </div>
      </ScrollableDivWithFade>
      <Button
        className={utilStyles.wFull}
        disabled={isPending || claimed}
        onClick={async () => {
          if (hasConfigurationError) {
            onClose();
            return;
          }

          // Reset states for new attempt
          setInitiatedVerification(true);
          setVerificationComplete(false);
          setPreVerificationError("");
          setWasQuerying(false);

          // Handle Human ID platforms first
          if (isHumanIDPlatform) {
            try {
              await verifyHumanID();
              // Now verify the credentials with the backend
              verifyCredentials(platformCredentialIds);
            } catch (error) {
              console.log("Human ID verification error:", error);
              setPreVerificationError(error instanceof Error ? error.toString() : "Unknow error verifying Human ID");
              setVerificationComplete(true);
              setInitiatedVerification(false); // Reset since we're not continuing
            }
            return;
          }

          // Handle signature-required platforms
          let signature, credential;
          if (platform.requiresSignature) {
            // get the challenge and  sign it
            if (!queryProps.address) {
              console.error("No address found");
              // TODO: manage error state
              setVerificationComplete(true);
              setInitiatedVerification(false);
              return;
            }

            const challengeEndpoint = `${queryProps.embedServiceUrl}/embed/challenge`;
            const challenge = await getChallenge(challengeEndpoint, queryProps.address, platform.platformId);
            credential = challenge.credential;
            const _challenge = challenge.credential.credentialSubject.challenge;

            signature = await generateSignatureCallback!(_challenge);
          }

          // Handle popup-required platforms
          if (platform.requiresPopup && platform.popupUrl) {
            // open the popup
            const oAuthPopUpUrl = `${platform.popupUrl}?address=${encodeURIComponent(
              queryProps.address || ""
            )}&scorerId=${encodeURIComponent(queryProps.scorerId || "")}&platform=${encodeURIComponent(
              platform.platformId
            )}&providers=${encodeURIComponent(JSON.stringify(platformCredentialIds))}&signature=${encodeURIComponent(
              signature || ""
            )}&credential=${encodeURIComponent(
              JSON.stringify(credential)
            )}&apiKey=${encodeURIComponent(queryProps.apiKey || "")}`;

            const popup = window.open(oAuthPopUpUrl, "passportPopup", "width=600,height=700");

            if (!popup) {
              console.error("Failed to open pop-up");
              setInitiatedVerification(false); // Reset since we're not continuing
              return;
            }

            setIsOAuthPopupOpen(true);

            // Check if the pop-up is closed every 100ms
            const checkPopupClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkPopupClosed);
                console.log("Pop-up closed");
                setIsOAuthPopupOpen(false);
                // Verify platform credentials
                verifyCredentials(platformCredentialIds);
              }
            }, 100);
          } else {
            // Default verification
            verifyCredentials(platformCredentialIds);
          }
        }}
      >
        {hasConfigurationError ? (
          "Go Back"
        ) : (
          <div className={styles.buttonContent}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Verify{isPending ? "ing..." : ""}
          </div>
        )}
      </Button>
    </>
  );
};
