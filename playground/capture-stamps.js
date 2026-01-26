const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001?scenario=low-score');
  await page.waitForTimeout(2000);
  
  // Connect and go to stamps
  await page.locator('button:has-text("Connect Wallet")').last().click();
  await page.waitForTimeout(2000);
  
  await page.locator('button:has-text("Add Stamps")').click();
  await page.waitForTimeout(1500);
  
  // Take full screenshot of just the widget area
  const widget = page.locator('.max-w-sm').first();
  await widget.screenshot({ path: '/tmp/widget-stamps-new.png' });
  console.log('Captured stamps view');
  
  await browser.close();
})();
