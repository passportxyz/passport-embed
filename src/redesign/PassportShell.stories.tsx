import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PassportShell } from "./PassportShell";
import { ScoreWindow } from "./ScoreWindow";
import { ThemePair, SAMPLE_ACCOUNT } from "./storyFrame";

/**
 * PassportShell — the chrome binding: app-icon slot · account selector · ⓘ ·
 * "Secured by human.tech" footer, all INSIDE the rounded bounds. Rendered in
 * both themes on matching host backgrounds.
 */
const meta: Meta<typeof PassportShell> = {
  title: "Redesign/Shell",
  component: PassportShell,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof PassportShell>;

export const Default: Story = {
  name: "Shell / Default (dropdown closed)",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT}>
        <ScoreWindow state="below" score={17} threshold={20} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "App-icon slot (placeholder cube), the 'Shady.eth's Passport ▾' account selector, the ⓘ help affordance, and the footer — every element inside the rounded shell. Hover the app-icon / ⓘ for portal tooltips (edge-aware, never clipped).",
      },
    },
  },
};

export const DropdownOpen: Story = {
  name: "Shell / Account dropdown open",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT} defaultAccountMenuOpen>
        <ScoreWindow state="verified" score={24} threshold={20} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The account dropdown: LEFT-aligned to its trigger, near-opaque surface (you cannot read the content behind it), top z-index, and contained within the shell width. ENS ↔ wallet identities with kind badges.",
      },
    },
  },
};

export const NoAccount: Story = {
  name: "Shell / Without account selector",
  render: () => (
    <ThemePair>
      <PassportShell>
        <ScoreWindow state="below" score={12} threshold={20} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "Integrator supplies no account identity — the selector collapses and the chrome stays balanced (app-icon + ⓘ).",
      },
    },
  },
};
