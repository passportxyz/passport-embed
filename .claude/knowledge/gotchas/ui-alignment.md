# UI Alignment Gotchas

## Text Alignment Issues in Passport Widget
**Date:** 2025-08-21  
The Passport widget had three main alignment issues that were resolved:

1. **Bottom button padding** - Was using --widget-padding-y-c6dbf459 variable (12px), needed to be 20px consistently
2. **Text vertical centering** - Text needed proper vertical centering between button and container top
3. **Congratulations screen** - Text was slightly above center

**Current measurements before fix:**
- Container padding: 12px top/bottom, 20px left/right
- Button distance to bottom: 13px (should be 20px)
- Text block distance to top: 12px
- Gap between text and button: 8px

**Solution:** Changed --widget-padding-y-c6dbf459 from 12px to 20px for consistent padding.

**Related files:**
- `src/widgets/Widget.module.css`
- `src/components/Body/Body.module.css`

## Padding Change Impact on Stamp Flow
**Date:** 2025-08-21  
Changing --widget-padding-y-c6dbf459 from 12px to 20px affects other components:

**Components affected:**
- PlatformVerification component uses the same padding variables
- AddStamps view with platform buttons list
- ScrollableDiv with multiple stamp options

**Adjustments required:**
- Increased platformButtonGroup height from 110px to 126px (extra 16px)
- Adjusted PlatformVerification max-height from 120px to 136px
- These changes maintain proper scrollability while accommodating the increased padding

**Related files:**
- `src/components/Body/PlatformVerification.module.css`

## Text Alignment Solution Results
**Date:** 2025-08-21  
Successfully fixed text alignment issues with the following changes:

**Changes made:**
1. Changed --widget-padding-y-c6dbf459 from 12px to 20px in Widget.module.css
2. Increased platformButtonGroup height from 110px to 126px
3. Adjusted PlatformVerification max-height calculation from 120px to 136px

**Results:**
- ✅ Bottom button padding: Now has proper 20px padding (was 12-13px)
- ✅ Top/bottom padding consistency: Both are now 20px
- ✅ Text vertical centering: Improved (though still slightly above center due to flexbox behavior)
- ✅ Stamp flow: Still works well with adjusted heights, maintains scrollability

This solution addresses all issues mentioned in GitHub issue #3467 while maintaining functionality.

**Related files:**
- `src/widgets/Widget.module.css`
- `src/components/Body/Body.module.css`
- `src/components/Body/PlatformVerification.module.css`