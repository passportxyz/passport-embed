# Add Stamps Page Redesign Implementation Guide

## Overview
This document outlines the required changes to update the Add Stamps page (ScoreTooLowBody component) to match the new design mockup. The redesign focuses on improving visual hierarchy, scroll UX, and stamp selection clarity.

## Current vs Target Design

### Screenshot Comparison
- **Current Implementation**: Shows categories as headers, uses scroll arrows (↓↑), stamps in pill buttons
- **Target Design**: Clean list layout with score values on right, scroll fade effect, green highlights for verified stamps

## Key Implementation Changes

### 1. Replace Scroll Arrows with Fade Effect
**Current**: Uses scroll arrow indicators (↓ at bottom, ↑ at top)
**Target**: Implement a fade/gradient overlay at the bottom of the scrollable area

**Implementation**:
- Remove the scroll arrow UI components
- Add a CSS gradient overlay at the bottom of the scrollable container
- Use `linear-gradient(transparent, rgba(background-color, 1))`
- Position absolutely at bottom of container
- Should be pointer-events: none to allow clicking through

**Files to modify**:
- `src/components/Body/PlatformVerification.module.css`
- `src/components/Body/PlatformVerification.tsx`

### 2. Add Back Navigation Header
**Current**: Shows stamp categories directly
**Target**: "← Verify Activities" header with back navigation

**Implementation**:
- Add a header section with back arrow and "Verify Activities" text
- Back arrow should navigate to the previous state (InitialTooLow)
- Use the existing state management to switch between AddStamps and InitialTooLow

**Files to modify**:
- `src/components/Body/ScoreTooLowBody.tsx`

### 3. Update Section Headers
**Current**: Shows category names from API (e.g., "WEB3 & DEFI", "SOCIAL & COMMUNITY")
**Target**: Shows section headers like "Physical Verification", "Web2 Platforms"

**Note**: These headers come from the API configuration, no code changes needed for text content.

### 4. Redesign Stamp Buttons
**Current**: Pill-shaped buttons with small score badges
**Target**: Full-width rectangular buttons with scores on the right

**Implementation**:
```css
/* New stamp button styling */
.stampButton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
}

.stampName {
  flex: 1;
  text-align: left;
}

.stampScore {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
}

.chevronIcon {
  width: 20px;
  height: 20px;
  opacity: 0.5;
}
```

**Layout Structure**:
```jsx
<button className={styles.stampButton}>
  <Icon /> {/* Platform icon */}
  <span className={styles.stampName}>{platform.name}</span>
  <span className={styles.stampScore}>{score}</span>
  <ChevronRight className={styles.chevronIcon} />
</button>
```

**Files to modify**:
- `src/components/Body/PlatformButton.tsx`
- `src/components/Body/PlatformButton.module.css`

### 5. Highlight Verified Stamps
**Current**: No visual distinction for already-verified stamps
**Target**: Green background for verified stamps (e.g., Government ID, Discord in mockup)

**Implementation**:
- Check if stamp exists in user's current stamps array
- Apply green highlight class if verified
- Use theme's accent color: `rgba(0, 212, 170, 0.2)` for background
- Stronger text color for verified stamps

```css
.stampButtonVerified {
  background: rgba(0, 212, 170, 0.2);
  border-color: rgba(0, 212, 170, 0.3);
}
```

**Files to modify**:
- `src/components/Body/PlatformButton.tsx` (add verified prop logic)
- `src/components/Body/PlatformButton.module.css`

### 6. Update Button Visual Style
**Current**: Light pill buttons with hover effects
**Target**: Dark rectangular buttons with subtle borders

**Implementation**:
- Remove pill shape (border-radius: 8px instead of full)
- Darker background with subtle transparency
- Add subtle border for definition
- Maintain hover states but make them subtler

**Files to modify**:
- `src/components/Body/PlatformButton.module.css`

### 7. Update "Explore Additional Stamps" Link
**Current**: Uses emoji (🚀) and arrow (↗)
**Target**: Clean design with house icon and arrow icon

