import type { JestConfigWithTsJest } from "ts-jest";

// Jest config not needed - e2e tests use Playwright
// Run e2e tests with: npm run test:e2e
const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: [], // No jest tests in dev
};

export default config;
