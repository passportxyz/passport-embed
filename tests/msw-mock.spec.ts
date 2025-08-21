import { test, expect } from '@playwright/test';

test.describe('Passport Widget with MSW Mocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Passport Widgets Example")');
  });

  test('should display MSW active indicator', async ({ page }) => {
    // Check that MSW is active
    await expect(page.locator('text=🔧 MSW Active')).toBeVisible();
  });

  test('should allow switching between wallet modes', async ({ page }) => {
    // Check wallet mode selector exists
    const walletSelector = page.locator('select').first();
    await expect(walletSelector).toBeVisible();
    
    // Switch to mock wallet
    await walletSelector.selectOption('mock');
    
    // Should show mock wallet indicator
    await expect(page.locator('text=🔧 Using mock wallet')).toBeVisible();
    
    // Switch back to MetaMask
    await walletSelector.selectOption('metamask');
    
    // Mock wallet indicator should disappear
    await expect(page.locator('text=🔧 Using mock wallet')).not.toBeVisible();
  });

  test('should connect with mock wallet and display passport score', async ({ page }) => {
    // Switch to mock wallet mode
    await page.locator('select').first().selectOption('mock');
    
    // Click connect wallet button in the widget
    const connectButton = page.locator('button:has-text("Connect Wallet")');
    await connectButton.click();
    
    // Wait for connection (mock wallet has 300ms delay)
    await page.waitForTimeout(500);
    
    // Check that score is displayed (from our mock data)
    await expect(page.locator('text=25.5').first()).toBeVisible({ timeout: 10000 });
    
    // Check threshold is displayed
    await expect(page.locator('text=20').first()).toBeVisible();
    
    // Check passing status
    await expect(page.locator('text=/Pass/i')).toBeVisible();
  });

  test('should display stamps from mock data', async ({ page }) => {
    // Switch to mock wallet
    await page.locator('select').first().selectOption('mock');
    
    // Connect wallet
    await page.locator('button:has-text("Connect Wallet")').click();
    await page.waitForTimeout(500);
    
    // Wait for data to load
    await page.waitForSelector('text=25.5', { timeout: 10000 });
    
    // Check that stamps are displayed in the DirectPassportDataAccess component
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=Twitter')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=LinkedIn')).toBeVisible();
  });

  test('should handle collapse mode changes', async ({ page }) => {
    // Find collapse mode selector (second select element)
    const collapseModeSelector = page.locator('select').nth(1);
    
    // Test different collapse modes
    await collapseModeSelector.selectOption('shift');
    await expect(collapseModeSelector).toHaveValue('shift');
    
    await collapseModeSelector.selectOption('overlay');
    await expect(collapseModeSelector).toHaveValue('overlay');
    
    await collapseModeSelector.selectOption('off');
    await expect(collapseModeSelector).toHaveValue('off');
  });

  test('should show Proof of Unique Humanity text before connection', async ({ page }) => {
    // Before connecting, should show the intro text
    await expect(page.locator('text=Proof of Unique Humanity')).toBeVisible();
    await expect(page.locator('text=/unique human, rather than a bot/')).toBeVisible();
  });
});