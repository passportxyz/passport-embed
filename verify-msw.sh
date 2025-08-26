#!/bin/bash

echo "Testing MSW Mock Setup"
echo "====================="

# Check if dev server is running
echo -n "1. Dev server status: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    echo "✓ Running"
else
    echo "✗ Not running"
    exit 1
fi

# Check if MSW service worker is available
echo -n "2. MSW Service Worker: "
if curl -s http://localhost:5173/mockServiceWorker.js | grep -q "Mock Service Worker"; then
    echo "✓ Available"
else
    echo "✗ Not found"
fi

# Check page content
echo -n "3. Example app loaded: "
if curl -s http://localhost:5173 | grep -q "Passport Widgets Example"; then
    echo "✓ Found"
else
    echo "✗ Not found"
fi

echo ""
echo "Manual Testing Instructions:"
echo "============================="
echo "1. Open http://localhost:5173 in your browser"
echo "2. Open browser DevTools Console"
echo "3. Look for '[MSW] Mock Service Worker started' message"
echo "4. Look for '🔧 MSW Active' indicator at bottom-left of page"
echo "5. Use the wallet mode dropdown to select 'Mock Wallet (Testing)'"
echo "6. Click 'Connect Wallet' button"
echo "7. You should see:"
echo "   - Mock address: 0x1234567890123456789012345678901234567890"
echo "   - Passport Score: 25.5"
echo "   - Threshold: 20"
echo "   - Stamps: Google, Twitter, GitHub, LinkedIn"
echo ""
echo "The MSW mocks intercept all API calls to the passport service"
echo "so you don't need the real backend running!"