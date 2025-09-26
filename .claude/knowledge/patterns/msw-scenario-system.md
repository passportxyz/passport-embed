# MSW Scenario System

## Overview

Flexible mock data architecture for testing different user states and API responses without real backend connectivity.

## Key Features

### Multiple Scenarios

- **Pre-defined scenarios** in `dev/src/mocks/scenarios.ts/js`:
  - `low-score`: User with score below threshold
  - `high-score`: User with passing score
  - `rate-limited`: API returning 429 status
  - `verification-failure`: Failed verification attempts
  - `new-user`: No existing passport score

### Dynamic Handler Selection

- **URL parameter control**: `?scenario=low-score` sets the active scenario
- **Default scenario**: Falls back to configured default if no URL parameter specified

### Scenario Controls

Each scenario configuration includes:

- **score**: Numeric passport score value
- **stamps**: Array of verification stamps with scores and metadata
- **verification behavior**: Success/failure responses for verification endpoints
- **canAddStamps**: Whether user can add new stamps
- **response delays**: Realistic 300-500ms delays for authentic behavior

### Visual Indicators

When MSW is active:

- Orange "MSW Active" badge in top corner
- Scenario switcher panel for quick testing
- Current scenario name displayed
- Only visible in development mode with MSW enabled

## Implementation

### Control Method

- URL parameters (`?scenario=name`) for scenario selection
- Default scenario in configuration as fallback

### Benefits

- Rapid testing of different user journeys
- No dependency on backend availability
- Consistent, reproducible test scenarios
- Persistence across page reloads

**Related files:**

- `dev/src/mocks/handlers.ts/js`
- `dev/src/mocks/scenarios.ts/js`
- `dev/src/components/ScenarioSwitcher.tsx/jsx`

## MSW TypeScript File Structure

All MSW mock files must be TypeScript (.ts) not JavaScript (.js):

### Required TypeScript Files

- `dev/src/mocks/scenarios.ts` - Test scenario definitions with typed interfaces
- `dev/src/mocks/handlers.ts` - MSW request handlers
- `dev/src/mocks/ScenarioManager.ts` - Scenario switching logic
- `dev/src/mocks/mockWallet.ts` - Mock wallet provider
- `dev/src/mocks/browser.ts` - MSW service worker setup
- `dev/src/components/ScenarioSwitcher.tsx` - UI component for switching scenarios

### Important Notes

- The project uses TypeScript throughout
- Mixing JS files causes type issues
- All mock-related files should maintain TypeScript consistency

**Related files:**

- `dev/src/mocks/*.ts`
- `dev/src/components/ScenarioSwitcher.tsx`

## MSW Error Scenario Testing Pattern

### Implementation Strategy

To test error scenarios with MSW effectively:

1. **Add behavior flags to scenarios** (e.g., `stampPagesBehavior`)
2. **Check flags in MSW handlers** and return appropriate error responses
3. **ScenarioManager.getCurrentScenario()** should always re-detect from URL to handle navigation
4. **Error messages from axios** are standardized: "Request failed with status code XXX" (not custom messages)
5. **Test with Playwright MCP first** to verify scenarios work before writing E2E tests

### Example Pattern

```typescript
// In scenarios.ts
export const scenarios = {
  "stamp-pages-error": {
    stampPagesBehavior: "error-500",
    // ... other scenario data
  },
};

// In handlers.ts
http.get("*/embed/stamps/metadata", () => {
  const scenario = ScenarioManager.getCurrentScenario();
  if (scenario.stampPagesBehavior === "error-500") {
    return new Response(null, { status: 500 });
  }
  // ... normal response
});
```

### Testing Workflow

1. Create scenario with error behavior flag
2. Implement handler logic to check flag
3. Test manually with Playwright MCP
4. Write E2E test with proper waits for React Query retries
5. Verify error message appears after retries complete

## Cross-References

See related MSW documentation:

- **Infrastructure**: @architecture/msw-infrastructure.md - Overall MSW system architecture and organization
- **Testing Framework**: @testing/framework-setup.md - MSW scenarios integration with test framework
- **Mock Wallet Strategy**: @testing/mock-wallet-strategy.md - Wallet mocking approach used with scenarios
- **Dev Environment**: @testing/msw-dev-environment.md - Visual displays and UI for scenario testing
- **Handler Issues**: @gotchas/msw-handler-issues.md - Common problems when implementing scenarios

**Related files:**

- `/workspace/project/dev/src/mocks/scenarios.ts`
- `/workspace/project/dev/src/mocks/handlers.ts`
- `/workspace/project/dev/src/mocks/ScenarioManager.ts`
- `/workspace/project/dev/tests/e2e/stamp-errors.spec.ts`
