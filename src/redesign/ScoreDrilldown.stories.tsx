import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ScoreDrilldown } from "./ScoreDrilldown";
import { PassportShell } from "./PassportShell";
import { ScoreHome } from "./ScoreHome";
import { ThemePair, SAMPLE_ACCOUNT, SAMPLE_STAMPS } from "./storyFrame";

/**
 * ScoreDrilldown - arc LENGTH proportional to contribution, uniform stroke,
 * points ON each arc, names close by, palette derived from the accent hue only.
 * No legend, no header, no "sums to total" caption. Both themes.
 */
const meta: Meta<typeof ScoreDrilldown> = {
  title: "Redesign/Score Drilldown",
  component: ScoreDrilldown,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ScoreDrilldown>;

export const Breakdown: Story = {
  name: "Drilldown / Breakdown",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT}>
        <ScoreDrilldown
          stamps={SAMPLE_STAMPS}
          total={24}
          onBack={() => undefined}
          onSelectStamp={() => undefined}
          onSeeAllStamps={() => undefined}
        />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The single ring resolved into disconnected component arcs, with no header so the breakdown fills the window. Arc length grows with points; stroke-width is uniform; each arc carries its own points with the stamp name just outside. Tapping a segment fires onSelectStamp. A 'See all stamps' CTA sits below.",
      },
    },
  },
};

export const ScoreToDrilldown: Story = {
  name: "Drilldown / Tap the score to open",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT}>
        <ScoreHome
          state="verified"
          score={24}
          threshold={20}
          stamps={SAMPLE_STAMPS}
          onContinue={() => undefined}
          onSelectStamp={() => undefined}
          onSeeAllStamps={() => undefined}
        />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tap the score (ring or the inline verified check) to flip into the drill-down; 'Back to score' returns. Verified state shown; the same tap works below the threshold.",
      },
    },
  },
};
