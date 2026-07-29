import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Serve the existing dev MSW service worker (and fonts) so scenarios can
  // render fully offline against the shared mock harness.
  staticDirs: ["../dev/public"],
  core: {
    disableTelemetry: true,
  },
  async viteFinal(cfg) {
    // Alias the Human ID SDK to the existing dev mock so the clean-hands /
    // Human-ID flow runs without any external network / wallet.
    return mergeConfig(cfg, {
      resolve: {
        alias: {
          "@holonym-foundation/human-id-sdk": resolve(
            process.cwd(),
            "dev/src/mocks/mockHumanIdSdk.ts"
          ),
        },
      },
    });
  },
};

export default config;
