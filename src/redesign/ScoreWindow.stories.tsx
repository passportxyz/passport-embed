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
          "The real shared Cryptex loader (@holonym-foundation/ui, vendored under redesign/vendor/cryptex until the package is installable): a cipher of hex and brand marks orbiting the Human Passport mark, resolving as the score settles. Never a bare spinner.",
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
        linkIdentityCta={{ onClick: () => undefined }}
      />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "Below the threshold the ring is amber, not emerald. Hover the score for its state and the tap-to-compute hint. Two configurable CTAs share one box metric (both full width, identical height and padding): the emerald 'Add verifications' primary and the tonal 'Link an identity' secondary, the latter with a chain-link icon. Both sit in the bottom-pinned action area so the primary CTA lands at the same y as the verified Continue.",
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
