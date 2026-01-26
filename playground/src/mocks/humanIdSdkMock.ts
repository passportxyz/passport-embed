// Mock for @holonym-foundation/human-id-sdk
// Used in playground to avoid dependency conflicts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setOptimismRpcUrl = (url: string) => {
  // No-op in playground
};

export const initHumanID = () => ({
  requestSBT: async () => {
    console.log('[Mock] Human ID SDK not available in playground');
    throw new Error('Human ID verification not available in playground demo');
  },
});

export const getKycSBTByAddress = async () => null;
export const getPhoneSBTByAddress = async () => null;
export const getBiometricsSBTByAddress = async () => null;
export const getCleanHandsSPAttestationByAddress = async () => null;

export type CredentialType = 'kyc' | 'phone' | 'biometrics' | 'clean-hands';
export type HubV3SBT = { expiry: bigint; revoked: boolean };
