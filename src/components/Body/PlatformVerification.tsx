import {
  initHumanID,
  getKycSBTByAddress,
  getPhoneSBTByAddress,
  getBiometricsSBTByAddress,
  getCleanHandsSPAttestationByAddress,
  type CredentialType,
  type HubV3SBT,
} from "@holonym-foundation/human-id-sdk";
import styles from "./PlatformVerification.module.css";
import utilStyles from "../../utilStyles.module.css";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../Button";
import { Hyperlink } from "./ScoreTooLowBody";
import { ScrollableDiv } from "../ScrollableDiv";
import { useWidgetIsQuerying, useWidgetVerifyCredentials } from "../../hooks/usePassportScore";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../hooks/usePlatformDeduplication";
import { Platform } from "../../hooks/useStampPages";

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  const [failedVerification, setFailedVerification] = useState(false);

  const isQuerying = useWidgetIsQuerying();
  const queryProps = useQueryContext();
  const { verifyCredentials } = useWidgetVerifyCredentials();
  const platformCredentialIds = platform.credentials.map(({ id }) => id);

  const hasConfigurationError = platform.requiresSignature && !generateSignatureCallback;

  useEffect(() => {
    if (initiatedVerification && !isQuerying) {
      if (claimed) {
        onClose();
      } else {
        setFailedVerification(true);
      }
    }
  }, [initiatedVerification, isQuerying, claimed, onClose]);

  const getHasHumanIDSBT = useCallback(
    async (address: string) => {
      const addressAsHex = address as `0x${string}`;
      const validateSBT = (sbt: HubV3SBT) => {
        if (sbt && typeof sbt === "object" && "expiry" in sbt) {
          // Check if SBT is not expired
          const currentTime = BigInt(Math.floor(Date.now() / 1000));
          if (sbt.expiry > currentTime && !sbt.revoked) {
            return true;
          }
        }
        return false;
      };
      try {
        if (platform.name === "HumanIdKyc") {
          const sbt = await getKycSBTByAddress(addressAsHex);
          return validateSBT(sbt);
        } else if (platform.name === "HumanIdPhone") {
          const sbt = await getPhoneSBTByAddress(addressAsHex);
          return validateSBT(sbt);
        } else if (platform.name === "Biometrics") {
          const sbt = await getBiometricsSBTByAddress(addressAsHex);
          return validateSBT(sbt);
        } else if (platform.name === "CleanHands") {
          const attestation = await getCleanHandsSPAttestationByAddress(addressAsHex);
          // getCleanHandsSPAttestationByAddress validates the attestation
          return !!attestation;
        } else {
          throw new Error(`Unsupported Human ID platform: ${platform.name}`);
        }
      } catch (err) {
        /* SBT query fns throw if the address is not found */
        console.log("getHasSBT err", err);
        return false;
      }
    },
    [platform.name]
  );

  const handleVerifyHumanID = useCallback(async () => {
    // Human ID initialization is idempotent, so we can initialize multiple times
    // without worrying about side effects like increasing event listeners or
    // adding multiple iframe elements to the document.
    const provider = initHumanID();
    let sbtType: CredentialType;
    switch (platform.name) {
      case "HumanIdKyc":
        sbtType = "kyc";
        break;
      case "HumanIdPhone":
        sbtType = "phone";
        break;
      case "Biometrics":
        sbtType = "biometrics";
        break;
      case "CleanHands":
        sbtType = "clean-hands";
        break;
      default:
        throw new Error(`Unsupported Human ID platform: ${platform.name}`);
    }

    const onSuccess = () => {
      verifyCredentials(platformCredentialIds);
      setFailedVerification(false);
      setInitiatedVerification(true);
    };

    try {
      console.log("queryProps.address", queryProps.address);
      if (!queryProps.address) {
        throw new Error("No address found");
      }
      // First, check if the user already has the SBT
      const hasHumanIDSBT = await getHasHumanIDSBT(queryProps.address);
      if (hasHumanIDSBT) {
        onSuccess();
        return;
      }
      // If the user doesn't have the SBT, request it
      const result = await provider.requestSBT(sbtType);
      console.log("requestSBT result", result);
      onSuccess();
    } catch (err) {
      console.log("requestSBT err", err);
      setFailedVerification(true);
    }
  }, [platform.name]);

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

      <ScrollableDiv className={styles.description} invertScrollIconColor={true}>
        {hasConfigurationError ? (
          <div>
            Something's missing! This Stamp needs an extra setup step to work properly. If you're the site owner, please
            add a generateSignatureCallback to the widget configuration.
          </div>
        ) : failedVerification ? (
          <div>
            Unable to claim this Stamp. Find <Hyperlink href={platform.documentationLink}>instructions here</Hyperlink>{" "}
            and come back after.
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
      </ScrollableDiv>
      <Button
        className={utilStyles.wFull}
        invert={true}
        disabled={isQuerying || claimed}
        onClick={async () => {
          if (hasConfigurationError) {
            onClose();
            return;
          }
          let signature, credential;
          if (platform.requiresSignature) {
            // get the challenge and  sign it
            if (!queryProps.address) {
              console.error("No address found");
              // TODO: manage error state
              setFailedVerification(true);
              return;
            }

            const challengeEndpoint = `${queryProps.embedServiceUrl}/embed/challenge`;
            const challenge = await getChallenge(challengeEndpoint, queryProps.address, platform.name);
            credential = challenge.credential;
            const _challenge = challenge.credential.credentialSubject.challenge;

            signature = await generateSignatureCallback!(_challenge);
          }

          if (platform.requiresPopup && platform.popupUrl) {
            // open the popup
            const oAuthPopUpUrl = `${platform.popupUrl}?address=${encodeURIComponent(
              queryProps.address || ""
            )}&scorerId=${encodeURIComponent(queryProps.scorerId || "")}&platform=${encodeURIComponent(
              platform.name
            )}&providers=${encodeURIComponent(JSON.stringify(platformCredentialIds))}&signature=${encodeURIComponent(
              signature || ""
            )}&credential=${encodeURIComponent(
              JSON.stringify(credential)
            )}&apiKey=${encodeURIComponent(queryProps.apiKey || "")}`;

            const popup = window.open(oAuthPopUpUrl, "passportPopup", "width=600,height=700");

            if (!popup) {
              console.error("Failed to open pop-up");
              return;
            }

            // Check if the pop-up is closed every 100ms
            const checkPopupClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkPopupClosed);
                console.log("Pop-up closed");
                // Verify platform credentials
                verifyCredentials(platformCredentialIds);
              }
            }, 100);
          } else if (["HumanIdKyc", "HumanIdPhone", "Biometrics", "CleanHands"].includes(platform.name)) {
            handleVerifyHumanID();
          } else {
            verifyCredentials(platformCredentialIds);
            setFailedVerification(false);
            setInitiatedVerification(true);
          }
        }}
      >
        {hasConfigurationError
          ? "Go Back"
          : failedVerification
            ? "Try Again"
            : claimed
              ? "Already Verified"
              : `Verify${isQuerying ? "ing..." : ""}`}
      </Button>
    </div>
  );
};
