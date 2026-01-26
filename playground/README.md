# Passport Embed Playground

An interactive three-panel interface for developers to configure, preview, and generate code for the PassportScoreWidget.

## Features

- **WYSIWYG Editor**: Configure all widget props through an intuitive interface
- **Live Preview**: See your widget render in real-time with mock wallet
- **Code Output**: Generate ready-to-use React and Next.js code
- **URL Sharing**: Share configurations via URL for collaboration
- **MSW Integration**: Test different scenarios without a real API

## Quick Start

From the root of the passport-embed repository:

```bash
# First time setup
yarn playground:setup

# Start the playground
yarn playground
```

The playground will open at http://localhost:3000

## Configuration Panels

### API Configuration
- **API Key**: Your Passport API key
- **Scorer ID**: Your scorer ID
- **Custom Service URL**: Override the default embed service URL

### Layout Options
- **Collapse Mode**: Choose between "off", "shift", or "overlay"
- **Custom CSS Class**: Add your own CSS classes

### Theme
- **Presets**: Dark or Light theme
- **Custom Colors**: Configure primary, secondary, background, success, and failure colors
- **Border Radius**: Customize widget and button corners
- **Typography**: Set body and heading fonts

### Testing Scenarios
Test different user states with MSW (Mock Service Worker):
- Default (passing score)
- Low Score (below threshold)
- High Score (many stamps)
- No Stamps (new user)
- Rate Limited
- Verification Fails
- And more...

## URL Sharing

The playground automatically encodes your configuration in the URL. Simply copy the URL to share your exact configuration with others.

## Development

### Project Structure

```
playground/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/
│   │   ├── ConfigPanel/  # Left panel components
│   │   ├── PreviewPanel/ # Middle panel with widget
│   │   ├── CodePanel/    # Right panel with code output
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities and configuration
│   └── mocks/            # MSW mock handlers
├── public/               # Static files (including MSW worker)
└── package.json
```

### Building

```bash
yarn playground:build
```

### Tech Stack

- Next.js 14+ with App Router
- Tailwind CSS v4
- Prism React Renderer for code highlighting
- MSW for API mocking
- React hooks for state management