**SVG Icons to add**:
```jsx
// House icon
<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_19972_1747)">
    <path d="M1.8335 4.66732L4.7735 1.72732C4.89753 1.60254 5.04504 1.50354 5.20752 1.43604C5.36999 1.36853 5.54422 1.33385 5.72016 1.33398H11.2802C11.4561 1.33385 11.6303 1.36853 11.7928 1.43604C11.9553 1.50354 12.1028 1.60254 12.2268 1.72732L15.1668 4.66732M1.8335 4.66732H15.1668M1.8335 4.66732V6.66732C1.8335 7.02094 1.97397 7.36008 2.22402 7.61013C2.47407 7.86018 2.81321 8.00065 3.16683 8.00065M15.1668 4.66732V6.66732C15.1668 7.02094 15.0264 7.36008 14.7763 7.61013C14.5263 7.86018 14.1871 8.00065 13.8335 8.00065M3.16683 8.00065V13.334C3.16683 13.6876 3.30731 14.0267 3.55735 14.2768C3.8074 14.5268 4.14654 14.6673 4.50016 14.6673H12.5002C12.8538 14.6673 13.1929 14.5268 13.443 14.2768C13.693 14.0267 13.8335 13.6876 13.8335 13.334V8.00065M3.16683 8.00065C3.55634 7.97921 3.92834 7.83182 4.22683 7.58065C4.30638 7.52317 4.40202 7.49223 4.50016 7.49223C4.59831 7.49223 4.69395 7.52317 4.7735 7.58065C5.07198 7.83182 5.44399 7.97921 5.8335 8.00065C6.22301 7.97921 6.59501 7.83182 6.8935 7.58065C6.97304 7.52317 7.06869 7.49223 7.16683 7.49223C7.26497 7.49223 7.36062 7.52317 7.44016 7.58065C7.73865 7.83182 8.11065 7.97921 8.50016 8.00065C8.88967 7.97921 9.26168 7.83182 9.56016 7.58065C9.63971 7.52317 9.73535 7.49223 9.8335 7.49223C9.93164 7.49223 10.0273 7.52317 10.1068 7.58065C10.4053 7.83182 10.7773 7.97921 11.1668 8.00065C11.5563 7.97921 11.9283 7.83182 12.2268 7.58065C12.3064 7.52317 12.402 7.49223 12.5002 7.49223C12.5983 7.49223 12.694 7.52317 12.7735 7.58065C13.072 7.83182 13.444 7.97921 13.8335 8.00065M10.5002 14.6673V12.0007C10.5002 11.647 10.3597 11.3079 10.1096 11.0578C9.85959 10.8078 9.52045 10.6673 9.16683 10.6673H7.8335C7.47987 10.6673 7.14074 10.8078 6.89069 11.0578C6.64064 11.3079 6.50016 11.647 6.50016 12.0007V14.6673" stroke="#929292" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_19972_1747">
      <rect width="16" height="16" fill="white" transform="translate(0.5)"/>
    </clipPath>
  </defs>
</svg>

// Arrow icon
<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.5 7H17.5M17.5 7V17M17.5 7L7.5 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Implementation**:
- Replace emoji with SVG icons
- Style as a cleaner link/button hybrid
- Ensure proper spacing and alignment

**Files to modify**:
- `src/components/Body/ScoreTooLowBody.tsx` (if link is here)
- `src/components/Body/PlatformVerification.tsx` (if link is in scrollable area)

### 8. Adjust Overall Layout and Spacing
**Current**: Looser spacing, less compact
**Target**: Tighter, more organized layout

**Implementation**:
- Reduce vertical spacing between elements
- Ensure consistent padding throughout
- Make the scrollable area height appropriate for showing ~4-5 items
- Total widget height should remain 355px (300px body + 55px header)

**Files to modify**:
- `src/components/Body/Body.module.css`
- `src/components/Body/PlatformVerification.module.css`

## TODO Items

1. [ ] Add platform icons to stamp pages data structure (requires backend API changes to include icon URLs or SVG data)

## Testing Checklist

1. [ ] Scroll fade effect appears at bottom when content is scrollable
2. [ ] Back arrow returns to InitialTooLow state
3. [x] Stamp buttons show scores on the right side
4. [x] Verified stamps have green background highlight
5. [x] Chevron arrows appear on right of each stamp button
6. [ ] "Explore Additional Stamps" uses new icons
7. [x] Overall layout is more compact and organized
8. [x] Widget maintains 355px total height
9. [x] Hover states work appropriately
10. [x] Theme colors are used consistently

## Development Setup

1. Run dev server with MSW mocking: `npm run dev:mock`
2. Select "User below threshold" scenario to test Add Stamps flow
3. Use Mock Wallet for testing without MetaMask
4. Test with various scenarios to ensure verified stamps highlight correctly

## Key Files Reference

- **Main component**: `src/components/Body/ScoreTooLowBody.tsx`
- **Scrollable stamps list**: `src/components/Body/PlatformVerification.tsx`
- **Individual stamp button**: `src/components/Body/PlatformButton.tsx`
- **Styling**:
  - `src/components/Body/Body.module.css`
  - `src/components/Body/PlatformVerification.module.css`
  - `src/components/Body/PlatformButton.module.css`

## Notes

- The section headers ("Physical Verification", "Web2 Platforms") come from the API configuration and don't require code changes
- Green highlight color should use the theme's accent color: `rgba(0, 212, 170, 0.2)`
- Maintain existing functionality while updating visual design
- Ensure all interactive elements remain accessible