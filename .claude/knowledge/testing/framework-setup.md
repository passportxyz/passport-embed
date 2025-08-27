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