# UI Alignment Gotchas

## Widget Padding Design (Current Implementation)

**Date:** 2025-08-21
**Status:** Asymmetric padding is the current intentional design

The Passport widget uses asymmetric padding for visual balance:

1. **CSS Variable**: `--widget-padding-y-c6dbf459: 12px` (unchanged in `/workspace/project/src/widgets/Widget.module.css`)
2. **Actual Body Padding**: `padding: 12px var(--widget-padding-x-c6dbf459) 20px` (in `/workspace/project/src/components/Body/Body.module.css`)
3. **Result**: 12px top padding, 20px bottom padding - asymmetric by design

**Current Implementation:**

- Top padding: 12px (compact header spacing)
- Bottom padding: 20px (extra space for button breathing room)
- Left/right padding: 20px (consistent horizontal spacing)
- This creates visual hierarchy with more emphasis on the bottom action area

**Note:** Documentation previously indicated padding was "changed to 20px consistently" but the actual implementation maintains asymmetric padding (12px top, 20px bottom) which appears to be intentional design.

**Related files:**

- `src/widgets/Widget.module.css`
- `src/components/Body/Body.module.css`

## ScrollableDiv Double className Application

**Date:** 2025-09-19
ScrollableDiv was applying the passed className to both the outer and inner div, causing double padding. The className should only be on the outer div. The inner div (now called .contents) should not have the className. This caused issues where padding was applied twice when trying to position scrollbars at widget edges.

**Related files:**

- `src/components/ScrollableDiv.tsx`

## ScrollableDiv Grid Centering Pushes Content Up

**Date:** 2025-09-19
ScrollableDiv uses CSS grid with place-self: center on all children, which vertically centers content and can push it outside the container bounds. When the content should fill the container (like for scrollable lists), the inner .contents div needs place-self: stretch to override the centering and properly fill the available space.

**Related files:**

- `src/components/ScrollableDiv.module.css`

## Platform Verification Height Adjustments

**Date:** 2025-08-21
The PlatformVerification component was adjusted to work with the asymmetric body padding:

**Components affected:**

- PlatformVerification component in AddStamps view
- ScrollableDiv with multiple stamp options
- Platform button group container

**Implemented Adjustments:**

- platformButtonGroup height: 126px (accommodates content and scrolling)
- PlatformVerification max-height: 136px (provides proper scroll boundaries)
- These adjustments work with the asymmetric padding design (12px top, 20px bottom)

## Visual Design Results

**Date:** 2025-08-21
The asymmetric padding design achieves specific visual goals:

**Design Outcomes:**

- ✅ Compact top area: 12px top padding keeps header and text close together
- ✅ Generous bottom space: 20px bottom padding gives buttons adequate breathing room
- ✅ Visual hierarchy: More emphasis on action area at bottom
- ✅ Stamp flow: Component heights adjusted to work with asymmetric padding
- ✅ Text positioning: Slightly above center due to asymmetric padding, creating visual balance

This asymmetric design creates intentional visual weight toward the bottom action area.

**Related files:**

- `/workspace/project/src/widgets/Widget.module.css`
- `/workspace/project/src/components/Body/Body.module.css`
- `/workspace/project/src/components/Body/PlatformVerification.module.css`
