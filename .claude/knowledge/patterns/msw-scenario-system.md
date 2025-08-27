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