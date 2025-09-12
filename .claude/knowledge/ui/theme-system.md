# Theme System and Widget Redesign

## Widget Redesign Specifications

### Design Tokens Comparison

**Current Design:**
- Black header/background
- White text
- Gray (#6D6D6D) secondary text
- White primary buttons

**Target Redesign:**
- Header: Black with teal/emerald gradient (#035E54 to #02443D)
- Body: Full teal gradient background
- Logo: Repositioned to right side of header
- Button: Bright teal (#00D4AA) with black text
- Text: White for most, green for success indicators

### Typography Changes

- Title: "Human Passport Score" → "Proof of Personhood"
- Body text: Simplified and restructured
- Footer: "Secured by human.tech" with small logo

## Flexible Theme System Implementation

### Extended Theme Type

The PassportWidgetTheme type now supports:
- **accent**: Optional color for CTAs (RGB format)
- **backgroundGradient**: Optional gradient with angle and color stops

### Theme Application

The setTheme function handles:
- New accent CSS variable
- Linear-gradient CSS generation from gradient configuration
- Backward compatibility for themes without gradient/accent

### CSS Variable Usage

- Body uses gradient with fallback to solid color
- Button uses accent color with fallback to primary
- Clean hover states with brightness filter

### Dark Theme Configuration

```typescript
{
  accent: "0, 212, 170", // #00D4AA - bright teal
  backgroundGradient: {
    angle: 180,
    stops: [
      { color: "3, 94, 84", position: 0 },    // #035E54
      { color: "2, 68, 61", position: 100 }   // #02443D
    ]
  }
}
```

### Implementation Results

- ✅ Teal gradient background applied to widget body
- ✅ Bright teal (#00D4AA) CTA button working
- ✅ Fully backward compatible
- ✅ Clean hover states with brightness filter

### Remaining Redesign Tasks

- Update header title text to "Proof of Personhood"
- Reposition logo to right side
- Add "Secured by human.tech" footer
- Update body text content

**Related files:**

- `src/widgets/Widget.tsx`
- `src/utils/themes.ts`
- `src/components/Body/Body.module.css`
- `src/components/Button.module.css`
- `src/components/Header.module.css`