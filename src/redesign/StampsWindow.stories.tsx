import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { StampsWindow, type Stamp } from "./StampsWindow";
import { PassportShell } from "./PassportShell";
import { ThemePair, SAMPLE_ACCOUNT, SAMPLE_MEDALLION_STAMPS } from "./storyFrame";
import { daysFromNow } from "./expiry";

// One stamp of each state, all in a single category so they land on one page: a
// side-by-side read of minted / mintable / unminted / expiring / expired /
// unverified. Fill = verified (lit vs ghost); the corner link-chip = on chain;
// the thin amber arc + "Nd" = expiring; grey + "Expired" = lapsed. Everything is
// emerald except the expiring arc / day count, and every corner mark sits in the
// one top-right slot.
const pick = (id: string, patch: Partial<Stamp> = {}): Stamp => ({
  ...SAMPLE_MEDALLION_STAMPS.find((s) => s.id === id)!,
  category: "Stamp states",
  ...patch,
});
const STATE_STAMPS: Stamp[] = [
  pick("HumanIdKyc"), // minted (emerald glow + chain pip + stamped/embossed)
  pick("Biometrics"), // mintable (emerald outline invite)
  pick("Binance"), // unminted: verified, off-chain, flat
  pick("Civic"), // expiring soon (small amber dot)
  pick("NFT"), // expired (desaturated, muted)
  pick("Coinbase"), // unverified (recessive)
];

// Distinct data per story so each DEMONSTRATES its case (they used to share one
// dataset and look identical). The Expiring / expired set is verified stamps in
// one category with soon / lapsed dates, so the amber arcs, the "Expired" state,
// and the Expired filter are the whole point; the Pagination story keeps the full
// twelve-stamp Blockchain category so it genuinely spills to a second page.
const reDate = (id: string, days: number): Stamp =>
  pick(id, { category: "Blockchain Networks and Activities", verified: true, onchain: "none", expirationDate: daysFromNow(days) });
const EXPIRING_EXPIRED_STAMPS: Stamp[] = [
  reDate("ETH", 3), // expiring in 3 days (amber arc, nearly drained)
  reDate("Ens", 8), // expiring in 8 days
  reDate("Google", 12), // expiring in 12 days
  reDate("Binance", -4), // expired 4 days ago
  reDate("NFT", -11), // expired 11 days ago
  reDate("Github", -30), // expired 30 days ago
];

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
          "The real catalog, navigated by category. The segmented control at the top carries the three real Passport categories as labeled ICON tabs (Physical, Blockchain, Web), each icon shown with its short name beneath so it needs no hover tooltip. When a category has stamps to isolate, a subtle 'All / Verified / Pending / Expired' filter takes the right of that bar (one tap to narrow the grid); otherwise a plain overall summary sits there. There is no ambiguous star. Each medallion is pared to icon + name + points, and its state is carried by the medallion itself: a ghosted outline when available, a flat lit emerald glass when verified off-chain, an emerald outline when mintable, and a STAMPED (embossed) emerald plate with a corner chain-link chip when minted on chain. There are no per-medallion tooltips; a stamp's full status and description are one tap away in the detail drawer. The persistent compact score sits in the shell chrome, top-left.",
      },
    },
  },
};

export const States: Story = {
  name: "Stamps / State system",
  render: () => inShell(<StampsWindow stamps={STATE_STAMPS} onSelectStamp={() => undefined} onVerify={() => undefined} />),
  parameters: {
    docs: {
      description: {
        story:
          "One medallion of each state, side by side, in both themes. Fill = verified: a verified medallion lights up (emerald tint, full-strength icon) while an available one is a ghosted outline with a muted icon, so scanning the grid reads have vs do not have. Minted vs unminted is now obvious: only the minted stamp (Government ID) is STAMPED, an embossed struck-metal plate with a clean sheen sweep on load, while every unminted / pending medallion stays FLAT. The top-right corner is the single on-chain slot: the minted stamp carries a solid emerald link-chip, an off-chain stamp (Binance) carries nothing. Validity shows only when it matters: an expiring stamp (Civic, nine days) draws a thin amber arc on the rim whose length is the days left, plus a small '9d' in the corner, and an expired stamp (NFT) desaturates to grey with a small 'Expired'. Mintable (Biometrics) is an emerald outline invite, never gold. Everything but the expiring arc and day count is emerald, and every corner mark sits in the one top-right slot.",
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
    inShell(<StampsWindow stamps={EXPIRING_EXPIRED_STAMPS} onSelectStamp={() => undefined} onVerify={() => undefined} />),
  parameters: {
    docs: {
      description: {
        story:
          "A set built to show validity states: three stamps expiring soon (in 3, 8, and 12 days) and three already expired. A stamp expiring soon draws a thin amber arc on the medallion rim (its length is the days left) plus a small 'Nd' day count in the corner, the only amber on the medallion. An expired stamp desaturates to grey with a small 'Expired'. The full validity copy reads in the drawer header state pill (Expiring in Nd / Expired), and SBT stamps carry the exact Expires date in the onchain block. Use the Expired filter to isolate the lapsed stamps in one tap.",
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
          "The condensed half-size card: smaller medallions with their real icons in two short rows of three, filling the space the single row used to leave empty (design-sop fill-space). Category tabs are dropped to save width; the verification filter rides on the header row when it earns its space. It shares the shell's fixed mini height and keeps the persistent score.",
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
