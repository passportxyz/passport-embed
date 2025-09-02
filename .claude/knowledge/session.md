### [22:34] [gotcha] More Options page breaks pagination tests
**Details**: When the More Options feature was added (commit 5096a9d), it added an extra page at the end of stamp pages in the usePaginatedStampPages hook. This changes the pagination behavior - what was previously the last page (Page 2) is no longer the last page, as "More Options" is now appended. Tests need to account for this extra page when testing pagination - isLastPage is now false for Page 2, and you need to navigate one more time to reach the actual last page ("More Options" with empty platforms array).
**Files**: test/hooks/useStampPages.test.tsx, src/hooks/useStampPages.tsx
---

