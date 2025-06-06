# Deduplication Flag Implementation - Passport Embed

## Overview

This document describes the implementation of the deduplication flag feature for the passport-embed library. This provides enhanced visibility when stamps have been claimed by another wallet address, ensuring users understand why they may have zero points for a stamp they qualify for.

## Current State

The passport-embed library **already supports the V2 API format** with deduplication flags:

- ✅ API integration handles stamps objects with `dedup` boolean flags
- ✅ `EmbedScoreResponse` type includes deduplication data
- ✅ `PassportProviderPoints` includes dedup status in internal representation
- ✅ No migration handling needed - already using V2 format

## Implementation Requirements

### User Story

Users should understand when a stamp qualification exists but was claimed under a different wallet address through clear visual indicators and explanations.

### Acceptance Criteria

1. **Platform Button Badge**: Display a "Dedupe" badge on platform buttons when any stamps in that platform are deduplicated
2. **Platform Window Explanation**: Show explanation text in the platform verification window when deduplication is detected
3. **Visual Design**: Use consistent styling with existing UI patterns

## Technical Implementation

### 1. Enhanced Platform Status Detection

#### New Hook: `usePlatformDeduplication`

Create a hook to detect if a platform has deduplicated stamps:

```typescript
// src/hooks/usePlatformDeduplication.tsx
import { useMemo } from "react";
import { useWidgetPassportScore } from "./usePassportScore";
import { Platform } from "./useStampPages";

export const usePlatformDeduplication = ({
  platform,
}: {
  platform: Platform;
}) => {
  const { data } = useWidgetPassportScore();

  return useMemo(() => {
    if (!data?.stamps) return false;

    // Check if any credential in this platform is deduplicated
    return platform.credentials.some((credential) => {
      const stampData = data.stamps[credential.id];
      if (!stampData) return false;

      // A stamp is deduplicated if:
      // 1. It has a dedup flag set to true
      // 2. Score is 0 (indicating points were claimed elsewhere)
      return stampData.dedup && stampData.score === 0;
    });
  }, [platform, data?.stamps]);
};
```

### 2. UI Components Implementation

#### A. Enhanced PlatformButton Component

Update the `PlatformButton` in `ScoreTooLowBody.tsx` to show deduplication badge:

```tsx
const DedupeBadge = () => (
  <div className={styles.dedupeBadge}>
    <span className={styles.dedupeText}>Dedupe</span>
  </div>
);

const PlatformButton = ({
  platform,
  setOpenPlatform,
}: {
  platform: Platform;
  setOpenPlatform: (platform: Platform) => void;
}) => {
  const { claimed } = usePlatformStatus({ platform });
  const isDeduped = usePlatformDeduplication({ platform });

  return (
    <button
      className={`${styles.platformButton} ${
        claimed ? styles.platformButtonClaimed : ""
      }`}
      onClick={() => setOpenPlatform(platform)}
    >
      <div className={styles.platformButtonHeader}>
        <div className={styles.platformButtonTitle}>{platform.name}</div>
        {isDeduped && <DedupeBadge />}
      </div>
      {claimed ? (
        <ClaimedIcon />
      ) : (
        <div className={styles.platformButtonWeight}>
          {platform.displayWeight}
        </div>
      )}
      <RightArrow invertColors={claimed} />
    </button>
  );
};
```

#### B. Enhanced PlatformVerification Component

Update `PlatformVerification.tsx` to show deduplication explanation:

```tsx
const DeduplicationNotice = () => (
  <div className={styles.deduplicationNotice}>
    <div className={styles.noticeHeader}>⚠️ Already Claimed</div>
    <div className={styles.noticeText}>
      Some stamps for this platform were already claimed by another wallet
      address. You can still verify to confirm your eligibility, but won't
      receive points for stamps claimed elsewhere.
    </div>
  </div>
);

export const PlatformVerification = ({
  platform,
  onClose,
  generateSignatureCallback,
}) => {
  const { claimed } = usePlatformStatus({ platform });
  const isDeduped = usePlatformDeduplication({ platform });
  // ... existing logic ...

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div>{platform.name}</div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          disabled={isQuerying}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Show deduplication notice if applicable */}
      {isDeduped && <DeduplicationNotice />}

      <ScrollableDiv
        className={styles.description}
        invertScrollIconColor={true}
      >
        {failedVerification ? (
          <div>
            Unable to claim this Stamp. Find{" "}
            <Hyperlink href={platform.documentationLink}>
              instructions here
            </Hyperlink>{" "}
            and come back after.
          </div>
        ) : (
          <div>{platform.description}</div>
        )}
      </ScrollableDiv>

      {/* ... rest of component ... */}
    </div>
  );
};
```

### 3. CSS Styles Implementation

#### Add to `Body.module.css`:

```css
/* Platform button header container for badge layout */
.platformButtonHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Dedupe badge styling */
.dedupeBadge {
  background-color: rgb(var(--color-background-c6dbf459));
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: rgb(var(--color-foreground-c6dbf459));
  font-weight: 500;
  text-transform: uppercase;
}

.dedupeText {
  font-family: var(--font-family-alt, monospace);
}
```

