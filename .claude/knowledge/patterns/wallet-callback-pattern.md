# Wallet Callback Pattern

## Overview
The SDK implements a flexible wallet integration pattern that keeps the library framework-agnostic and gives consumers full control over wallet interactions.

## Design Principles

### No Direct Wallet Dependencies
- SDK doesn't import or depend on specific wallet libraries
- No MetaMask, WalletConnect, or other wallet SDK dependencies
- Clean separation between UI components and wallet logic

### Callback-Based Architecture
The SDK accepts two primary callbacks:

1. **connectWalletCallback**: 
   - Called when user clicks "Connect Wallet"
   - Should handle wallet connection flow
   - Returns wallet address on success
   - Consumer decides which wallet providers to support

2. **generateSignatureCallback**:
   - Called when verification requires a signature
   - Receives message to sign as parameter
   - Returns signed message
   - Consumer handles signing UI/UX

### Integration Flow

1. **Consumer provides callbacks** when initializing the widget
2. **SDK calls callbacks** at appropriate times in the user flow
3. **Consumer maintains control** over:
   - Which wallet providers to support
   - Connection UI/UX
   - Error handling
   - Transaction signing

### Framework Agnostic
This pattern ensures the SDK works with:
- Any React framework (Next.js, CRA, Vite, etc.)
- Any wallet provider (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- Custom wallet implementations
- Mock wallets for testing

## Benefits

- **Flexibility**: Integrators can use their preferred wallet solution
- **Simplicity**: SDK doesn't need to maintain wallet integrations
- **Testing**: Easy to mock wallet interactions for development
- **Future-proof**: New wallet providers work without SDK updates

**Related files:**
- `src/components/Body/ConnectWalletBody.tsx`
- `src/hooks/usePassportScore.tsx`
- `example/src/index.tsx` (example implementation)