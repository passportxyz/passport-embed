# TypeScript Path Mapping for Local Development

When using Vite alias to override a package with local source code, TypeScript in the editor may still reference the old types from node_modules.

## Solution

Add path mapping in `/workspace/project/dev/tsconfig.json`:

```json
"paths": {
  "@passportxyz/passport-embed": ["../src/index"],
  "@passportxyz/passport-embed/*": ["../src/*"]
}
```

This tells TypeScript to use the local source files instead of the installed package in node_modules, resolving editor type errors while maintaining the Vite alias for runtime.

## Benefits

- Editor TypeScript support matches runtime behavior
- IntelliSense and type checking use local source
- No need to rebuild or reinstall packages during development

**Related files:**

- `/workspace/project/dev/tsconfig.json`
- `/workspace/project/dev/vite.config.ts`
