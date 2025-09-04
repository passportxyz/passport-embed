# passport-embed

## Installation

```bash
yarn add @human.tech/passport-embed
```

## Usage

See the [dev server](./dev/src/index.tsx) for example advanced usage, although
generally the following will suffice:

```jsx
import React from 'react';
import { PassportScoreWidget } from '@human.tech/passport-embed';

const App = () => {
  return (
    {/* ... */}
    <PassportScoreWidget
      apiKey="API_KEY"
      address="0x..."
      scorerId="5"
      collapseMode="overlay" /* or "shift" or "off" */
      connectWalletCallback={/* your app's connect button callback */}
      generateSignatureCallback={/* your app's wallet signature callback */}
    />
    {/* ... */}
  );
};
```

### Theme

Accepts a `theme` prop which can be used to customize the widget's appearance.
See [PassportWidgetTheme](./src/widgets/Widget.tsx). Colors are in `R, G, B` format.

## Development

```bash
# Install dependencies
yarn

# Start the development server
yarn dev:mock
```
