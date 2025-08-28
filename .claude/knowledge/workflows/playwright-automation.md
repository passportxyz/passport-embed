# Playwright MCP Browser Automation Workflow

## Overview
Comprehensive workflow for using Playwright MCP for browser testing with the Passport widget.

## Key Guidelines

### 1. Dev Server with HMR
- Dev server has Hot Module Replacement (HMR) - no need to restart when code changes
- Simply refresh page after code changes
- MSW changes are applied instantly via HMR

### 2. Complex Interactions
- Use `browser_evaluate` for complex interactions like:
  - Selecting dropdown + clicking button
  - Multi-step user flows
  - DOM manipulation

### 3. MSW Integration
- Console logs show MSW intercepting requests - useful for debugging
- Verify MSW is active by checking for orange badge
- URL parameters persist scenario selection across refreshes

### 4. Testing Best Practices
- Take screenshots to document test states
- Mock wallet eliminates MetaMask dependency completely
- Use scenario switcher for quick state changes

### 5. Critical Warning
**NEVER kill bash processes unnecessarily** - it can terminate the entire Claude Code session
- Vite's HMR handles most changes automatically
- Use refresh instead of restart
- Only kill processes if absolutely necessary and confirmed stuck

## Testing Flow

1. Start dev server with `npm run dev:mock`
2. Open browser with Playwright MCP
3. Select Mock Wallet from dropdown
4. Test scenarios via URL params or UI switcher
5. Refresh page for code changes (HMR applies them)
6. Take screenshots for documentation

## URL-Based Testing
- Append `?scenario=name` to URL
- Examples:
  - `http://localhost:5173?scenario=low-score`
  - `http://localhost:5173?scenario=high-score`
  - `http://localhost:5173?scenario=rate-limited`

## Debugging Tips
- Check browser console for MSW intercept logs
- Verify orange "MSW Active" badge is visible
- Use `browser_console_messages` to capture errors
- Take screenshots before and after actions

**Related files:**
- `dev/vite.config.ts`
- `.mcp.json`
- `dev/src/components/ScenarioSwitcher.tsx`