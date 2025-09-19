# Backend API Requirements: Platform Icons

## Overview
The Passport Widget redesign requires platform icons to be displayed alongside each stamp option in the "Add Stamps" page. This document outlines the backend API changes needed to support this feature.

## API Endpoint Changes

### Endpoint: GET `/embed/stamps/metadata`

#### Current Response Structure
```json
[
  {
    "header": "Web3 & DeFi",
    "platforms": [
      {
        "platformId": "ETH",
        "name": "ETH",
        "description": "Hold at least 0.01 ETH",
        "documentationLink": "https://docs.passport.xyz/stamps/eth",
        "requiresSignature": false,
        "credentials": [...],
        "displayWeight": "1"
      }
    ]
  }
]
```

#### Required Response Structure
```json
[
  {
    "header": "Web3 & DeFi",
    "platforms": [
      {
        "platformId": "ETH",
        "name": "ETH",
        "description": "Hold at least 0.01 ETH",
        "documentationLink": "https://docs.passport.xyz/stamps/eth",
        "requiresSignature": false,
        "icon": "https://example.com/icons/eth.svg", // NEW REQUIRED FIELD
        "credentials": [...],
        "displayWeight": "1"
      }
    ]
  }
]
```

## New Field Specification

### Field Name: `icon`
- **Type**: `string` (required)
- **Description**: URL or inline SVG string for the platform icon
- **Format Options**:
  1. **External URL**: `"https://example.com/icons/platform.svg"`
  2. **Data URI**: `"data:image/svg+xml;base64,..."`
  3. **Inline SVG**: `"<svg>...</svg>"`
  4. **Emoji/Unicode**: `"🔷"` (for simple icons)

## Icon Requirements

### Technical Specifications
- **Preferred Format**: SVG for scalability
- **Fallback Format**: PNG with transparent background
- **Recommended Size**: 24x24px viewBox for SVG, 48x48px for PNG (2x for retina)
- **Color Mode**: Icons should work on dark backgrounds (white/light colored)

### Platform-Specific Icons Needed

Based on the current platforms in the system, here are the icons required:

#### Physical Verification Platforms
- **Government ID (HumanIdKyc)**: ID card icon
- **Binance KYC**: Binance logo
- **Biometrics**: Fingerprint or face recognition icon
- **Coinbase KYC**: Coinbase logo
- **Phone Verification**: Phone/mobile icon
- **Proof of Clean Hands**: Hands/clean icon

#### Web2 Platforms
- **GitHub**: GitHub logo (Octocat)
- **LinkedIn**: LinkedIn logo
- **ZK Email**: Email/envelope icon
- **Discord**: Discord logo
- **Google**: Google "G" logo

#### Web3 & DeFi Platforms
- **ETH**: Ethereum logo
- **NFT**: NFT/art icon
- **Other blockchain platforms**: Respective chain logos

## Implementation Priority

### Phase 1 - Critical Platforms (Must Have)
These are platforms visible in the mockup:
- Government ID
- Binance
- Biometrics
- Coinbase KYC
- Phone Verification
- GitHub
- LinkedIn
- Discord

### Phase 2 - Additional Platforms
- All other platforms currently in the system

## Migration Strategy

1. **Backward Compatibility**: Initially, the frontend will handle missing icons gracefully by showing a default icon or the platform's first letter
2. **Gradual Rollout**: Icons can be added progressively - the API can start returning the icon field for some platforms while others are being prepared
3. **Caching**: Icon URLs should be cacheable with appropriate cache headers

## Example Implementation

### Before (Current API Response)
```json
{
  "platformId": "Discord",
  "name": "Discord",
  "description": "Active Discord member",
  "documentationLink": "https://docs.passport.xyz/stamps/discord",
  "requiresSignature": false,
  "requiresPopup": true,
  "popupUrl": "https://discord.com/oauth/authorize",
  "credentials": [...],
  "displayWeight": "1"
}
```

### After (With Icon Field)
```json
{
  "platformId": "Discord",
  "name": "Discord",
  "description": "Active Discord member",
  "documentationLink": "https://docs.passport.xyz/stamps/discord",
  "requiresSignature": false,
  "requiresPopup": true,
  "popupUrl": "https://discord.com/oauth/authorize",
  "icon": "https://cdn.passport.xyz/icons/discord.svg",
  "credentials": [...],
  "displayWeight": "1"
}
```

## Icon Hosting Recommendations

1. **CDN Hosting**: Host icons on a CDN for fast global delivery
2. **Version Control**: Include version in URL path for cache busting (e.g., `/v1/icons/`)
3. **CORS Headers**: Ensure proper CORS headers for cross-origin access
4. **Compression**: Use SVG optimization tools to minimize file size

## Testing Checklist

- [ ] All platforms return an icon field
- [ ] Icons are accessible via HTTPS
- [ ] Icons render correctly on dark backgrounds
- [ ] Icons load quickly (< 100ms)
- [ ] Missing/broken icon URLs are handled gracefully
- [ ] Icons display at correct size in the widget

## Questions for Backend Team

1. Do you have existing icon assets for these platforms?
2. Where will icons be hosted (CDN, same server, third-party)?
3. Any preference between URL vs inline SVG approaches?
4. Timeline for implementing this change?

## Frontend Implementation Status

✅ **Completed**:
- Type definitions updated to include required `icon` field
- Mock data updated with sample icon URLs
- Frontend ready to consume icon data once provided by API

## Contact

For questions about this requirement, please contact the frontend team or refer to the redesign mockups in ADD_STAMPS_REDESIGN.md