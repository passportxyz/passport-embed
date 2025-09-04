import { useCallback, useEffect, useState, useMemo } from "react";
import {
  initHumanID,
  getKycSBTByAddress,
  getPhoneSBTByAddress,
  getBiometricsSBTByAddress,
  getCleanHandsSPAttestationByAddress,
  type CredentialType,
  type HubV3SBT,
} from "@holonym-foundation/human-id-sdk";
import { Platform } from "./stampTypes";

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
  error: Error | null;
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

const validateSBT = (sbt: HubV3SBT): boolean => {
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
  const [error, setError] = useState<Error | null>(null);

  const isHumanIDPlatform = useMemo(() => HUMAN_ID_PLATFORMS.includes(platform.platformId), [platform.platformId]);

  const checkExistingSBT = useCallback(async () => {
    if (!address || !isHumanIDPlatform) {
      return false;
    }

    const addressAsHex = address as `0x${string}`;

    try {
      let result: boolean = false;

      switch (platform.platformId) {
        case "HumanIdKyc": {
          const sbt = await getKycSBTByAddress(addressAsHex);
          result = validateSBT(sbt);
          break;
        }
        case "HumanIdPhone": {
          const sbt = await getPhoneSBTByAddress(addressAsHex);
          result = validateSBT(sbt);
          break;
        }
        case "Biometrics": {
          const sbt = await getBiometricsSBTByAddress(addressAsHex);
          result = validateSBT(sbt);
          break;
        }
        case "CleanHands": {
          const attestation = await getCleanHandsSPAttestationByAddress(addressAsHex);
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
      const error = new Error(`Platform ${platform.name} is not a Human ID platform`);
      setError(error);
      throw error;
    }

    if (!address) {
      const error = new Error("No address provided");
      setError(error);
      throw error;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Check if user already has the SBT
      const hasSBT = await checkExistingSBT();

      if (hasSBT) {
        setHasExistingSBT(true);
        return true;
      }

      // Initialize Human ID provider (idempotent)
      const provider = initHumanID();
      const credentialType = getPlatformCredentialType(platform.platformId);

      // Request the SBT
      const result = await provider.requestSBT(credentialType);
      console.log("requestSBT result", result);

      setHasExistingSBT(true);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Human ID verification error:", error);
      setError(error);
      throw error;
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
    error,
  };
};
