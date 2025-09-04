# PostCSS Dependencies Gotchas

## PostCSS Autoprefixer Dependency Issue

**Date:** 2025-08-21  
The example app fails to start because it's trying to load PostCSS config from the parent package.json which references autoprefixer, but autoprefixer is not installed in the example app's node_modules. The parent package.json has a postcss configuration that requires autoprefixer.

**Related files:**

- `package.json`
- `example/package.json`

## PostCSS Autoprefixer Dependency Resolution

**Date:** 2025-08-21  
When running the example app, Vite searches for PostCSS config and finds it in the parent package.json which has autoprefixer configured. Initially this caused an error because autoprefixer wasn't in the example's node_modules.

**Solution:** After running `yarn install` in the parent directory, autoprefixer becomes available and the dev server works correctly. No separate PostCSS config file is needed for the example app - it successfully uses the parent's PostCSS configuration once the parent dependencies are installed.

**Related files:**

- `package.json`
- `example/package.json`
