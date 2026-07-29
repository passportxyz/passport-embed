import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import { handlers } from "../dev/src/mocks/handlers";

// Start the mock service worker for every story. Unhandled requests are
// allowed through so any non-mocked asset (fonts, etc.) still loads.
initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    // Default handler set = the shared dev mock harness. Individual stories
    // can prepend overrides via `parameters.msw.handlers`.
    msw: { handlers },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f4f4f5" },
        { name: "dark", value: "#0b0b0f" },
      ],
    },
  },
  loaders: [mswLoader],
};

export default preview;
