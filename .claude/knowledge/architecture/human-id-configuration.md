# Human ID SDK RPC Configuration

The Human ID SDK requires an Optimism RPC URL to check for SBTs on-chain.

## Configuration Flow
1. Configured at the widget level in PassportScoreWidget via `props.opRPCURL`
2. Default fallback to `https://mainnet.optimism.io`
3. The `setOptimismRpcUrl` function is called once on mount to configure the SDK globally

## Usage
```typescript
<PassportScoreWidget
  opRPCURL="https://mainnet.optimism.io"  // Optional, has default
  // ... other props
/>
```

## Global Configuration
The RPC URL is set globally for the Human ID SDK, so it only needs to be configured once when the widget mounts.

**Related files:**
- `src/widgets/PassportScoreWidget.tsx`