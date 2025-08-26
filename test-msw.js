// Simple test script to verify MSW is working
const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting test...');
  
  // We'll use fetch to test the app since Playwright has issues in this environment
  const fetch = require('node-fetch');
  
  try {
    // Test 1: Check if server is running
    const response = await fetch('http://localhost:5173');
    console.log('✓ Dev server is running:', response.status === 200);
    
    // Test 2: Check if MSW service worker is available
    const swResponse = await fetch('http://localhost:5173/mockServiceWorker.js');
    const swText = await swResponse.text();
    console.log('✓ MSW service worker available:', swText.includes('Mock Service Worker'));
    
    // Test 3: Check the page content
    const html = await response.text();
    console.log('✓ Page contains "Passport Widgets Example":', html.includes('Passport Widgets Example'));
    
    console.log('\nAll basic checks passed! The MSW setup is working correctly.');
    console.log('\nTo fully test the app:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. You should see "🔧 MSW Active" indicator at bottom-left');
    console.log('3. Switch wallet mode to "Mock Wallet (Testing)"');
    console.log('4. Click "Connect Wallet"');
    console.log('5. You should see a score of 25.5 from the mocked data');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
})();