/**
 * Mock implementation of @holonym-foundation/human-id-sdk for development
 * This mock is used when VITE_ENABLE_MSW=true to avoid external calls
 */

import { scenarioManager } from "./ScenarioManager";

// Mock types to match the real SDK
export type CredentialType = "kyc" | "phone" | "biometrics" | "clean-hands";

export interface HubV3SBT {
  expiry: bigint;
  revoked: boolean;
}

// Track verification state
// let verificationInProgress = false; // Currently unused but may be needed for tracking state

/**
 * Mock initialization - returns a mock provider with requestSBT method (synchronous like real SDK)
 */
export const initHumanID = (config?: unknown) => {
  console.log("[Mock Human ID] Initializing with config:", config);

  // Return a mock provider that matches what the SDK expects
  return {
    requestSBT: async (credentialType: CredentialType) => {
      console.log(`[Mock Human ID] requestSBT called for ${credentialType}`);

      const scenario = scenarioManager.getCurrentScenario();

      // Simulate the verification flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check scenario for verification behavior
      if (scenario.humanIdVerificationBehavior === "failure") {
        console.log(`[Mock Human ID] Verification failed (scenario: ${scenario.name})`);
        throw new Error("User cancelled or verification failed");
      }

      console.log(`[Mock Human ID] Verification successful`);

      // Return mock SBT data
      return {
        success: true,
        sbt: {
          expiry: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 days from now
          revoked: false,
        },
      };
    },
  };
};

/**
 * Mock SBT check - returns based on current scenario
 */
const checkSBTByScenario = async (credentialType: CredentialType): Promise<HubV3SBT> => {
  const scenario = scenarioManager.getCurrentScenario();

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Check if scenario has existing SBT for this credential
  if (scenario.hasExistingSBTs?.includes(credentialType)) {
    console.log(`[Mock Human ID] Found existing ${credentialType} SBT`);
    return {
      expiry: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 days from now
      revoked: false,
    };
  }

  console.log(`[Mock Human ID] No ${credentialType} SBT found`);
  // The real SDK throws for both non-existent AND expired SBTs
  // The app treats both the same way - user needs to verify
  throw new Error("SBT is expired or does not exist");
};

export const getKycSBTByAddress = async (address: string): Promise<HubV3SBT> => {
  console.log(`[Mock Human ID] Checking KYC SBT for address: ${address}`);
  return checkSBTByScenario("kyc");
};

export const getPhoneSBTByAddress = async (address: string): Promise<HubV3SBT> => {
  console.log(`[Mock Human ID] Checking Phone SBT for address: ${address}`);
  return checkSBTByScenario("phone");
};

export const getBiometricsSBTByAddress = async (address: string): Promise<HubV3SBT> => {
  console.log(`[Mock Human ID] Checking Biometrics SBT for address: ${address}`);
  return checkSBTByScenario("biometrics");
};

export const getCleanHandsSPAttestationByAddress = async (address: string): Promise<HubV3SBT> => {
  console.log(`[Mock Human ID] Checking Clean Hands attestation for address: ${address}`);
  return checkSBTByScenario("clean-hands");
};

/**
 * Mock verification request - simulates the iframe flow
 */
export const requestCredential = async (
  credentialType: CredentialType,
  callback: (result: { status: string; error?: string; sbt?: HubV3SBT }) => void
) => {
  console.log(`[Mock Human ID] Starting ${credentialType} verification flow`);

  const scenario = scenarioManager.getCurrentScenario();
  // verificationInProgress = true; // Currently unused

  // Simulate iframe opening and verification process
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Check scenario for verification behavior
  if (scenario.humanIdVerificationBehavior === "failure") {
    console.log(`[Mock Human ID] Verification failed (scenario: ${scenario.name})`);
    callback({
      status: "error",
      error: "Verification failed - user cancelled or error occurred",
    });
  } else {
    console.log(`[Mock Human ID] Verification successful`);
    callback({
      status: "success",
      credential: {
        type: credentialType,
        timestamp: Date.now(),
        // Mock credential data
      },
    });
  }

  verificationInProgress = false;
};

/**
 * Mock function to set Optimism RPC URL (no-op in mock)
 */
export const setOptimismRpcUrl = (url: string) => {
  console.log(`[Mock Human ID] Setting Optimism RPC URL: ${url}`);
};

// Export a flag to help identify mock vs real
export const IS_MOCK = true;
