# MSW Mock Data Architecture with Scenarios

## Overview
Implemented a flexible MSW mocking system with multiple scenarios for testing different user states and edge cases.

## Architecture

### Scenario Definition
Scenarios are defined in `src/mocks/scenarios.ts` with different scores, stamps, and behaviors:
- Each scenario controls:
  - Score value
  - Stamps configuration
  - Verification behavior (success/failure/rate-limit)
  - Ability to add stamps

### Dynamic Handler Selection
- Handlers dynamically select scenarios based on URL params or localStorage
- Priority order: URL params → localStorage → default scenario

### Scenario Switching Methods
1. URL parameter: `?scenario=low-score`
2. localStorage: Set `msw-scenario` key
3. UI switcher component (dev mode only)

### Implementation Details
- Mock delays (300-500ms) added for realistic behavior
- Visual indicators show when MSW is active and current scenario
- Scenarios persist across page reloads

## Key Files
- `src/mocks/handlers.ts` - API mock handlers
- `src/mocks/scenarios.ts` - Scenario definitions
- `src/components/ScenarioSwitcher.tsx` - UI for switching scenarios