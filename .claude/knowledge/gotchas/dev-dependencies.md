# Dev Dependencies Gotchas

## Dev directory yarn install failure (2025-09-04)

**Issue**: The dev directory's package.json incorrectly lists "@human.tech/passport-embed": "^0.2.0" as a dependency. This package has a broken postinstall script that tries to "cd dev && yarn install" which fails.

**Root Cause**: The package shouldn't be installed from npm at all - vite.config.ts already aliases "@human.tech/passport-embed" to the local ../src directory.

**Solution**: Remove the "@human.tech/passport-embed" dependency from dev/package.json since the local source is used via the vite alias.

**Related files:**
- `dev/package.json`
- `dev/vite.config.ts`