# Human ID SDK Integration and Configuration

## Overview

The Human ID SDK is integrated to handle specific platform types that require SBT-based credentials for identity verification.

## Platform Types

Platforms that use Human ID verification:

- **HumanIdKyc** - Government ID verification
- **HumanIdPhone** - Phone number verification
- **Biometrics** - Biometric verification
- **CleanHands** - CleanHands verification

## RPC Configuration

The Human ID SDK requires an Optimism RPC URL to check for SBTs on-chain.

### Configuration Flow

1. Configured at the widget level in PassportScoreWidget via `props.opRPCURL`
2. Default fallback to `https://mainnet.optimism.io`
3. The `setOptimismRpcUrl` function is called once on mount to configure the SDK globally

### Usage

```typescript
<PassportScoreWidget
  opRPCURL="https://mainnet.optimism.io"  // Optional, has default
  // ... other props
/>
```

### Global Configuration

The RPC URL is set globally for the Human ID SDK, so it only needs to be configured once when the widget mounts.

## Implementation Components

### 1. SBT Validation

Functions to check if user already has credentials on-chain

### 2. Platform ID Mapping

Maps platform types to Human ID credential types

### 3. Initialization and Request Flow

Handles Human ID provider initialization and verification request

### 4. Integration Points

Integrates with existing verification flow in PlatformVerification component

## Hook Extraction

The Human ID logic was extracted into a custom `useHumanIDVerification` hook with:

- Clear inputs (platform, address)
- Clear outputs (verification status)
- Self-contained logic for Human ID operations

## External Calls and Mocking Strategy

The Human ID SDK makes several external calls that need to be mocked for development:

1. **Optimism RPC calls** (https://mainnet.optimism.io/) - Used to check for existing SBTs on-chain
2. **Human ID iframe** (https://id.human.tech/iframe) - Opens an iframe for identity verification
3. **Various assets** - Loads scripts, CSS, and images from id.human.tech domain

The SDK shows "Verifying..." state while these operations happen. Console shows:

- SBT check errors (expected when not found)
- PostMessage warnings for iframe communication
- Failed postMessage attempts to id.human.tech domain

Current partial mocking: We have HumanIdKyc platform in our MSW mocks as "Government ID" but the actual SDK verification flow still runs.

## Human ID SDK Mocking Implementation

Successfully implemented Human ID SDK mocking for development using Vite alias approach:

### Implementation:

1. **Vite Alias** - Conditionally overrides @holonym-foundation/human-id-sdk when VITE_ENABLE_MSW=true
2. **Mock SDK** - Located at `/workspace/project/dev/src/mocks/mockHumanIdSdk.ts`, mimics real SDK interface
3. **No External Calls** - Prevents iframe loading, blockchain queries, and API calls
4. **Scenario Control** - Mock behavior controlled by MSW scenarios (success/failure, existing SBTs)

### Key Features:

- Synchronous initHumanID() returns provider object (matches real SDK)
- Async requestSBT() simulates 1.5s verification delay
- BigInt handling for SBT expiry timestamps
- Console logging for debugging mock behavior
- Integrates with existing MSW scenario system

### Benefits:

- Zero production code changes required
- Complete isolation of mock code in dev/
- Hot reload works seamlessly
- TypeScript interface maintained
- Can test all Human ID platforms (KYC, Phone, Biometrics, CleanHands)

### Console Output When Active:

- "[Mock Human ID] Setting Optimism RPC URL"
- "[Mock Human ID] Checking KYC SBT for address"
- "[Mock Human ID] Initializing with config"
- "[Mock Human ID] requestSBT called for kyc"
- "[Mock Human ID] Verification successful"

## Cross-References

See related documentation:

- **Platform Identification**: @api/platform-identification.md - Platform name vs platformId mismatch and migration requirements
- **MSW Infrastructure**: @architecture/msw-infrastructure.md - Overall MSW system architecture including Human ID mocking
- **MSW Scenario System**: @patterns/msw-scenario-system.md - Scenario configuration for Human ID verification testing

**Related files:**

- `/workspace/project/src/widgets/PassportScoreWidget.tsx`
- `/workspace/project/dev/src/mocks/handlers.ts`
- `/workspace/project/src/hooks/useHumanIDVerification.tsx`
- `/workspace/project/src/components/Body/PlatformVerification.tsx`
- `/workspace/project/dev/vite.config.ts`
- `/workspace/project/dev/src/mocks/mockHumanIdSdk.ts`
- `/workspace/project/dev/src/mocks/scenarios.ts`