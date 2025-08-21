# MSW Scenario System

## Quick Start

```bash
# Start with MSW enabled
cd example
npm run dev:mock

# Open with specific scenario
open http://localhost:5173/?scenario=low-score
```

## How It Works

1. **Scenario Definitions** (`src/mocks/scenarios.ts`)
   - Each scenario defines score, stamps, and behavior
   - Scenarios can control verification success/failure
   - Rate limiting and error states included

2. **Dynamic Handler Selection** (`src/mocks/handlers.ts`)
   - Handlers check `getCurrentScenario()` on each request
   - Returns appropriate response based on active scenario
   - Supports delays for realistic behavior

3. **Scenario Selection Methods**:
   - **URL Parameter**: `?scenario=low-score`
   - **LocalStorage**: `localStorage.setItem('msw-scenario', 'low-score')`
   - **UI Switcher**: Visual selector in bottom-right (when MSW enabled)

## Adding New Scenarios

```typescript
// In src/mocks/scenarios.ts
export const scenarios = {
  'my-custom-scenario': {
    name: 'my-custom-scenario',
    description: 'Custom test case',
    passportScore: {
      address: '0x123...',
      score: 15.0,
      passingScore: false,
      threshold: 20,
      stamps: {
        'CustomStamp': { score: 15.0, dedup: true, expirationDate: new Date() }
      }
    },
    verificationBehavior: 'success', // or 'failure' or 'rate-limit'
    canAddStamps: true
  }
}
```

## Playwright Testing

```typescript
// Test specific scenario
test('low score user flow', async ({ page }) => {
  await page.goto('http://localhost:5173/?scenario=low-score');
  // ... test low score UI
});

// Change scenario mid-test
test('upgrade from low to high score', async ({ page }) => {
  await page.goto('http://localhost:5173/?scenario=low-score');
  // ... test low score
  
  await page.goto('http://localhost:5173/?scenario=verification-adds-stamps');
  // ... test adding stamps
});
```

## Benefits

1. **No External Dependencies**: Don't need MetaMask or backend
2. **Reproducible Tests**: Same data every time
3. **Edge Case Testing**: Rate limits, errors, threshold boundaries
4. **Fast Development**: Instant scenario switching
5. **Visual Feedback**: See current scenario in UI

## Common Test Flows

### Onboarding Flow
1. Start with `no-stamps` → Show empty state
2. Switch to `verification-adds-stamps` → Add first stamps
3. End with `default` → Show success state

### Error Handling
1. `rate-limited` → Test retry logic
2. `verification-fails` → Test error messages

### Threshold Testing
1. `near-threshold` (19.5) → One stamp away
2. `low-score` (12.5) → Needs multiple stamps
3. `default` (25.5) → Above threshold