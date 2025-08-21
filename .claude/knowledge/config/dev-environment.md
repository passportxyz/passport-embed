# Development Environment Configuration

## Example App Dev Setup
The example app uses Vite for development with React plugin. It has an alias mapping "passport-widgets" to the parent src directory for local development. The dev script runs vite which should provide hot module replacement (HMR) out of the box.

**Related files:**
- `example/vite.config.ts`
- `example/package.json`

## Environment Variables for Passport Widget
The example app requires environment variables to work with the PassportScoreWidget:
- `VITE_API_KEY`: API key for the Passport service
- `VITE_SCORER_ID`: Scorer ID for the Passport service

These are loaded via Vite's `import.meta.env`.

**Related files:**
- `example/.env-example`
- `example/src/index.tsx`

## Widget CSS Variables Configuration

The widget uses CSS variables for consistent spacing and theming:

### Padding Variables:
- `--widget-padding-x-c6dbf459`: 20px (horizontal padding)
- `--widget-padding-y-c6dbf459`: 20px (vertical padding - changed from 12px for better alignment)

These variables are used throughout the widget for:
- Body container: `padding: var(--widget-padding-y-c6dbf459) var(--widget-padding-x-c6dbf459)`
- Header: Same padding pattern
- PlatformVerification: Various spacing calculations including max-height

**Related files:**
- `src/widgets/Widget.module.css`
- `src/components/Body/Body.module.css`
- `src/components/Body/PlatformVerification.module.css`