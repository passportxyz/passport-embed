import { test, expect, mockWalletScenario, waitForQuery } from '../utils/mockSetup';

test.describe('Passport Widget', () => {
  test.beforeEach(async ({ page, worker }) => {
    // MSW will intercept all API calls
    await page.goto('http://localhost:5173'); // Your dev server
  });

  test('should show connect wallet prompt when disconnected', async ({ page }) => {
    await mockWalletScenario(page, 'disconnected');
    
    // Check for connect wallet UI
    await expect(page.getByText('Connect Wallet')).toBeVisible();
    await expect(page.getByText('Proof of Unique Humanity')).toBeVisible();
  });

  test('should display passport score when connected', async ({ page }) => {
    await mockWalletScenario(page, 'connected');
    await waitForQuery(page);
    
    // Check for score display
    await expect(page.getByText('25.5')).toBeVisible(); // Mock score
    await expect(page.getByText('Passing')).toBeVisible();
  });

  test('should show low score warning', async ({ page }) => {
    await mockWalletScenario(page, 'low-score');
    await waitForQuery(page);
    
    // Check for low score UI
    await expect(page.getByText('15')).toBeVisible(); // Below threshold
    await expect(page.getByText('Below threshold')).toBeVisible();
  });

  test('should handle rate limiting gracefully', async ({ page, worker }) => {
    // Override handler to simulate rate limit
    await worker.use(
      // Add rate limit handler
    );
    
    await mockWalletScenario(page, 'connected');
    await waitForQuery(page);
    
    // Check for rate limit handling
    await expect(page.getByText('Rate limited')).toBeVisible();
  });
});