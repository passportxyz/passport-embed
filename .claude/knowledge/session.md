### [17:20] [ui] Widget redesign theme colors and approach
**Details**: For the Passport widget redesign, use the existing theme system with CSS variables rather than hardcoding colors:
- Header background: Should be solid black using rgba(var(--color-background-c6dbf459), 1)
- Green text color for ConnectWalletBody: Use the accent color #00D4AA which is already defined as "0, 212, 170" in DarkTheme
- Button styling: Can use filter: brightness() to modify existing theme colors
- Green blur effect: Already have teal gradient in theme (3, 94, 84 to 2, 68, 61)
- All spacing should use theme variables like --widget-padding-x-c6dbf459
- Never hardcode colors - always use theme system for maintainability
**Files**: src/utils/themes.ts, src/components/Header.module.css, src/components/Body/Body.module.css
---

