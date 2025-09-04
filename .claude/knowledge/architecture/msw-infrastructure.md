# MSW Infrastructure Architecture

## System Organization

The MSW (Mock Service Worker) testing infrastructure has been refactored to completely separate testing code from production SDK:

### Production SDK (src/)

- Clean production code without any MSW dependencies
- No test utilities or mock data in production bundle
- SDK exports only production components and hooks

### Development Environment (dev/)

- Renamed from `example/` for clearer purpose
- Contains all MSW testing infrastructure:
  - `dev/src/mocks/` - All MSW handlers and scenarios
  - `dev/src/components/ScenarioSwitcher.jsx` - UI for scenario selection
  - `dev/tests/` - All Playwright E2E tests
  - `dev/src/mocks/ScenarioManager.js` - Centralized scenario logic

## Core Components

### ScenarioManager

- Central logic for scenario switching (URL-based only, no localStorage)
- Located at `dev/src/mocks/ScenarioManager.js`
- Provides `getCurrentScenario()` and `setScenario()` methods
- Integrates with React Query for instant updates

### Mock Handlers

- Located at `dev/src/mocks/handlers.js`
- Clean request handlers that delegate to ScenarioManager
- Simulates realistic API behavior with delays (300-500ms)

### Scenarios

- 8 predefined test scenarios in `dev/src/mocks/scenarios.js`:
  - `default` - Standard flow with mid-range score
  - `low-score` - Tests "Add Stamps" flow
  - `high-score` - Tests success state
  - `no-stamps` - Tests initial onboarding
  - `rate-limited` - Tests 429 error handling
  - `verification-fails` - Tests failure handling
  - `verification-adds-stamps` - Tests score increase after adding stamps
  - `near-threshold` - Tests edge case near passing threshold

### Mock Wallet

- Located at `dev/src/mocks/mockWallet.js`
- Eliminates MetaMask dependency for development
- Returns hardcoded address (0x1234...7890)
- Simulates signature generation

## Build System Integration

### Orchestrated Commands

All scripts run from project root - dev/package.json has NO scripts:

- Root package.json orchestrates everything using npx
- Commands use `cd dev && npx` pattern
- Keeps clean separation while providing single entry point

### Key Commands

- `npm run dev:mock` - Start dev server with MSW enabled
- `npm run dev:real` - Start dev server without MSW
- `npm run test:e2e` - Run all E2E tests headless
- `npm run test:e2e:ui` - Open Playwright UI

## Documentation Structure

### Previous Issues (Resolved)

- Had duplicate documentation in MSW_SCENARIOS.md and test-scenarios.md
- DevWrapper component was redundant with existing setup
- Unclear separation between library and example code

### Current Structure

- Single source of truth in dev/src/mocks/
- Clean separation: production SDK vs development environment
- No MSW code in production bundle
