/* eslint-disable */

import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Mock the Human ID SDK
jest.mock("@holonym-foundation/human-id-sdk", () => ({
  initHumanID: jest.fn(() => ({
    requestSBT: jest.fn().mockResolvedValue({ success: true }),
  })),
  getKycSBTByAddress: jest.fn().mockResolvedValue(null),
  getPhoneSBTByAddress: jest.fn().mockResolvedValue(null),
  getBiometricsSBTByAddress: jest.fn().mockResolvedValue(null),
  getCleanHandsSPAttestationByAddress: jest.fn().mockResolvedValue(null),
}));
