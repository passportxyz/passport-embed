import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ScoreWindow } from "./ScoreWindow";
import { PassportShell } from "./PassportShell";
import { ThemePair, SAMPLE_ACCOUNT } from "./storyFrame";

/**
 * ScoreWindow - the home / spine, in every state, composed inside the shell so
 * the overlay rules (nothing outside the shell, ring not clipped, tooltips never
 * clipped) are visible. Both themes, no network.
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
    docs: {
      description: {
        story:
          "A cryptex-spirit loader: hex glyphs settling around the human.tech mark while the arc traces itself. Never a bare spinner.",
      },
    },
  },
};

export const BelowThreshold: Story = {
  name: "Score / Below threshold",
  render: () =>
    inShell(
      <ScoreWindow
        state="below"
        score={17}
        threshold={20}
        addVerificationsCta={{ onClick: () => undefined }}
        linkWalletCta={{ onClick: () => undefined }}
      />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "Below the threshold the ring is amber, not emerald. Hover the score for its state and the tap-to-compute hint. Two configurable CTAs: 'Add verifications' and 'Link wallet to import reputation'.",
      },
    },
  },
};

export const Verified: Story = {
  name: "Score / Verified (reward)",
  render: () => inShell(<ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />),
  parameters: {
    docs: {
      description: {
        story:
          "Crossing the threshold is a reward: the ring completes in emerald and a glow pulses. There is no badge inside the ring. The green check sits inline with 'You're verified' and animates in with the text. Hover the check for 'Score 24. Above the threshold.' A single 'Continue' hand-off CTA.",
      },
    },
  },
};

export const ErrorState: Story = {
  name: "Score / Error",
  render: () => inShell(<ScoreWindow state="error" errorKind="network" onRetry={() => undefined} />),
  parameters: {
    docs: {
      description: {
        story: "Humanized error copy mapped from the failure kind (network here), never a raw error.message, plus a retry CTA.",
      },
    },
  },
};
