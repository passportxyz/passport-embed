// Environment configuration for different modes
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
export const isProduction = process.env.NODE_ENV === 'production';

// Enable mocking in development and test environments
export const ENABLE_MOCKING = process.env.VITE_ENABLE_MOCKING === 'true' || isDevelopment || isTest;

// Mock wallet configuration
export const USE_MOCK_WALLET = process.env.VITE_USE_MOCK_WALLET === 'true' || isDevelopment || isTest;

// API configuration
export const API_MODE = process.env.VITE_API_MODE || (ENABLE_MOCKING ? 'mock' : 'real');

export const config = {
  mocking: {
    enabled: ENABLE_MOCKING,
    delayMs: parseInt(process.env.VITE_MOCK_DELAY || '100'),
  },
  wallet: {
    useMock: USE_MOCK_WALLET,
    defaultAddress: process.env.VITE_DEFAULT_ADDRESS || '0x1234567890123456789012345678901234567890',
  },
  api: {
    mode: API_MODE,
    baseUrl: process.env.VITE_API_BASE_URL,
  },
};