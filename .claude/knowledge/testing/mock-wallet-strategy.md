# Mock Wallet Strategy

## Overview
Dual mocking approach combining mock wallet implementation and MSW API mocking for comprehensive test development without external dependencies.

## Mock Wallet Implementation

### Features
- **Hardcoded address**: Returns consistent `0x1234...7890` address
- **Mock signatures**: Returns predefined signatures without cryptographic operations
- **Same interface**: Implements identical interface as real wallet providers
- **No dependencies**: No need for MetaMask or other wallet extensions

### Integration
- Mock wallet available at `dev/src/mocks/mockWallet.ts/js`
- Wallet switcher UI visible only when MSW enabled
- Toggle between MetaMask and mock wallet in development

## MSW API Mocking

### Network Interception
- MSW intercepts API calls at network level
- Returns consistent mock data based on active scenario
- No backend connectivity required
- Realistic response delays (300-500ms)

## Benefits of Dual Mocking

### Eliminates Dependencies
- No MetaMask installation required
- No real blockchain connection needed
- No backend API availability required
- No actual wallet signatures needed

### Test Scenarios
Available test user states:
- **New user**: No existing score
- **Low score user**: Below threshold
- **High score user**: Passing score
- **Rate limited user**: 429 responses
- **Verification failures**: Error states

### Persistence
- Scenarios controlled via URL parameters (`?scenario=name`)
- URL-based approach for sharing test states
- Consistent behavior across page reloads

## Usage in Development

1. Enable MSW with `npm run dev:mock`
2. Mock wallet automatically available
3. Select scenario via UI switcher or URL
4. Test complete user flows without external services

**Related files:**
- `dev/src/index.tsx/jsx`
- `dev/src/mocks/mockWallet.ts/js`
- `tests/scenarios.spec.ts/js`
- `dev/src/components/WalletSwitcher.tsx/jsx`