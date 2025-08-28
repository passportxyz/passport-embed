### [15:57] [gotcha] MSW files incorrectly converted to JavaScript
**Details**: During the MSW refactor, TypeScript files were incorrectly converted to JavaScript. This project uses TypeScript throughout, and all MSW mock files (scenarios, handlers, mockWallet, ScenarioManager) should be in TypeScript (.ts files) not JavaScript (.js files). This conversion error can cause type issues and breaks the project's consistency.
**Files**: dev/src/mocks/scenarios.js, dev/src/mocks/handlers.js, dev/src/mocks/mockWallet.js, dev/src/mocks/ScenarioManager.js
---

### [16:24] [config] Playwright MCP configuration for Fedora
**Details**: The Playwright MCP server configuration in .mcp.json needs to specify --browser chromium and --headless for Fedora systems since Chrome isn't easily available. Also created fedora-install-playwright-deps.sh script to install all required system dependencies for running Playwright browsers on Fedora/RHEL systems. The script installs libraries for Chromium, Firefox, and WebKit support.
**Files**: .mcp.json, fedora-install-playwright-deps.sh
---

### [16:29] [workflow] Playwright MCP testing workflow on Fedora
**Details**: Successfully configured Playwright MCP to work on Fedora systems. Key steps:
1. Updated .mcp.json to use --browser chromium --headless instead of Chrome
2. Created fedora-install-playwright-deps.sh script to install required system libraries
3. Created dev/.env file with dummy API key and scorer ID for MSW testing
4. Dev server runs with npm run dev:mock on changing ports (5173, 5174, etc)
5. Playwright MCP now works in headless Chromium mode and can interact with the dev app
6. Mock wallet mode eliminates need for MetaMask during development
**Files**: .mcp.json, fedora-install-playwright-deps.sh, dev/.env
---

### [16:29] [pattern] MSW TypeScript file structure
**Details**: All MSW mock files must be TypeScript (.ts) not JavaScript (.js):
- dev/src/mocks/scenarios.ts - Test scenario definitions with typed interfaces
- dev/src/mocks/handlers.ts - MSW request handlers
- dev/src/mocks/ScenarioManager.ts - Scenario switching logic
- dev/src/mocks/mockWallet.ts - Mock wallet provider
- dev/src/mocks/browser.ts - MSW service worker setup
- dev/src/components/ScenarioSwitcher.tsx - UI component for switching scenarios
The project uses TypeScript throughout and mixing JS files causes type issues.
**Files**: dev/src/mocks/*.ts, dev/src/components/ScenarioSwitcher.tsx
---

### [16:30] [testing] MSW testing environment setup
**Details**: The dev app provides a complete MSW testing environment:
- 8 test scenarios: default, low-score, high-score, no-stamps, rate-limited, verification-fails, verification-adds-stamps, near-threshold
- ScenarioSwitcher UI component visible when MSW is active (orange badge)
- Scenarios can be switched via URL params (?scenario=name) or UI dropdown
- Mock wallet returns hardcoded address 0x1234567890123456789012345678901234567890
- No page reload needed when switching scenarios - uses React Query cache invalidation
- MSW handlers mock the Passport API endpoints at http://localhost:8004
- Service worker file at /mockServiceWorker.js intercepts API calls
**Files**: dev/src/mocks/scenarios.ts, dev/src/mocks/handlers.ts, dev/src/components/ScenarioSwitcher.tsx
---

### [16:30] [gotcha] Dev environment API key requirements
**Details**: The dev app requires VITE_API_KEY and VITE_SCORER_ID environment variables even when using MSW mocks. Without these in dev/.env file, the widget shows errors and won't allow wallet connection. Use dummy values like 'test-api-key' and '123' when running with MSW since the actual values aren't used - MSW intercepts all API calls anyway.
**Files**: dev/.env, dev/.env.example
---

### [16:30] [workflow] Widget user flow states
**Details**: The PassportScoreWidget progresses through different body components based on user state:
1. ConnectWalletBody - Initial state showing "Connect Wallet" button
2. CheckingBody - Shows "Verifying onchain activity..." after wallet connection
3. ScoreTooLowBody - Shown if score < threshold (has InitialTooLow and AddStamps states)
4. CongratsBody - Final success state when score >= threshold
Each state uses consistent CSS with --widget-padding-x/y variables (20px) and flex layouts for vertical centering.
**Files**: src/widgets/PassportScoreWidget.tsx, src/components/widget-body/*.tsx
---

