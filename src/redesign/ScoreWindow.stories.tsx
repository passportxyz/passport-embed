import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ScoreWindow } from "./ScoreWindow";
import { PassportShell } from "./PassportShell";
import { ThemePair, SAMPLE_ACCOUNT } from "./storyFrame";

/**
 * ScoreWindow — the home / spine, in every state, composed inside the shell so
 * the overlay rules (nothing outside the shell, ring not clipped, exponent
 * tooltip never clipped) are visible. Both themes, no network.
 */
const meta: Meta<typeof ScoreWindow> = {
  title: "Redesign/Score Window",
  component: ScoreWindow,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ScoreWindow>;

const inShell = (node: React.ReactNode) => (
  <ThemePair>
    <PassportShell account={SAMPLE_ACCOUNT}>{node}</PassportShell>
  </ThemePair>
);

export const Loading: Story = {
  name: "Score / Loading",
  render: () => inShell(<ScoreWindow state="loading" />),
  parameters: {
    docs: { description: { story: "Crafted on-brand loader (a token-driven ring tracing itself around the human.tech mark) — never a bare spinner." } },
  },
};

export const BelowThreshold: Story = {
  name: "Score / Below threshold",
  render: () => inShell(<ScoreWindow state="below" score={17} threshold={20} />),
  parameters: {
    docs: {
      description: {
        story:
          "Ring encourages toward the threshold; the ?-exponent superscript rides the digit (hover: '3 to go to reach the threshold · tap to see how it's computed'). A 'to go' progress framing + 'Add verifications' CTA.",
      },
    },
  },
};

export const Verified: Story = {
  name: "Score / Verified (reward)",
  render: () => inShell(<ScoreWindow state="verified" score={24} threshold={20} />),
  parameters: {
    docs: {
      description: {
        story:
          "Crossing the threshold is a reward: ring completes, a glow pulses, a shimmer sweeps and a verified seal pops. The ✓-exponent (hover: 'verified · above the threshold · tap to see how it's computed') and a 'Continue' hand-off CTA.",
      },
    },
  },
};

export const ErrorState: Story = {
  name: "Score / Error",
  render: () =>
    inShell(
      <ScoreWindow
        state="error"
        errorMessage="We couldn't reach your score right now. Please try again."
        onRetry={() => undefined}
      />
    ),
  parameters: {
    docs: { description: { story: "Humanized error (never a raw error.message) + a retry CTA (props-driven)." } },
  },
};
