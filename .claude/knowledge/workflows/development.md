# Development Workflows

## Local Development Workflow
The main package has a 'dev' script that runs 'cd example && yarn dev', which starts the Vite dev server. The library uses webpack for building and has a 'localpub' script that builds and uses yalc for local publishing.

The example app has been configured with a Vite alias that maps '@passportxyz/passport-embed' to the parent src folder, enabling local development with hot reload.

**Related files:**
- `package.json`
- `example/vite.config.ts`

## Hot Reload Development Setup
The example app uses Vite with hot module replacement (HMR) that works for both example app files and the parent library source files.

### Configuration:
- The `vite.config.ts` aliases '@passportxyz/passport-embed' to the parent '../src' directory
- Server is configured to run on port 5173 and auto-open the browser
- Changes to both example/src files and parent src/ files trigger immediate updates in the browser without manual refresh

### Benefits:
- Instant feedback when editing library components
- No need to rebuild the library for each change
- Preserves React component state during hot updates

**Related files:**
- `example/vite.config.ts`
- `example/src/index.tsx`
- `src/components/Header.tsx`