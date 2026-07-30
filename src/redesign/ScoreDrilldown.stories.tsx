import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ScoreDrilldown } from "./ScoreDrilldown";
import { PassportShell } from "./PassportShell";
import { ScoreHome } from "./ScoreHome";
import { ThemePair, SAMPLE_ACCOUNT, SAMPLE_STAMPS } from "./storyFrame";

/**
 * ScoreDrilldown — arc LENGTH ∝ contribution, uniform stroke, points ON each
 * arc, names close by, palette derived from the accent hue only. No legend, no
 * "sums to total" caption. Both themes.
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
        <ScoreDrilldown stamps={SAMPLE_STAMPS} total={24} onBack={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The single ring resolved into disconnected component arcs. Arc length grows with points; stroke-width is uniform on every arc; each arc carries its own points, with the stamp name just outside. Arc tints are stepped off the theme's accent hue in code — no rainbow, no legend.",
      },
    },
  },
};

export const ExponentToggle: Story = {
  name: "Drilldown / Exponent toggle (Score ↔ Drilldown)",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT}>
        <ScoreHome state="verified" score={24} threshold={20} stamps={SAMPLE_STAMPS} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tap the ✓/?-exponent on the Score window to flip into the drill-down; 'Back to score' returns. Verified state shown; the same toggle works below-threshold.",
      },
    },
  },
};
