# Safe HTML Rendering Pattern

## SanitizedHTMLComponent Usage

The codebase has a `SanitizedHTMLComponent` that safely renders HTML content using DOMPurify for sanitization and html-react-parser for parsing. This should **ALWAYS** be used when rendering any dynamic HTML content, including SVGs, instead of using `dangerouslySetInnerHTML` or custom render functions.

## Usage Pattern

### 1. Process During Data Fetching

For API data with HTML/SVG strings, process them during data fetching:

```tsx
icon: platform.icon ? <SanitizedHTMLComponent html={platform.icon} /> : null
```

### 2. Render as ReactNode

In the component, just render the processed ReactNode directly:

```tsx
{platform.icon && <span className={styles.platformIcon}>{platform.icon}</span>}
```

### 3. Type Definitions

Type definitions should reflect this separation:

- **Raw data type (from API)**: `icon: string`
- **Processed type (after sanitization)**: `icon: ReactNode`

## Icon Field Implementation

Platform icons follow the same data processing pattern as descriptions:

### Type Definitions

- `RawPlatformData` has `icon: string` (raw from API)
- `Platform` has `icon: ReactNode` (processed)

### Data Processing During Fetch

- URLs get wrapped in img tags: `<img src="${url}" alt="${name} icon" />`
- All content goes through SanitizedHTMLComponent for XSS protection
- Processing happens once during data fetching, not in render

### Mock Data Examples

- **Inline SVG**: Full SVG string
- **CDN URLs**: Use stable sources like jsdelivr.net
- **Emojis**: Simple unicode characters

### Rendering

- Just render the ReactNode directly: `{platform.icon}`
- Wrapper elements are only for styling, not processing

## Security Benefits

This pattern ensures:
- All dynamic HTML is sanitized to prevent XSS attacks
- Support for various formats (URLs as img tags, inline SVGs, emojis)
- Single sanitization point early in data flow
- Type safety with ReactNode

**Related files:**

- `src/components/SanitizedHTMLComponent.tsx`
- `src/components/Body/ScoreTooLowBody.tsx`
- `src/hooks/stampTypes.ts`
- `dev/src/mocks/handlers.ts`