import { test, expect } from "@playwright/test";

test.describe("Passport Widget with MSW Mocks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Passport Widgets Example")');

    // Wait for MSW Dev Tools panel to be visible
    await page.waitForSelector("text=🛠 MSW Dev Tools", { timeout: 5000 });
  });

  test("should display MSW active indicator", async ({ page }) => {
    // Check that MSW Dev Tools panel is active
    await expect(page.locator("text=🛠 MSW Dev Tools")).toBeVisible();
    await expect(page.locator("text=Active").first()).toBeVisible();
  });

  test("should allow switching between wallet modes", async ({ page }) => {
    // Find the wallet mode selector (second select on page - first is collapse mode)
    const walletSelector = page.locator("select").nth(1);
    await expect(walletSelector).toBeVisible();

    // Switch to mock wallet
    await walletSelector.selectOption("mock");

    // Should show mock wallet indicator
    await expect(page.locator("text=🔧 Using mock wallet - no real transactions")).toBeVisible();

    // Switch back to MetaMask
    await walletSelector.selectOption("metamask");

    // Mock wallet indicator should disappear
    await expect(page.locator("text=🔧 Using mock wallet - no real transactions")).not.toBeVisible();
  });

  test("should connect with mock wallet and display passport score", async ({ page }) => {
    // Wait for and switch to mock wallet mode (second select on page)
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off' to avoid button overlap
    await page.locator("select").first().selectOption("off");

    // Click connect wallet button in the widget body (not the collapsed header)
    const connectButton = page.locator('button:has-text("Connect Wallet")').last();
    await connectButton.click();

    // Wait for connection (mock wallet has 300ms delay)
    await page.waitForTimeout(500);

    // Check that score is displayed (from our mock data)
    await expect(page.locator("text=25.5").first()).toBeVisible({ timeout: 10000 });

    // Check threshold is displayed
    await expect(page.locator("text=20").first()).toBeVisible();

    // Check passing status (look for "True" in passing status field)
    await expect(page.locator("text=Is passing threshold: True")).toBeVisible();
  });

  test("should display stamps from mock data", async ({ page }) => {
    // Wait for and switch to mock wallet (second select on page)
    const walletSelector = page.locator("select").nth(1);
    await walletSelector.waitFor({ state: "visible" });
    await walletSelector.selectOption("mock");

    // Set collapse mode to 'off' to avoid button overlap
    await page.locator("select").first().selectOption("off");

    // Connect wallet (use last() to get widget body button, not header)
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);

    // Wait for data to load
    await page.waitForSelector("text=25.5", { timeout: 10000 });

    // Check that stamps are displayed in the DirectPassportDataAccess component
    await expect(page.locator("text=Google")).toBeVisible();
    await expect(page.locator("text=Twitter")).toBeVisible();
    await expect(page.locator("text=GitHub")).toBeVisible();
    await expect(page.locator("text=LinkedIn")).toBeVisible();
  });

  test("should handle collapse mode changes", async ({ page }) => {
    // Find collapse mode selector (first select element)
    const collapseModeSelector = page.locator("select").first();

    // Test different collapse modes
    await collapseModeSelector.selectOption("shift");
    await expect(collapseModeSelector).toHaveValue("shift");

    await collapseModeSelector.selectOption("overlay");
    await expect(collapseModeSelector).toHaveValue("overlay");

    await collapseModeSelector.selectOption("off");
    await expect(collapseModeSelector).toHaveValue("off");
  });

  test("should show Proof of Unique Humanity text before connection", async ({ page }) => {
    // Before connecting, should show the intro text
    await expect(page.locator("text=Proof of Unique Humanity")).toBeVisible();
    await expect(page.locator("text=/unique human, rather than a bot/")).toBeVisible();
  });
});
