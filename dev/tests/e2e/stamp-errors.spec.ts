import { test, expect } from "@playwright/test";

test.describe("Stamp Pages Error Scenarios", () => {
  test("handles server error (500) when fetching stamp pages", async ({ page }) => {
    // Navigate directly to stamps-fetch-error scenario
    await page.goto("http://localhost:5173?scenario=stamps-fetch-error");
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });

    // Verify scenario is set correctly
    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);
    expect(currentUrl).toContain("scenario=stamps-fetch-error");

    // Verify the scenario shows in DevToolsPanel
    const scenarioSelect = page.locator("select").nth(2); // Third select is scenario
    const selectedScenario = await scenarioSelect.inputValue();
    console.log("Selected scenario in dropdown:", selectedScenario);

    // Select mock wallet (2nd select is wallet mode)
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off' to avoid button overlap
    await page.locator("select").first().selectOption("off");

    // Connect wallet (use last() to get the widget button, not the dev tools)
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(1000);

    // Click Add Stamps button to trigger stamp pages fetch
    await page.click('button:has-text("Add Stamps")');

    // Wait for either the error message or timeout after 10 seconds (React Query will retry)
    const errorText = await page
      .waitForSelector("text=/Request failed with status code 500|Failed to load stamp pages|Network Error/", {
        timeout: 10000,
      })
      .catch(() => null);

    if (!errorText) {
      // Take screenshot if error didn't appear
      await page.screenshot({ path: "test-results/stamps-fetch-error-timeout.png", fullPage: true });
      const bodyText = await page.locator("body").textContent();
      console.log("Page content after timeout:", bodyText?.substring(0, 500));
    }

    // Verify error message is displayed
    expect(errorText).toBeTruthy();

    // Verify Try Again button is present
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();

    // Test Try Again functionality
    await page.click('button:has-text("Try Again")');

    // Wait for React Query to retry and show error again
    await page.waitForSelector("text=/Request failed with status code 500/", { timeout: 10000 });

    // Should still show error (scenario hasn't changed)
    await expect(page.getByText(/Request failed with status code 500/)).toBeVisible();
  });

  test("handles configuration error (401) for invalid API key", async ({ page }) => {
    // Navigate directly to stamps-config-error scenario
    await page.goto("http://localhost:5173?scenario=stamps-config-error");
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });

    // Select mock wallet
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off'
    await page.locator("select").first().selectOption("off");

    // Connect wallet
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(1000);

    // Click Add Stamps button
    await page.click('button:has-text("Add Stamps")');

    // Wait for React Query retries to complete and error to appear
    const errorText = await page
      .waitForSelector("text=/Request failed with status code 401/", { timeout: 10000 })
      .catch(() => null);

    // Verify error message is displayed
    expect(errorText).toBeTruthy();

    // Verify Try Again button is present
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test("handles not found error (404) when scorer not found", async ({ page }) => {
    // Navigate directly to stamps-not-found scenario
    await page.goto("http://localhost:5173?scenario=stamps-not-found");
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });

    // Select mock wallet
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off'
    await page.locator("select").first().selectOption("off");

    // Connect wallet
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(1000);

    // Click Add Stamps button
    await page.click('button:has-text("Add Stamps")');

    // Wait for React Query retries to complete and error to appear
    const errorText = await page
      .waitForSelector("text=/Request failed with status code 404/", { timeout: 10000 })
      .catch(() => null);

    // Verify error message is displayed
    expect(errorText).toBeTruthy();

    // Verify Try Again button is present
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test("handles rate limit error (429) on stamp pages endpoint", async ({ page }) => {
    // Navigate directly to stamps-rate-limited scenario
    await page.goto("http://localhost:5173?scenario=stamps-rate-limited");
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });

    // Select mock wallet
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off'
    await page.locator("select").first().selectOption("off");

    // Connect wallet
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(1000);

    // Click Add Stamps button
    await page.click('button:has-text("Add Stamps")');

    // Wait for error to appear (429 doesn't retry per React Query config)
    const errorText = await page
      .waitForSelector("text=/Request failed with status code 429/", { timeout: 10000 })
      .catch(() => null);

    // Verify error message is displayed
    expect(errorText).toBeTruthy();

    // Verify Try Again button is present
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });
});
