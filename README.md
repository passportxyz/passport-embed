# passport-widgets

## Installation

```bash
yarn add passport-widgets
```

## Usage

See [example](./example/src/index.tsx).

```jsx
import React from 'react';
import { PassportScoreWidget } from 'passport-widgets';

const App = () => {
  return (
    {/* ... */}
    <PassportScoreWidget
      apiKey="API_KEY"
      address="0x..."
      scorerId="5"
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
cd example
yarn

# Start the development server
yarn dev
```
