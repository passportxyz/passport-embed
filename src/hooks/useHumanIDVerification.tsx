import { useCallback, useEffect, useState, useMemo } from "react";
import { Platform } from "./stampTypes";

// Types from the SDK (for type safety without importing)
type CredentialType = "kyc" | "phone" | "biometrics" | "clean-hands";
interface HubV3SBT {
  expiry: bigint;
  revoked: boolean;
}

// Lazy-load the Human ID SDK to avoid BigInt issues on initial page load
const getHumanIdSdk = async () => {
  const sdk = await import("@holonym-foundation/human-id-sdk");
  return sdk;
};

interface UseHumanIDVerificationParams {
  platform: Platform;
  address?: string;
  enabled?: boolean;
}

interface UseHumanIDVerificationReturn {
  isHumanIDPlatform: boolean;
  hasExistingSBT: boolean;
  isCheckingSBT: boolean;
  isVerifying: boolean;
  verifyHumanID: () => Promise<boolean>; // Returns true on success, throws on error
}

const HUMAN_ID_PLATFORMS = ["HumanIdKyc", "HumanIdPhone", "Biometrics", "CleanHands"];

const getPlatformCredentialType = (platformId: string): CredentialType => {
  switch (platformId) {
    case "HumanIdKyc":
      return "kyc";
    case "HumanIdPhone":
      return "phone";
    case "Biometrics":
      return "biometrics";
    case "CleanHands":
      return "clean-hands";
    default:
      throw new Error(`Unsupported Human ID platform: ${platformId}`);
  }
};

const validateSBT = (sbt: HubV3SBT | null | undefined): boolean => {
  if (sbt && typeof sbt === "object" && "expiry" in sbt) {
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    return sbt.expiry > currentTime && !sbt.revoked;
  }
  return false;
};

export const useHumanIDVerification = ({
  platform,
  address,
  enabled = false,
}: UseHumanIDVerificationParams): UseHumanIDVerificationReturn => {
  const [hasExistingSBT, setHasExistingSBT] = useState(false);
  const [isCheckingSBT, setIsCheckingSBT] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isHumanIDPlatform = useMemo(() => HUMAN_ID_PLATFORMS.includes(platform.platformId), [platform.platformId]);

  const checkExistingSBT = useCallback(async () => {
    if (!address || !isHumanIDPlatform) {
      return false;
    }

    const addressAsHex = address as `0x${string}`;

    try {
      const sdk = await getHumanIdSdk();
      let result: boolean = false;

      switch (platform.platformId) {
        case "HumanIdKyc": {
          const sbt = await sdk.getKycSBTByAddress(addressAsHex);
          result = validateSBT(sbt as HubV3SBT);
          break;
        }
        case "HumanIdPhone": {
          const sbt = await sdk.getPhoneSBTByAddress(addressAsHex);
          result = validateSBT(sbt as HubV3SBT);
          break;
        }
        case "Biometrics": {
          const sbt = await sdk.getBiometricsSBTByAddress(addressAsHex);
          result = validateSBT(sbt as HubV3SBT);
          break;
        }
        case "CleanHands": {
          const attestation = await sdk.getCleanHandsSPAttestationByAddress(addressAsHex);
          result = !!attestation;
          break;
        }
      }

      return result;
    } catch (err) {
      // SBT query functions throw if the address is not found
      // This is expected behavior, not an error condition
      console.log("SBT check error (expected if not found):", err);
      return false;
    }
  }, [address, isHumanIDPlatform, platform.platformId]);

  // Check for existing SBT when enabled
  useEffect(() => {
    if (!enabled || !isHumanIDPlatform || !address) {
      return;
    }

    let cancelled = false;

    const checkSBT = async () => {
      setIsCheckingSBT(true);
      try {
        const hasSBT = await checkExistingSBT();
        if (!cancelled) {
          setHasExistingSBT(hasSBT);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSBT(false);
        }
      }
    };

    checkSBT();

    return () => {
      cancelled = true;
    };
  }, [enabled, isHumanIDPlatform, address, checkExistingSBT]);

  const verifyHumanID = useCallback(async (): Promise<boolean> => {
    if (!isHumanIDPlatform) {
      throw new Error(`Platform ${platform.name} is not a Human ID platform`);
    }

    if (!address) {
      throw new Error("No address provided");
    }

    setIsVerifying(true);

    try {
      // Check if user already has the SBT
      const hasSBT = await checkExistingSBT();

      if (hasSBT) {
        setHasExistingSBT(true);
        return true;
      }

      // Lazy-load and initialize Human ID provider
      const sdk = await getHumanIdSdk();
      const provider = sdk.initHumanID();
      const credentialType = getPlatformCredentialType(platform.platformId);

      // Request the SBT
      const result = await provider.requestSBT(credentialType);
      console.log("requestSBT result", result);

      setHasExistingSBT(true);
      return true;
    } catch (err) {
      console.error("Human ID verification error:", err);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, [isHumanIDPlatform, platform.platformId, platform.name, address, checkExistingSBT]);

  return {
    isHumanIDPlatform,
    hasExistingSBT,
    isCheckingSBT,
    isVerifying,
    verifyHumanID,
  };
};
