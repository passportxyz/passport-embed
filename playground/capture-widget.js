const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to low-score scenario...');
  await page.goto('http://localhost:3001?scenario=low-score');
  await page.waitForTimeout(2000);
  
  // Click Connect Wallet
  const connectBtn = page.locator('button:has-text("Connect Wallet")').last();
  await connectBtn.click();
  await page.waitForTimeout(2000);
  
  // Screenshot: Low score state
  await page.screenshot({ path: '/tmp/widget-lowscore.png', fullPage: false });
  console.log('Captured: Low score state');
  
  // Click Add Stamps
  const addStampsBtn = page.locator('button:has-text("Add Stamps")');
  if (await addStampsBtn.isVisible()) {
    await addStampsBtn.click();
    await page.waitForTimeout(1500);
    
    // Screenshot: Stamps list
    await page.screenshot({ path: '/tmp/widget-stamps.png', fullPage: false });
    console.log('Captured: Stamps list');
    
    // Find buttons in the widget area
    const platformBtns = await page.locator('button').all();
    for (const btn of platformBtns) {
      const text = await btn.textContent();
      if (text && (text.includes('ETH') || text.includes('Google') || text.includes('Discord'))) {
        console.log(`Found platform button: ${text}`);
        await btn.click();
        await page.waitForTimeout(500);
        
        // Screenshot: Platform verification
        await page.screenshot({ path: '/tmp/widget-platform.png', fullPage: false });
        console.log('Captured: Platform verification');
        break;
      }
    }
  }
  
  // Now high score
  console.log('\nNavigating to high-score scenario...');
  await page.goto('http://localhost:3001?scenario=high-score');
  await page.waitForTimeout(2000);
  
  const connectBtn2 = page.locator('button:has-text("Connect Wallet")').last();
  await connectBtn2.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/tmp/widget-congrats.png', fullPage: false });
  console.log('Captured: Congrats state');
  
  await browser.close();
  console.log('\nDone! Screenshots in /tmp/widget-*.png');
})();
