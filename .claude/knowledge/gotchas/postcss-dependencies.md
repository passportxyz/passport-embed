# PostCSS Dependencies Gotchas

## PostCSS Autoprefixer Dependency (RESOLVED)

**Date:** 2025-08-21
**Status:** ✅ RESOLVED - Autoprefixer is now a devDependency in `/workspace/project/package.json`

**Original Issue:** The dev app failed to start because it tried to load PostCSS config from the parent `/workspace/project/package.json` which references autoprefixer, but autoprefixer wasn't installed in the dev app's node_modules.

**Solution:** Autoprefixer is now properly included as a devDependency in the root `/workspace/project/package.json`. Running `yarn install` in the parent directory ensures autoprefixer is available, and the dev server works correctly.

**Related files:**

- `/workspace/project/package.json`
- `/workspace/project/dev/package.json`
