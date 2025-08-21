# Testing Different MSW Scenarios

## How to Use Scenarios

### Method 1: URL Parameters
Add `?scenario=<name>` to the URL:

- http://localhost:5173/?scenario=default - Normal user with good score (25.5)
- http://localhost:5173/?scenario=low-score - User below threshold (12.5)
- http://localhost:5173/?scenario=high-score - Power user with many stamps (45.5)
- http://localhost:5173/?scenario=no-stamps - New user with no stamps (0)
- http://localhost:5173/?scenario=rate-limited - API rate limiting active
- http://localhost:5173/?scenario=verification-fails - Stamp verification always fails
- http://localhost:5173/?scenario=verification-adds-stamps - Can successfully add new stamps (18)
- http://localhost:5173/?scenario=near-threshold - Just below passing threshold (19.5)

### Method 2: Scenario Switcher UI
When MSW is enabled (`VITE_ENABLE_MSW=true`), you'll see a scenario switcher panel in the bottom-right corner of the screen.

### Method 3: Browser Console
```javascript
// Set scenario programmatically
localStorage.setItem('msw-scenario', 'low-score');
location.reload();
```

## Available Scenarios

| Scenario | Score | Passing | Description | Special Behavior |
|----------|-------|---------|-------------|------------------|
| `default` | 25.5 | ✅ Yes | Normal user with good score | Can add stamps |
| `low-score` | 12.5 | ❌ No | User below threshold | Can add stamps to improve |
| `high-score` | 45.5 | ✅ Yes | Power user with many stamps | Has 9 different stamps |
| `no-stamps` | 0 | ❌ No | New user with no stamps | Perfect for onboarding flow |
| `rate-limited` | 20 | ✅ Yes | API rate limiting | Returns 429 errors |
| `verification-fails` | 15 | ❌ No | Verification errors | Can't add new stamps |
| `verification-adds-stamps` | 18 | ❌ No | Below threshold but can improve | Adding stamps increases score |
| `near-threshold` | 19.5 | ❌ No | Just 0.5 points below | One stamp away from passing |

## Testing Workflows

### Test Onboarding Flow
1. Start with `?scenario=no-stamps`
2. Connect wallet
3. Try to add stamps
4. Switch to `?scenario=verification-adds-stamps` to test successful stamp addition

### Test Error Handling
1. Use `?scenario=rate-limited` to test rate limit handling
2. Use `?scenario=verification-fails` to test verification errors

### Test Different Score States
1. `?scenario=near-threshold` - User needs just one more stamp
2. `?scenario=low-score` - User needs significant improvement
3. `?scenario=high-score` - Power user experience

## Quick Test Commands

```bash
# Run with default scenario
npm run dev:mock

# Open specific scenario directly
npm run dev:mock & sleep 3 && open "http://localhost:5173/?scenario=low-score"
```

## Playwright Test Examples

```typescript
// Test with specific scenario
await page.goto('http://localhost:5173/?scenario=low-score');

// Or set via localStorage
await page.evaluate(() => {
  localStorage.setItem('msw-scenario', 'verification-fails');
});
await page.reload();
```