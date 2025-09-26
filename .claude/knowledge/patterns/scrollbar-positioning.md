# Scrollbar Positioning at Widget Edge

## Pattern for Widget-Edge Scrollbars

To position scrollbar at widget edge while maintaining content padding:

### Implementation Steps

1. **Remove padding from parent container** (`.expanded:has(.allStampsContainer)`)
2. **Make outer div handle scrolling** (`.allStampsContainer` with `overflow-y: auto`)
3. **Apply horizontal padding to scrollable container** for content spacing
4. **Remove overflow from inner div** since parent handles scrolling
5. **Fix grid centering** by using `place-self: stretch` on inner content div

### Benefits

- Scrollbar sits flush against widget border
- Content stays properly padded
- Clean visual appearance with no extra margins

### CSS Pattern

```css
/* Parent container - no padding */
.expanded:has(.allStampsContainer) {
  padding: 0;
}

/* Scrollable container - handles overflow and horizontal padding */
.allStampsContainer {
  overflow-y: auto;
  padding: 0 var(--widget-padding-x);
}

/* Inner content - stretches to fill */
.contents {
  place-self: stretch;
}
```

**Related files:**

- `src/components/Body/Body.module.css`
- `src/components/ScrollableDiv.module.css`