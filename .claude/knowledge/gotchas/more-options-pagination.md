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