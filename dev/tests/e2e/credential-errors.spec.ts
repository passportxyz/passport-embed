import { test, expect } from "@playwright/test";

test.describe("Credential Error Handling", () => {
  test("should display credential errors when verification fails", async ({ page }) => {
    await page.goto("http://localhost:5173?scenario=credential-errors");

    // Select mock wallet
    const walletModeSelect = page.locator("select:has-text('Mock Wallet')");
    await walletModeSelect.selectOption("mockWallet");

    // Connect wallet
    await page.getByRole("button", { name: "Connect Wallet" }).last().click();

    // Wait for score to load
    await page.waitForSelector("text=Add Stamps", { timeout: 10000 });

    // Click Add Stamps to see platform options
    await page.getByRole("button", { name: "Add Stamps" }).click();

    // Click on a platform to verify
    await page.getByText("Discord").click();

    // Click Verify button
    await page.getByRole("button", { name: "Verify" }).click();

    // Wait for verification to complete (includes retries)
    await page.waitForSelector("text=Stamp Verification Unsuccessful", { timeout: 10000 });

    // Check that the error page is shown
    expect(await page.getByText("Stamp Verification Unsuccessful")).toBeVisible();
    expect(await page.getByText("Please try verifying another Stamp")).toBeVisible();

    // Verify tooltip icon is present for errors
    const tooltipIcon = page.locator("[data-testid='tooltip-icon']");
    expect(await tooltipIcon.isVisible()).toBe(true);

    // Hover over tooltip to see error details
    await tooltipIcon.hover();
    await page.waitForTimeout(500); // Wait for tooltip to appear

    // Check that Back to Stamps button is present
    expect(await page.getByRole("button", { name: "Back to Stamps" })).toBeVisible();
  });

  test("should show generic error when verification fails without specific errors", async ({ page }) => {
    await page.goto("http://localhost:5173?scenario=verification-fails");

    // Select mock wallet
    const walletModeSelect = page.locator("select:has-text('Mock Wallet')");
    await walletModeSelect.selectOption("mockWallet");

    // Connect wallet
    await page.getByRole("button", { name: "Connect Wallet" }).last().click();

    // Wait for score to load
    await page.waitForSelector("text=Add Stamps", { timeout: 10000 });

    // Click Add Stamps
    await page.getByRole("button", { name: "Add Stamps" }).click();

    // Click on a platform to verify
    await page.getByText("Google").first().click();

    // Click Verify button
    await page.getByRole("button", { name: "Verify" }).click();

    // Wait for verification to fail
    await page.waitForSelector("text=Stamp Verification Unsuccessful", { timeout: 10000 });

    // Check that the error page is shown
    expect(await page.getByText("Stamp Verification Unsuccessful")).toBeVisible();

    // Back to Stamps button should work
    await page.getByRole("button", { name: "Back to Stamps" }).click();

    // Should be back at the stamps list
    await page.waitForSelector("text=Add Stamps", { timeout: 5000 });
  });

  test("should successfully verify when no credential errors occur", async ({ page }) => {
    await page.goto("http://localhost:5173?scenario=verification-adds-stamps");

    // Select mock wallet
    const walletModeSelect = page.locator("select:has-text('Mock Wallet')");
    await walletModeSelect.selectOption("mockWallet");

    // Connect wallet
    await page.getByRole("button", { name: "Connect Wallet" }).last().click();

    // Wait for score to load
    await page.waitForSelector("text=Add Stamps", { timeout: 10000 });

    // Click Add Stamps
    await page.getByRole("button", { name: "Add Stamps" }).click();

    // Click on a platform to verify
    await page.getByText("Google").first().click();

    // Click Verify button
    await page.getByRole("button", { name: "Verify" }).click();

    // Wait for verification to succeed
    await page.waitForSelector("text=Congratulations!", { timeout: 10000 });

    // Check success state
    expect(await page.getByText("Congratulations!")).toBeVisible();
    expect(await page.getByText(/You've verified credentials/)).toBeVisible();

    // Back to Stamps button should be present
    expect(await page.getByRole("button", { name: "Back to Stamps" })).toBeVisible();
  });
});