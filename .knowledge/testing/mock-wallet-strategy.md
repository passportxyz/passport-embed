# Testing Strategy with Mock Wallet and MSW

## Overview
Dual mocking approach for rapid Playwright test development without requiring real blockchain or wallet infrastructure.

## Components

### 1. Mock Wallet
- Simple object returning hardcoded address (0x1234...7890) and signatures
- No real cryptographic operations
- Implements same interface as real wallet providers

### 2. MSW for API Mocking
- Intercepts passport score API calls at network level
- Returns consistent mock data based on selected scenario
- Simulates rate limiting and error conditions

### 3. Wallet Switcher UI
- Allows toggling between MetaMask and mock wallet in development
- Visible only when MSW is enabled

## Benefits
This combined approach eliminates the need for:
- MetaMask installation
- Real blockchain connection
- Backend API availability
- Actual wallet signatures
- Network delays and inconsistencies

## Test Scenarios
Test different user journeys by switching scenarios:
- New user (no score)
- Low score user
- High score user
- Rate limited user
- Verification failures

Scenarios persist via localStorage or URL params for consistent testing across page reloads.

## Key Files
- `example/src/index.tsx` - Wallet provider setup
- `src/mocks/mockWallet.ts` - Mock wallet implementation
- `tests/scenarios.spec.ts` - Playwright test scenarios