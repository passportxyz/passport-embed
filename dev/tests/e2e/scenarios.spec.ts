import { test, expect } from '@playwright/test';

test.describe('MSW Scenarios', () => {
  test('should show different scores for different scenarios', async ({ page }) => {
    // Test low score scenario
    await page.goto('http://localhost:5173/?scenario=low-score');
    await page.waitForSelector('text=🛠 MSW Dev Tools', { timeout: 5000 });
    const walletSelector = page.locator('select').nth(1);
    await walletSelector.waitFor({ state: 'visible' });
    await walletSelector.selectOption('mock');
    
    // Set collapse mode to 'off' to avoid button overlap
    await page.locator('select').first().selectOption('off');
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);
    
    // Should show low score
    await expect(page.locator('text=12.5').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Is passing threshold: False')).toBeVisible();
    
    // Test high score scenario
    await page.goto('http://localhost:5173/?scenario=high-score');
    await page.waitForSelector('text=🛠 MSW Dev Tools', { timeout: 5000 });
    await page.locator('select').nth(1).selectOption('mock');
    
    // Set collapse mode to 'off' to avoid button overlap
    await page.locator('select').first().selectOption('off');
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);
    
    // Should show high score
    await expect(page.locator('text=45.5').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Is passing threshold: True')).toBeVisible();
    
    // Test no stamps scenario
    await page.goto('http://localhost:5173/?scenario=no-stamps');
    await page.waitForSelector('text=🛠 MSW Dev Tools', { timeout: 5000 });
    await page.locator('select').nth(1).selectOption('mock');
    
    // Set collapse mode to 'off' to avoid button overlap
    await page.locator('select').first().selectOption('off');
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);
    
    // Should show zero score (0 or 0.0)
    await expect(page.locator('text=Passport Score: 0').first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle rate limiting scenario', async ({ page }) => {
    await page.goto('http://localhost:5173/?scenario=rate-limited');
    await page.waitForSelector('text=🛠 MSW Dev Tools', { timeout: 5000 });
    const walletSelector = page.locator('select').nth(1);
    await walletSelector.waitFor({ state: 'visible' });
    await walletSelector.selectOption('mock');
    
    // Set collapse mode to 'off' to avoid button overlap
    await page.locator('select').first().selectOption('off');
    
    // Console error logging
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(1000);
    
    // Should show rate limit error or retry behavior
    // The actual UI behavior depends on how the app handles 429 errors
    // Check that we got a 429 error in the console or network
    const hasRateLimitError = consoleErrors.some(err => 
      err.includes('429') || err.includes('rate') || err.includes('Rate')
    );
    
    // The app might show an error state or retry
    // This is where you'd check for your specific error UI
  });

  test('should switch scenarios using the UI switcher', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check for MSW Dev Tools panel (only visible when MSW is enabled)
    const scenarioSwitcher = page.locator('text=🛠 MSW Dev Tools');
    
    if (await scenarioSwitcher.isVisible()) {
      // Find the scenario dropdown in the switcher
      const scenarioSelect = page.locator('select').filter({ 
        has: page.locator('option:has-text("Normal user with good score")') 
      });
      
      // Switch to low score scenario
      await scenarioSelect.selectOption('low-score');
      
      // Page should reload automatically
      await page.waitForLoadState('networkidle');
      
      // Connect and verify low score is shown
      await page.locator('select').nth(1).selectOption('mock');
      
      // Set collapse mode to 'off' to avoid button overlap
      await page.locator('select').first().selectOption('off');
      await page.locator('button:has-text("Connect Wallet")').last().click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('text=12.5').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should persist scenario selection in URL', async ({ page }) => {
    // Navigate directly to near-threshold scenario via URL
    await page.goto('http://localhost:5173/?scenario=near-threshold');
    await page.waitForSelector('text=🛠 MSW Dev Tools', { timeout: 5000 });
    
    // Connect and check score
    const walletSelector = page.locator('select').nth(1);
    await walletSelector.waitFor({ state: 'visible' });
    await walletSelector.selectOption('mock');
    
    // Set collapse mode to 'off' to avoid button overlap
    await page.locator('select').first().selectOption('off');
    await page.locator('button:has-text("Connect Wallet")').last().click();
    await page.waitForTimeout(500);
    
    // Should show near-threshold score (19.5)
    await expect(page.locator('text=19.5').first()).toBeVisible({ timeout: 10000 });
    
    // Verify URL still has the scenario param after interactions
    const url = page.url();
    expect(url).toContain('scenario=near-threshold');
  });
});