# Human ID SDK Integration Pattern

The Human ID SDK is integrated in PlatformVerification component to handle specific platform types.

## Platform Types
Platforms that use Human ID verification:
- HumanIdKyc
- HumanIdPhone
- Biometrics
- CleanHands

## Implementation Components

### 1. SBT Validation
Functions to check if user already has credentials on-chain

### 2. Platform ID Mapping
Maps platform types to Human ID credential types

### 3. Initialization and Request Flow
Handles Human ID provider initialization and verification request

### 4. Integration Points
Integrates with existing verification flow in PlatformVerification

## Hook Extraction Opportunity
The code could be extracted into a custom hook since it has:
- Clear inputs (platform, address)
- Clear outputs (verification status)
- Self-contained logic for Human ID operations

This extraction was implemented as `useHumanIDVerification` hook.

**Related files:**
- `src/components/Body/PlatformVerification.tsx`
- `src/hooks/useHumanIDVerification.tsx`