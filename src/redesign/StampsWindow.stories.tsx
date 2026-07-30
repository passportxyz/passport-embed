import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { StampsWindow } from "./StampsWindow";
import { PassportShell } from "./PassportShell";
import { ThemePair, SAMPLE_ACCOUNT, SAMPLE_MEDALLION_STAMPS, SAMPLE_MEDALLION_STAMPS_PAGED } from "./storyFrame";

/**
 * StampsWindow - stamps as glass medallion plaques, grouped by category and
 * paginated (never scrolled), composed inside the shell so the overlay rules
 * (nothing outside the shell, no scrollbar, badges read as medallions) are
 * visible. Both themes, no network.
 */
const meta: Meta<typeof StampsWindow> = {
  title: "Redesign/Stamps Window",
  component: StampsWindow,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof StampsWindow>;

const inShell = (node: React.ReactNode, size?: "full" | "mini" | "pill") => (
  <ThemePair>
    <PassportShell account={SAMPLE_ACCOUNT} size={size}>
      {node}
    </PassportShell>
  </ThemePair>
);

export const FullGrid: Story = {
  name: "Stamps / Full grid",
  render: () =>
    inShell(
      <StampsWindow
        stamps={SAMPLE_MEDALLION_STAMPS}
        pageSize={6}
        onSelectStamp={() => undefined}
        onVerify={() => undefined}
      />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "The medallion catalog: a mix of verified and unverified stamps, minted and mintable and off-chain. Each stamp is a glass badge with a conic rim, an embossed face, a points chip, and a corner on-chain pip (emerald minted, gold mintable, muted off-chain). Stamps group under tonal category headers. Tapping a badge fires onSelectStamp (the detail drawer is a later slice). A bottom-pinned emerald verify CTA matches the Score window's primary action.",
      },
    },
  },
};

export const Paginated: Story = {
  name: "Stamps / Paginated (two pages)",
  render: () =>
    inShell(
      <StampsWindow
        stamps={SAMPLE_MEDALLION_STAMPS_PAGED}
        onSelectStamp={() => undefined}
        onVerify={() => undefined}
      />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "Ten stamps spill past one page, so the window paginates with dots and arrows. There is no scrollbar (an absolute SOP rule): overflow is split across pages, never scrolled. Each page regroups its own stamps under category headers.",
      },
    },
  },
};

export const Empty: Story = {
  name: "Stamps / Empty",
  render: () => inShell(<StampsWindow stamps={[]} onVerify={() => undefined} />),
  parameters: {
    docs: {
      description: {
        story:
          "No stamps yet. A calm centered prompt with a single verify CTA, so the state is never a dead end. The shell height stays fixed so switching to a populated tab does not jump.",
      },
    },
  },
};

export const Mini: Story = {
  name: "Stamps / Mini",
  render: () =>
    inShell(<StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} onSelectStamp={() => undefined} size="mini" />, "mini"),
  parameters: {
    docs: {
      description: {
        story:
          "The condensed half-size card: smaller medallions, one row per page, category headers dropped to save space. It shares the shell's fixed mini height.",
      },
    },
  },
};

export const Pill: Story = {
  name: "Stamps / Pill",
  render: () =>
    inShell(
      <StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} onVerify={() => undefined} size="pill" />,
      "pill"
    ),
  parameters: {
    docs: {
      description: {
        story:
          "The single-row pill: a compact cluster of mini medallions, a stamp count, and one inline verify action. It summarizes rather than lists, so it never scrolls or paginates.",
      },
    },
  },
};
