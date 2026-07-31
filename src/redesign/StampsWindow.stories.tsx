import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { StampsWindow } from "./StampsWindow";
import { PassportShell } from "./PassportShell";
import { ThemePair, SAMPLE_ACCOUNT, SAMPLE_MEDALLION_STAMPS } from "./storyFrame";

/**
 * StampsWindow - the real Human Passport catalog as glass medallion plaques,
 * navigated BY CATEGORY (a segmented control of the real Passport categories),
 * paginated within a category and never scrolled. Composed inside the shell so
 * the overlay rules (nothing outside the shell, no scrollbar, real SVG icons,
 * persistent score in the chrome) are visible. Both themes, no network.
 */
const meta: Meta<typeof StampsWindow> = {
  title: "Redesign/Stamps Window",
  component: StampsWindow,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof StampsWindow>;

// The shell carries the persistent compact score (top-left) on every window.
const inShell = (node: React.ReactNode, size?: "full" | "mini" | "pill") => (
  <ThemePair>
    <PassportShell account={SAMPLE_ACCOUNT} size={size} score={24} threshold={20} onScoreClick={() => undefined}>
      {node}
    </PassportShell>
  </ThemePair>
);

export const FullGrid: Story = {
  name: "Stamps / Full grid (category nav)",
  render: () =>
    inShell(
      <StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} onSelectStamp={() => undefined} onVerify={() => undefined} />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "The real catalog, navigated by category. The segmented control at the top carries the three real Passport categories (Physical Verification, Blockchain Networks and Activities, Web2 Platforms & Services), each with a verified/total count; the active category name shows below it. Each stamp is a glass medallion with its real platform icon (currentColor, so it adapts to both themes), a points chip, a corner on-chain pip (emerald minted, gold mintable, muted off-chain), and a compact expiry chip. The persistent compact score sits in the shell chrome, top-left.",
      },
    },
  },
};

export const Paginated: Story = {
  name: "Stamps / Within-category pagination",
  render: () =>
    inShell(
      <StampsWindow
        stamps={SAMPLE_MEDALLION_STAMPS}
        initialCategory="Blockchain Networks and Activities"
        onSelectStamp={() => undefined}
        onVerify={() => undefined}
      />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "The Blockchain category holds twelve stamps, so it spills past one page and paginates with dots and arrows WITHIN the category. There is no scrollbar (an absolute SOP rule): overflow is split across pages, never scrolled. Switching category resets to its first page.",
      },
    },
  },
};

export const Expired: Story = {
  name: "Stamps / Expiring and expired",
  render: () =>
    inShell(
      <StampsWindow
        stamps={SAMPLE_MEDALLION_STAMPS}
        initialCategory="Blockchain Networks and Activities"
        onSelectStamp={() => undefined}
        onVerify={() => undefined}
      />
    ),
  parameters: {
    docs: {
      description: {
        story:
          "Expiry reads on the grid. Each stamp shows a compact expiry chip: neutral days remaining when healthy, amber when expiring soon, and an expired stamp (here the NFT credential) desaturates and reads Expired. Every stamp expires as a whole; the drawer states the full 'Valid for N days' / 'Expires {date}' / 'Expired' copy.",
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
          "The condensed half-size card: smaller medallions with their real icons, one flat paged row, category tabs dropped to save space. It shares the shell's fixed mini height and keeps the persistent score.",
      },
    },
  },
};

export const Pill: Story = {
  name: "Stamps / Pill",
  render: () => inShell(<StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} onVerify={() => undefined} size="pill" />, "pill"),
  parameters: {
    docs: {
      description: {
        story:
          "The single-row pill: a compact cluster of mini medallions, a stamp count, and one inline verify action. It summarizes rather than lists, so it never scrolls or paginates.",
      },
    },
  },
};
