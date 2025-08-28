# Test Framework Setup

The project uses multiple testing frameworks:

## Unit Testing
- **Test runner**: Jest with ts-jest preset
- **Environment**: jsdom for React component testing
- **CSS handling**: CSS modules mocked using identity-obj-proxy
- **Test location**: Tests in `test/` directory with subdirectories matching source structure:
  - `test/components/` for component tests
  - `test/hooks/` for hook tests
- **Testing library**: @testing-library/react for component testing

## E2E Testing with Playwright
- **Location**: All E2E tests in `dev/tests/`
- **Configuration**: `dev/playwright.config.ts`
- **Commands from project root**:
  - `npm run test:e2e` - Run all tests headless
  - `npm run test:e2e:ui` - Open Playwright UI
  - `npm run test:e2e:debug` - Run with debugger
  - `npm run test:e2e:headed` - Run with visible browser
  - `npm run screenshot` - Capture screenshots on failure

## MSW Testing Configuration
- **ScenarioManager**: Central logic in `dev/src/mocks/ScenarioManager.js`
- **Scenario Selection**: Via URL param `?scenario=name`
- **UI Switcher**: ScenarioSwitcher component in bottom-right when MSW active
- **Cache Invalidation**: Uses usePassportQueryClient hook for instant updates
- **No page reload needed**: React Query handles cache invalidation

## Key Test Scenarios
- `low-score`: Tests "Add Stamps" flow
- `no-stamps`: Tests initial onboarding
- `rate-limited`: Tests 429 error handling
- `verification-adds-stamps`: Tests score increase after adding stamps
- `near-threshold`: Tests edge cases near passing threshold

**Related files:**
- `jest.config.ts`
- `test/components/`
- `test/hooks/`
- `dev/playwright.config.ts`
- `dev/tests/`
- `dev/src/mocks/`

## MSW Testing Environment Setup

The dev app provides a complete MSW testing environment:

### Available Test Scenarios
8 test scenarios available:
- `default` - Standard user flow
- `low-score` - User with score below threshold
- `high-score` - User with passing score
- `no-stamps` - User with no verification stamps
- `rate-limited` - API returning 429 errors
- `verification-fails` - Verification attempts fail
- `verification-adds-stamps` - Successful stamp addition
- `near-threshold` - Score just below passing threshold

### Scenario Features
- **ScenarioSwitcher UI**: Orange badge visible when MSW is active
- **URL Control**: Switch scenarios via `?scenario=name` parameter
- **UI Dropdown**: Interactive scenario switcher panel
- **Mock Wallet**: Returns hardcoded address `0x1234567890123456789012345678901234567890`
- **No Reload Needed**: React Query cache invalidation for instant updates
- **API Mocking**: MSW handlers mock Passport API endpoints at `http://localhost:8004`
- **Service Worker**: Located at `/mockServiceWorker.js` intercepts API calls

**Related files:**
- `dev/src/mocks/scenarios.ts`
- `dev/src/mocks/handlers.ts`
- `dev/src/components/ScenarioSwitcher.tsx`