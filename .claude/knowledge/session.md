### [22:34] [gotcha] More Options page breaks pagination tests
**Details**: When the More Options feature was added (commit 5096a9d), it added an extra page at the end of stamp pages in the usePaginatedStampPages hook. This changes the pagination behavior - what was previously the last page (Page 2) is no longer the last page, as "More Options" is now appended. Tests need to account for this extra page when testing pagination - isLastPage is now false for Page 2, and you need to navigate one more time to reach the actual last page ("More Options" with empty platforms array).
**Files**: test/hooks/useStampPages.test.tsx, src/hooks/useStampPages.tsx
---

### [13:40] [config] TypeScript path mapping for local development
**Details**: When using Vite alias to override a package with local source code, TypeScript in the editor may still reference the old types from node_modules. To fix this, add path mapping in tsconfig.json:

```json
"paths": {
  "@passportxyz/passport-embed": ["../src/index"],
  "@passportxyz/passport-embed/*": ["../src/*"]
}
```

This tells TypeScript to use the local source files instead of the installed package in node_modules, resolving editor type errors while maintaining the Vite alias for runtime.
**Files**: dev/tsconfig.json, dev/vite.config.ts
---

### [21:45] [api] Platform name vs platformId mismatch
**Details**: The SDK is using platform.name for API calls and identification, but for Human ID platforms like HumanIdKyc, the display name is "Government ID" while the actual platformId that should be used for backend communication is "HumanIdKyc". The backend has added a platform.platformId field that should be used for API calls instead of platform.name. This affects:
1. getChallenge API call - uses platform.name but should use platformId
2. OAuth popup URL - uses platform.name but should use platformId  
3. Platform identification in switch/if statements - currently uses platform.name
4. PlatformButton key prop - uses platform.name but should use platformId for uniqueness
**Files**: src/components/Body/PlatformVerification.tsx, src/components/Body/ScoreTooLowBody.tsx, src/hooks/useStampPages.tsx
---

