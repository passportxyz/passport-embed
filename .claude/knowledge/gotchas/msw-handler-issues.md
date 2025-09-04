# MSW Handler Issues and Gotchas

## MSW Handler URL Mismatch (2025-08-28)

**Issue**: When testing with Playwright, MSW handlers were not intercepting API requests. The widget makes requests to http://localhost:8004/embed/score/... but MSW was only registered for the current domain (localhost:5174).

**Symptoms**: "Network Error" messages instead of mocked responses during testing.

**Solution**: MSW handlers must be configured to intercept the actual API URLs that the widget uses. The handlers need to match the exact paths.

**Related files**:

- `dev/src/mocks/handlers.ts`

## Avoiding Bash Process Termination (2025-08-28)

**Issue**: Attempting to kill bash processes (like with Ctrl+C or KillBash) when running dev servers can accidentally terminate the entire Claude Code process/thread, causing complete session disruption.

**Impact**: Loss of entire Claude Code session and context.

**Solution**: Use Hot Module Replacement (HMR) instead of restarting servers:

- Simply refresh the browser page
- Let HMR automatically reload changes
- The dev server automatically detects file changes and updates
- This applies to MSW handler changes, Vite config updates, and most source code modifications

**Related files**:

- `dev/vite.config.ts`
- `dev/src/mocks/handlers.ts`
