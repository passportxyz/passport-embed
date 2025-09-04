import { test as base, expect } from "@playwright/test";
import type { MockServiceWorker } from "playwright-msw";
import { createWorkerFixture } from "playwright-msw";
import { handlers } from "../../src/mocks/handlers";

// Extend Playwright test with MSW worker
export const test = base.extend<{
  worker: MockServiceWorker;
}>({
  worker: createWorkerFixture(handlers),
});

export { expect };

// Helper to mock different wallet scenarios
export async function mockWalletScenario(
  page: { evaluate: (fn: (address: string | null) => void, arg: string | null) => Promise<void> },
  scenario: "connected" | "disconnected" | "low-score"
) {
  const addresses = {
    connected: "0x1234567890123456789012345678901234567890",
    disconnected: null,
    "low-score": "0x0000000000000000000000000000000000000000",
  };

  await page.evaluate((address) => {
    // Set mock wallet state in the browser context
    window.__MOCK_WALLET_ADDRESS__ = address;
  }, addresses[scenario]);
}

// Helper to wait for React Query to settle
export async function waitForQuery(page: { waitForFunction: (fn: () => boolean) => Promise<void> }) {
  await page.waitForFunction(() => {
    const queryClient = window.__REACT_QUERY_CLIENT__;
    if (!queryClient) return true;
    return queryClient.isFetching() === 0 && queryClient.isMutating() === 0;
  });
}
