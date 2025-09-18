### [19:24] [ui] Widget Fixed Height Requirement
**Details**: The Passport widget MUST maintain a fixed height of 300px for the .expanded container. This is a critical design requirement for consistent widget appearance across all states and views. The .expanded class in Body.module.css must always have `height: 300px` set. When creating scrollable content areas within the widget, give them their own fixed heights (like 240px for .allStampsContainer) to work within the 300px constraint, but never remove or make the main container height flexible.
**Files**: src/components/Body/Body.module.css
---

### [19:26] [ui] Widget Total Height Architecture
**Details**: The Passport widget has a TOTAL fixed height of 300px that includes both header and body. The breakdown is:
- Header: 55px fixed height (defined in Header.module.css)
- Body: 245px fixed height (300px total - 55px header)
The .expanded class in Body.module.css must always be 245px to maintain the 300px total widget height. When creating scrollable areas within the body, adjust their heights accordingly (e.g., allStampsContainer uses ~185px to fit within the 245px body with padding).
**Files**: src/components/Header.module.css, src/components/Body/Body.module.css
---

