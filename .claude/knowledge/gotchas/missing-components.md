# Missing Components Gotchas

## ScenarioSwitcher Component (2025-08-27)
**Issue**: The ScenarioSwitcher.tsx component was mentioned in refactor plans but didn't actually exist in the codebase.

**Discovery**: Task agent incorrectly reported it exists when searching src/components/

**Resolution**: Created from scratch as part of MSW refactor, now located at `dev/src/components/ScenarioSwitcher.jsx`

**Related files**: 
- `dev/src/components/ScenarioSwitcher.jsx` (created during refactor)