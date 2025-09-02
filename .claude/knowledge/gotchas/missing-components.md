# Missing Components Gotchas

## ScenarioSwitcher Component (2025-08-27)
**Issue**: The ScenarioSwitcher.tsx component was mentioned in refactor plans but didn't actually exist in the codebase.

**Discovery**: Task agent incorrectly reported it exists when searching src/components/

**Resolution**: Created from scratch as part of MSW refactor, now located at `dev/src/components/ScenarioSwitcher.jsx`

**Related files**: 
- `dev/src/components/ScenarioSwitcher.jsx` (created during refactor)

## MSW Files JavaScript Conversion Error (2025-08-28)
**Issue**: During the MSW refactor, TypeScript files were incorrectly converted to JavaScript. This project uses TypeScript throughout, and all MSW mock files (scenarios, handlers, mockWallet, ScenarioManager) should be in TypeScript (.ts files) not JavaScript (.js files).

**Impact**: This conversion error can cause type issues and breaks the project's consistency.

**Affected files**:
- `dev/src/mocks/scenarios.js` (should be .ts)
- `dev/src/mocks/handlers.js` (should be .ts)
- `dev/src/mocks/mockWallet.js` (should be .ts)
- `dev/src/mocks/ScenarioManager.js` (should be .ts)

## Dev Environment API Key Requirements (2025-08-28)
**Issue**: The dev app requires VITE_API_KEY and VITE_SCORER_ID environment variables even when using MSW mocks.

**Symptoms**: Without these in dev/.env file, the widget shows errors and won't allow wallet connection.

**Solution**: Use dummy values like 'test-api-key' and '123' when running with MSW since the actual values aren't used - MSW intercepts all API calls anyway.

**Related files**:
- `dev/.env`
- `dev/.env.example`