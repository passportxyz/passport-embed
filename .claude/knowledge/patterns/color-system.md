# Color System Patterns

## Standardized Color Variable Naming

The widget uses a simplified color variable naming system:

### Color Variables

- **color-error**: Used for error states throughout the UI
  - Error icons and SVG strokes
  - Error section backgrounds
  - Failure indicators

### Implementation Details

The color system was refactored to remove redundant variables and standardize naming:

1. **Removed variables**:
   - `color-success` was removed as unnecessary

2. **Renamed variables**:
   - `color-failure` → `color-error` for consistency with standard naming conventions

3. **Usage locations**:
   - **StampClaimResult.tsx**: SVG stroke uses `color-error` for error icons
   - **Body.module.css**: Error section background uses `color-error`
   - **Widget.tsx/Widget.module.css**: Defines the CSS variable
   - **themes.ts**: Theme configuration includes `error` color

### Theme Configuration

Both LightTheme and DarkTheme define the `error` color:
- Used as RGB triplet format (e.g., "255, 0, 0")
- Applied via CSS variables with `rgba()` for opacity control

**Related files:**
- `src/widgets/Widget.tsx`
- `src/widgets/Widget.module.css`
- `src/components/Body/StampClaimResult.tsx`
- `src/components/Body/Body.module.css`
- `src/utils/themes.ts`
- `test/utils/themes.test.tsx`