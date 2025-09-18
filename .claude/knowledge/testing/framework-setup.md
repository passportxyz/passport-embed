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

- `default`: Normal user with score 25.5 (passing)
- `low-score`: Tests "Add Stamps" flow (score 12.5)
- `high-score`: Power user with score 45.5 (many stamps)
- `no-stamps`: Tests initial onboarding
- `rate-limited`: Tests 429 error handling
- `verification-fails`: Tests verification failure handling
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

- `default` - Normal user with score 25.5 (passing)
- `low-score` - User with score 12.5 (below threshold)
- `high-score` - Power user with score 45.5 (many stamps)
- `no-stamps` - New user with no verification stamps
- `rate-limited` - API returning 429 errors
- `verification-fails` - Verification attempts fail
- `verification-adds-stamps` - Can add stamps successfully
- `near-threshold` - Score just below passing threshold

### Scenario Features

- **ScenarioSwitcher UI**: Orange badge visible when MSW is active
- **URL Control**: Switch scenarios via `?scenario=name` parameter
- **UI Dropdown**: Interactive scenario switcher panel
- **Mock Wallet**: Dropdown selector to switch between MetaMask and Mock Wallet
  - Mock returns hardcoded address `0x1234567890123456789012345678901234567890`
- **No Reload Needed**: React Query cache invalidation for instant updates
- **API Mocking**: MSW handlers mock Passport API endpoints at `/embed/score` and `/embed/verify`
  - **Important**: Must use exact API paths, not `/api/v1/` paths
- **Service Worker**: Located at `/mockServiceWorker.js` intercepts API calls
- **Testing Flow**:
  1. Run `npm run dev:mock` to start server with MSW
  2. Select Mock Wallet from dropdown
  3. Click Connect
  4. Instantly test any scenario

## Cross-References

See related MSW documentation:

- **Infrastructure**: @architecture/msw-infrastructure.md - Overall MSW system architecture and organization
- **Scenario System**: @patterns/msw-scenario-system.md - Detailed scenario configuration and testing patterns
- **Mock Wallet Strategy**: @testing/mock-wallet-strategy.md - Dual mocking approach combining wallet and API mocking
- **Dev Environment**: @testing/msw-dev-environment.md - MSW development environment states and UI displays
- **E2E Configuration**: @testing/e2e-test-configuration.md - Playwright E2E test setup with MSW scenarios

**Related files:**

- `/workspace/project/dev/src/mocks/scenarios.ts`
- `/workspace/project/dev/src/mocks/handlers.ts`
- `/workspace/project/dev/src/components/ScenarioSwitcher.tsx`
- `/workspace/project/dev/src/index.tsx`
