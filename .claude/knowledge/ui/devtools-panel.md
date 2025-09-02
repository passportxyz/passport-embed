# DevTools Panel UI Components

## DevToolsPanel Unified MSW Dev Controls
Created a unified DevToolsPanel component that consolidates all MSW development controls into one styled panel:
- Replaces separate ScenarioSwitcher, MSW Active badge, and wallet selector
- Dark theme styling matching the widget aesthetic (#1a1a1a background, orange accent)
- Contains: MSW Active status indicator, wallet mode selector, scenario switcher
- Located at bottom-right corner with consistent styling
- Wallet mode state lifted to App component to share between Dashboard and DevToolsPanel
- Removed standalone MSW badge from setupMocks.ts
- Panel only appears when VITE_ENABLE_MSW is true

**Related files:**
- `dev/src/components/DevToolsPanel.tsx`
- `dev/src/index.tsx`
- `dev/src/setupMocks.ts`