# Development & Testing Environment

This directory contains the development app and testing infrastructure for the Passport SDK.

## 🎯 Purpose

- **Rapid Development**: Hot-reload development environment using the SDK source directly
- **MSW Mocking**: Offline development with realistic API scenarios
- **E2E Testing**: Playwright tests that validate SDK functionality
- **Dependency Isolation**: Keeps dev/test tools (MSW, Playwright, Vite) out of the SDK bundle

## 🚀 Quick Start

All commands run from the project root:

```bash
# Install everything (SDK + dev dependencies)
npm install

# Start development server
npm run dev:mock   # With MSW mocking (recommended for development)
npm run dev:real   # With real API calls

# Run tests
npm test           # SDK unit tests
npm run test:e2e   # E2E tests with Playwright
npm run test:all   # Both unit and e2e tests
```

## 🎭 MSW Testing Scenarios

### Available Scenarios

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

### How to Switch Scenarios

#### Method 1: URL Parameters (Recommended)
```
http://localhost:5173/?scenario=low-score
```

#### Method 2: Scenario Switcher UI
When running with `npm run dev:mock`, look for the orange panel in the bottom-right corner.

#### Method 3: Direct URL Examples
```bash
# Test low score warning
open "http://localhost:5173/?scenario=low-score"

# Test rate limiting
open "http://localhost:5173/?scenario=rate-limited"

# Test new user onboarding
open "http://localhost:5173/?scenario=no-stamps"
```

## 🧪 Testing Workflows

### Onboarding Flow
1. Start with `?scenario=no-stamps`
2. Connect wallet (mock wallet auto-connects)
3. See score of 0
4. Switch to `?scenario=verification-adds-stamps`
5. Add stamps and watch score increase

### Error Handling
- `?scenario=rate-limited` - Test 429 rate limit responses
- `?scenario=verification-fails` - Test verification error handling

### Score States
- `?scenario=near-threshold` - User needs just one more stamp
- `?scenario=low-score` - User needs significant improvement  
- `?scenario=high-score` - Power user experience

## 🔧 Technical Details

### Hot Reload Setup
The Vite config aliases `@human.tech/passport-embed` to the SDK source:
```typescript
// vite.config.ts
alias: {
  "@human.tech/passport-embed": resolve(__dirname, "../src"),
}
```
This means changes to SDK source instantly reflect in the dev app!

### Dependency Isolation
- `dev/package.json` contains ONLY dependencies, no scripts
- All commands orchestrated from root `package.json`
- Uses `npx` to run tools installed in `dev/node_modules`

### ScenarioManager
- Centralized scenario logic in `ScenarioManager.js`
- URL-based state (no localStorage complexity)
- Instant switching via React Query cache invalidation

## 📝 Notes

- This is NOT published to npm
- MSW only active when `VITE_ENABLE_MSW=true`
- Service worker must be served from root URL
- All paths in root scripts use `cd dev && npx ...`
