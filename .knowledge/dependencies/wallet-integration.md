# Wallet Connection Pattern

## Overview
The SDK doesn't directly integrate with MetaMask or wallet providers. Instead, it uses a flexible callback pattern that allows consumers to implement their own wallet connection logic.

## Implementation Details

### Callback Pattern
- **connectWalletCallback**: Optional callback for wallet connection
- **generateSignatureCallback**: Optional callback for signature generation
- The address is passed as a prop after wallet connection
- ConnectWalletBody component handles the wallet connection UI

### Key Files
- `src/components/Body/ConnectWalletBody.tsx` - Wallet connection UI
- `src/hooks/usePassportScore.tsx` - Uses wallet address for API calls

## Benefits
- Framework agnostic - works with any wallet provider
- No direct dependencies on specific wallet libraries
- Consumers maintain full control over wallet interactions