# Passport Widget Query Architecture Fix

## Problem Summary

The passport widget has a modal state loss issue where clicking "Verify" causes users to be redirected back to the "Add Stamps" page, losing their place in the verification flow.

### Root Cause Analysis

1. **Immediate Issue**: The `BodyRouter` component uses `useWidgetIsQuerying()` which tracks ALL query activity (including mutations). When a user clicks "Verify", it triggers a mutation that sets `isQuerying` to true, causing the entire `ScoreTooLowBody` component to unmount and be replaced with `CheckingBody`. When the query completes, a new `ScoreTooLowBody` instance is created with fresh state, losing the `openPlatform` modal state.

2. **Architectural Issue**: The current implementation violates React Query best practices by mixing data fetching with business logic. The `useWidgetPassportScoreAndVerifyCredentials` hook automatically triggers mutations based on query data, creating unpredictable side effects.

### Historical Context

- **Commit 3495687**: Introduced the "double query" pattern to optimize performance - check score first, then auto-verify only if needed (instead of always doing expensive auto-verify)
- **Commit 6ab736b**: Tried to fix an issue where the second query wasn't being waited for by always showing `CheckingBody` when `isQuerying` is true, inadvertently creating the modal state loss

## Solution Design

### Core Requirements
1. **Initial load**: Check score → if low, auto-verify all credentials
2. **Manual verification**: Auto-verify just the specific credential  
3. **Tab change/refresh**: Just fetch score (no auto-verify)
4. **Both endpoints return score data**
5. **Preserve modal state during verification**

### Proposed Architecture

#### 1. Separate Data Fetching from Business Logic

```typescript
// Pure data hooks - no side effects
const usePassportScore = () => {
  // Uses existing usePassportScoreInternal but without auto-mutation
};

const useVerifyCredentials = () => {
  // Pure mutation hook, updates score cache on success
};
```

#### 2. Move Business Logic to App Level

```typescript
const PassportScoreWidget = (props) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: score, isLoading } = usePassportScore();
  const { mutate: verify } = useVerifyCredentials();

  // Explicit initial workflow at the app level
  useEffect(() => {
    // Logic for initial auto-verify when score is low
  }, [isLoading, score, isInitialized]);

  return (
    <QueryContextProvider>
      <Header />
      <Body showLoading={isLoading || (!isInitialized && score && !score.passingScore)} />
    </QueryContextProvider>
  );
};
```

#### 3. Fix Body Router Loading Logic

```typescript
const BodyRouter = ({ showLoading }) => {
    ...

  if (showLoading) {  // Use explicit loading state, not global isQuerying
    return <CheckingBody />;
  }
   ...

};
```

### Benefits

1. **Fixes Modal Issue**: Components no longer unmount during mutations
2. **Explicit Behavior**: Business logic is obvious and at the right level
3. **Predictable**: No hidden side effects in data hooks
4. **Testable**: Can test business logic separately from data fetching
5. **Simple**: Clear separation of concerns
6. **Maintains Performance**: Still optimizes by checking score before auto-verify

### Implementation Plan

1. **Create pure data hooks** without side effects (preserving existing internal structure)
2. **Move initialization logic** to widget root component
3. **Update Body component** to use explicit loading state
4. **Remove automatic mutation** from existing hooks
5. **Keep Header's global `isQuerying`** for user feedback
6. **Test modal state preservation** during verification

### Key Principle

**Queries should answer "what data do I have?" and components should answer "what should I do with this data?"**

The auto-verify logic belongs at the app level where it can be explicit and controlled, not hidden inside data fetching hooks.

### Files to Modify

- `src/hooks/usePassportScore.tsx` - Remove auto-mutation logic
- `src/components/Body.tsx` - Use explicit loading state
- `src/widgets/PassportScoreWidget.tsx` - Add initialization logic
- Remove `useWidgetPassportScoreAndVerifyCredentials` hook

### Testing

- Verify modal state is preserved during verification
- Ensure initial auto-verify still works
- Confirm refresh only fetches score (no auto-verify)
- Test manual verification flow
