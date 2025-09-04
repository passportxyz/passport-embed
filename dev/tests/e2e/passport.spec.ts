import { test, expect } from "@playwright/test";

test.describe("Passport Widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForSelector('h1:has-text("Passport Widgets Example")');
    // Wait for MSW to be ready
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });
  });

  test("should show connect wallet prompt when disconnected", async ({ page }) => {
    // Check for connect wallet UI in the widget
    await expect(page.locator("text=Connect Wallet").first()).toBeVisible();
    await expect(page.locator("text=Proof of Unique Humanity")).toBeVisible();
  });

  test("should display passport score when connected", async ({ page }) => {
    // Switch to mock wallet and connect (second select on page)
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off' to avoid button overlap
    await page.locator("select").first().selectOption("off");

    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);

    // Check for score display (default scenario has score 25.5)
    await expect(page.locator("text=25.5").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Is passing threshold: True")).toBeVisible();
  });

  test("should show low score warning", async ({ page }) => {
    // Navigate to low-score scenario
    await page.goto("http://localhost:5173/?scenario=low-score");
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });

    // Connect with mock wallet (second select on page)
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off' to avoid button overlap
    await page.locator("select").first().selectOption("off");

    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);

    // Check for low score (12.5 in low-score scenario)
    await expect(page.locator("text=12.5").first()).toBeVisible({ timeout: 10000 });
    // Score is below threshold, so should show False for passing status
    await expect(page.locator("text=Is passing threshold: False")).toBeVisible();
  });

  test("should handle rate limiting gracefully", async ({ page }) => {
    // Navigate to rate-limited scenario
    await page.goto("http://localhost:5173/?scenario=rate-limited");
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });

    // Try to connect with mock wallet (second select on page)
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off' to avoid button overlap
    await page.locator("select").first().selectOption("off");

    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(1000);

    // In rate-limited scenario, the API returns 429 errors
    // The widget should handle this gracefully (may show error or retry)
    // Check that the page doesn't crash and still shows the widget
    await expect(page.locator('h1:has-text("Passport Widgets Example")')).toBeVisible();
  });
});