#### Add to `PlatformVerification.module.css`:

```css
/* Deduplication notice styling */
.deduplicationNotice {
  background-color: rgba(var(--color-background-c6dbf459), 0.1);
  border: 1px solid rgba(var(--color-background-c6dbf459), 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.noticeHeader {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--color-foreground-c6dbf459));
  margin-bottom: 8px;
}

.noticeText {
  font-size: 13px;
  line-height: 1.4;
  color: rgb(var(--color-foreground-c6dbf459));
  opacity: 0.8;
}
```

### 4. Testing Implementation

#### Test File: `test/hooks/usePlatformDeduplication.test.tsx`

```typescript
import { renderHook } from "@testing-library/react";
import { usePlatformDeduplication } from "../../src/hooks/usePlatformDeduplication";
import { Platform } from "../../src/hooks/useStampPages";

// Mock the useWidgetPassportScore hook
jest.mock("../../src/hooks/usePassportScore", () => ({
  useWidgetPassportScore: jest.fn(),
}));

describe("usePlatformDeduplication", () => {
  const mockPlatform: Platform = {
    name: "Twitter",
    description: "Connect your Twitter account",
    documentationLink: "https://docs.example.com",
    credentials: [{ id: "Twitter", weight: "1.0" }],
    displayWeight: "1.0",
  };

  it("should return true when platform has deduplicated stamps", () => {
    const mockData = {
      stamps: {
        Twitter: {
          score: 0,
          dedup: true,
          expiration_date: "2024-12-31T00:00:00Z",
        },
      },
    };

    require("../../src/hooks/usePassportScore").useWidgetPassportScore.mockReturnValue(
      { data: mockData },
    );

    const { result } = renderHook(() =>
      usePlatformDeduplication({ platform: mockPlatform }),
    );
    expect(result.current).toBe(true);
  });

  it("should return false when platform has no deduplicated stamps", () => {
    const mockData = {
      stamps: {
        Twitter: {
          score: 5,
          dedup: false,
          expiration_date: "2024-12-31T00:00:00Z",
        },
      },
    };

    require("../../src/hooks/usePassportScore").useWidgetPassportScore.mockReturnValue(
      { data: mockData },
    );

    const { result } = renderHook(() =>
      usePlatformDeduplication({ platform: mockPlatform }),
    );
    expect(result.current).toBe(false);
  });
});
```

#### Test File: `test/components/ScoreTooLowBody.test.tsx` (updates)

```typescript
// Add test cases for deduplication badge display
describe("PlatformButton with deduplication", () => {
  it("should show dedupe badge when platform has deduplicated stamps", async () => {
    // Mock deduplication scenario
    const mockData = {
      stamps: {
        "credential-1": { score: 0, dedup: true },
      },
    };

    mockedUseWidgetPassportScore.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <QueryContextProvider {...mockQueryProps}>
        <ScoreTooLowBody generateSignatureCallback={mockCallback} />
      </QueryContextProvider>
    );

    // Check for dedupe badge
    expect(container.querySelector(".dedupeBadge")).toBeInTheDocument();
    expect(screen.getByText("Dedupe")).toBeInTheDocument();
  });
});
```

### 5. Integration Points

#### Type Updates (Already Complete)

The existing `PassportProviderPoints` type already includes the dedup flag:

```typescript
export type PassportProviderPoints = {
  score: number;
  dedup: boolean;
  expiration_date?: string;
};
```

#### API Response Processing (Already Complete)

The `processScoreResponse` function in `usePassportScore.tsx` already processes dedup flags from the V2 API response.

## Implementation Checklist

### ✅ Prerequisites (Already Complete)

- [x] V2 API format support in types
- [x] API response processing with dedup flags
- [x] Internal data structures with deduplication status

### 🚧 New Implementation Required

- [ ] Create `usePlatformDeduplication` hook
- [ ] Update `PlatformButton` component with badge
- [ ] Update `PlatformVerification` component with notice
- [ ] Add CSS styles for badge and notice
- [ ] Write comprehensive tests
- [ ] Update documentation

### 📋 Testing Scenarios

1. **Platform with deduplicated stamps**: Show badge and notice
2. **Platform with no deduplicated stamps**: Show normal UI
3. **Mixed scenario**: Platform with both claimed and deduplicated stamps
4. **Empty stamps data**: Handle gracefully with no badge
5. **Edge cases**: Invalid stamp data, missing dedup flags

## Design Rationale

### Visual Design Decisions

- **Badge Position**: Top-right of platform name for high visibility
- **Badge Style**: Subtle gray background to indicate "inactive" status
- **Notice Placement**: Above description in platform window for immediate visibility
- **Color Scheme**: Uses existing CSS variables for theme consistency

### Technical Decisions

- **Hook-based Architecture**: Follows existing patterns in the codebase
- **Memoization**: Prevents unnecessary re-calculations
- **Graceful Degradation**: Works even if dedup data is missing
- **No Breaking Changes**: Purely additive feature

## Summary

This implementation provides clear visual feedback about stamp deduplication while maintaining consistency with the existing UI patterns. The feature enhances user understanding of why they may have zero points for stamps they qualify for, improving the overall user experience of the passport verification process.
