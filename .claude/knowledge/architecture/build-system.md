# Build System and Component Architecture

## Library Build Configuration
The library uses webpack to build both ESM and CJS bundles:

- **Target**: Web and ES2018
- **Source maps**: Generated for debugging
- **Externalized**: React dependencies (to avoid version conflicts)
- **Loaders**:
  - babel-loader with presets for env, react, and typescript
  - css-loader and postcss-loader for CSS modules
  - style-loader for injecting styles
- **Tree-shaking**: Enabled with `sideEffects: false` in package.json
- **TypeScript**: Declarations generated separately using tsc

**Related files:**
- `webpack.config.js`
- `package.json`

## Build Philosophy - Integrator Flexibility
The library is designed to be flexible for integrators and minimize requirements on parent applications:

- **CSS Modules**: Used instead of requiring Tailwind or other CSS frameworks from the parent app
- **Self-contained styles**: Bundled with components using webpack's css-loader and style-loader
- **Multiple build formats**: Both ESM and CJS builds for compatibility with different bundlers
- **Peer dependencies**: React kept as peer dependency to avoid version conflicts

This approach ensures the widget can be dropped into any React app regardless of their styling or build setup.

**Related files:**
- `webpack.config.js`
- `src/components/*.module.css`

## React Query Integration
The SDK uses @tanstack/react-query for efficient data fetching:

- **QueryContextProvider**: Wraps the app with API key, address, and scorerId configuration
- **usePassportQueryClient**: Creates singleton QueryClient with retry logic and rate limit handling
- **Special handling for 429 errors**: No retries on rate limit responses
- **usePassportScore hook**: Fetches passport score data from embed service API
- **Service URL configuration**: Configurable via environment variables (defaults to DEFAULT_EMBED_SERVICE_URL)

**Related files:**
- `src/components/QueryContextProvider.tsx`
- `src/hooks/usePassportQueryClient.tsx`
- `src/hooks/usePassportScore.tsx`

## Passport Widget Body Component Structure

The Passport widget has multiple body screens that handle different states:

1. **ConnectWalletBody** - Shows "Proof of Unique Humanity" text with Connect Wallet button
2. **CheckingBody** - Shows "Verifying onchain activity..." text with disabled Verifying button  
3. **ScoreTooLowBody** - Has two states:
   - InitialTooLow: Shows low score message
   - AddStamps: Shows stamp verification options
4. **CongratsBody** - Shows congratulations message WITHOUT a button (uses extraBottomMarginForBodyWithoutButton class)

### Key Patterns:
- All body components use `styles.textBlock` for text content
- textBlock has `flex-grow: 1` and `justify-content: center` for vertical centering
- CongratsBody uniquely adds `extraBottomMarginForBodyWithoutButton` (36px margin) since it has no button
- All screens except CongratsBody have a Button component at the bottom

**Related files:**
- `src/components/Body/ConnectWalletBody.tsx`
- `src/components/Body/CheckingBody.tsx`
- `src/components/Body/ScoreTooLowBody.tsx`
- `src/components/Body/CongratsBody.tsx`
- `src/components/Body/Body.module.css`