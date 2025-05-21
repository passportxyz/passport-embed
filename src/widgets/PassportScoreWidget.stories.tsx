import type { Meta, StoryObj } from "@storybook/react";

import { PassportScoreWidget } from "./PassportScoreWidget";
import { DarkTheme, LightTheme } from "../utils/themes";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "PassportScoreWidget",
  component: PassportScoreWidget,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    apiKey: { control: "text" },
    scorerId: { control: "text" },
    address: { control: "text" },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: { onClick: fn() },
} satisfies Meta<typeof PassportScoreWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Light: Story = {
  args: {
    apiKey: "<Your API Key>",
    scorerId: "<Your Scorer ID>",
    address: "0x...",
    theme: LightTheme,
  },
};

export const Dark: Story = {
  args: {
    apiKey: "TODO",
    scorerId: "TODO",
    address: "TODO",
    theme: DarkTheme,
  },
};

export const Custom: Story = {
  args: {
    apiKey: "TODO",
    scorerId: "TODO",
    address: "TODO",
    theme: {
      colors: {
        primary: "123, 3, 252",
        secondary: "255, 140, 0",
        background: "0, 229, 255",
        success: "0, 255, 26",
        failure: "255, 0, 0",
      },
      padding: {
        widget: {
            x: "20px",
            y: "20px",
        }
    },
    radius: {
        widget: "5px",
        button: "20px"
    },
    transition: {
        speed:  "200"
    },
    font: {
        family: {
            body: "Helvetica, sans-serif",
            heading: "Arial, sans-serif",
            alt: "Courier New, monospace"
        }
    },
    position: {
        overlayZIndex: undefined
    }
    },
  },
};
