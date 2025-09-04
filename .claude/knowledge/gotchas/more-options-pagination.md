# More Options Pagination Breaking Changes

## Date: 2025-09-03

When the More Options feature was added (commit 5096a9d), it added an extra page at the end of stamp pages in the usePaginatedStampPages hook. This changes the pagination behavior:

**Impact:**
- What was previously the last page (Page 2) is no longer the last page
- "More Options" is now appended as the final page
- Tests need to account for this extra page when testing pagination
- `isLastPage` is now false for Page 2
- Need to navigate one more time to reach the actual last page ("More Options" with empty platforms array)

**Related files:**
- `test/hooks/useStampPages.test.tsx`
- `src/hooks/useStampPages.tsx`

## Vite HMR consistent-components-exports error
**Date:** 2025-09-04

Vite's React Fast Refresh requires files that export React components/hooks to ONLY export React-related items. If you mix React hooks with other exports (constants, types), you'll get a "consistent-components-exports" HMR error.

**Solution:** Move non-React exports (types, constants) to a separate file. For example, when usePaginatedStampPages hook was exported alongside Platform types and VISIT_PASSPORT_HEADER constant, it caused HMR errors. Fixed by:
1. Creating stampTypes.ts with all type exports and constants
2. Keeping only the React hook in useStampPages.tsx
3. Updating all imports to use stampTypes for type imports

This is a common Vite/React Fast Refresh limitation that affects any file exporting React components or hooks.

**Related files:**
- `src/hooks/useStampPages.tsx`
- `src/hooks/stampTypes.ts`

## Human ID SDK initHumanID usage without await
**Date:** 2025-09-04

The useHumanIDVerification hook calls initHumanID() without await on line 165. This is actually correct - initHumanID appears to be synchronous in the real SDK and returns a provider object directly, not a promise.

Our mock incorrectly made it async. The mock needs to be synchronous to match the real SDK's interface.

**Related files:**
- `src/hooks/useHumanIDVerification.tsx`
- `dev/src/mocks/mockHumanIdSdk.ts`