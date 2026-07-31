import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { StampDetailDrawer } from "./StampDetailDrawer";
import { StampsWindow } from "./StampsWindow";
import { PassportShell } from "./PassportShell";
import {
  ThemePair,
  SAMPLE_ACCOUNT,
  SAMPLE_MEDALLION_STAMPS,
  SAMPLE_STAMP_DETAILS,
} from "./storyFrame";

/**
 * StampDetailDrawer - a passport-style slide-in drawer that opens OVER the Stamps
 * window (modeled on app.passport.xyz's stamp drawer). A scrim dims and blurs the
 * grid behind; the drawer slides up as a solid glass sheet with a drag handle.
 * Header: medallion + name + total points + on-chain status pill. Then the
 * sub-credential rows (each with its own points + verified / expiry + icon),
 * paginated never scrolled. Then how the score is computed (the weighted
 * components summing to the total). Then one bottom-pinned state-driven action
 * (Mint / Claim / View on chain / Verified). Both themes, no network, everything
 * inside the shell.
 */
const meta: Meta<typeof StampDetailDrawer> = {
  title: "Redesign/Stamp Detail",
  component: StampDetailDrawer,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof StampDetailDrawer>;

// The stage fills the shell content region and positions the drawer overlay, so
// the drawer slides in over the Stamps window and stays inside the shell bounds.
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "relative",
      flex: "1 1 auto",
      minHeight: 0,
      width: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {children}
  </div>
);

const noop = () => undefined;

/** Compose a static Stamps window behind an open drawer, in both themes. */
const drawerOver = (
  detail: (typeof SAMPLE_STAMP_DETAILS)[string],
  props: Partial<React.ComponentProps<typeof StampDetailDrawer>> = {}
) => (
  <ThemePair>
    <PassportShell account={SAMPLE_ACCOUNT}>
      <Stage>
        <StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} pageSize={6} onSelectStamp={noop} onVerify={noop} />
        <StampDetailDrawer
          stamp={detail}
          onClose={noop}
          onMint={noop}
          onClaim={noop}
          onViewOnchain={noop}
          {...props}
        />
      </Stage>
    </PassportShell>
  </ThemePair>
);

export const VerifiedMinted: Story = {
  name: "Stamp detail / Verified and minted",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS["gov-id"], { onRenew: noop }),
  parameters: {
    docs: {
      description: {
        story:
          "A verified, minted stamp. The header medallion drops its own chip and pip, so the points and the on-chain state are each stated once (the total points text and the emerald Minted pill). Three verified components list with their points and renewal, and the weighted bar shows them summing to the total. The minted state resolves to a View on chain action, with a quiet Renew beneath it since a component renews.",
      },
    },
  },
};

export const MintableReward: Story = {
  name: "Stamp detail / Mintable (Mint reward)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS["biometric"]),
  parameters: {
    docs: {
      description: {
        story:
          "A verified stamp that can be minted on chain. The status pill is gold (Mintable) and the bottom-pinned action is the gold Mint reward CTA. One primary action, so no secondary competes with the reward.",
      },
    },
  },
};

export const Unverified: Story = {
  name: "Stamp detail / Unverified (Claim)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS["phone"]),
  parameters: {
    docs: {
      description: {
        story:
          "An unverified stamp. Its components read as not verified yet, the header shows zero points earned so far, and the how-it-computes bar is omitted because nothing is earned. The action resolves to Claim, so the state is never a dead end.",
      },
    },
  },
};

export const CleanHands: Story = {
  name: "Stamp detail / Clean Hands SBT",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS["clean-hands"]),
  parameters: {
    docs: {
      description: {
        story:
          "The Proof of Clean Hands SBT (journeys 2 and 5). A verified, mintable credential proving a wallet is clear of sanctions and watchlists. The plain description avoids crypto jargon, and the action is the gold Mint reward so the user can put the SBT on chain.",
      },
    },
  },
};

export const PaginatedComponents: Story = {
  name: "Stamp detail / Paginated components",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS["reputation"]),
  parameters: {
    docs: {
      description: {
        story:
          "Six components spill past one page, so the list paginates with dots and arrows. There is no scrollbar (an absolute SOP rule). The how-it-computes bar and the bottom-pinned action stay fixed while the component rows page, since the total is the same whichever page is shown.",
      },
    },
  },
};

// ---- interactive: tap a medallion in the Stamps window to open its drawer ----
const InteractiveStage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const detail = openId ? SAMPLE_STAMP_DETAILS[openId] : undefined;
  return (
    <Stage>
      <StampsWindow
        stamps={SAMPLE_MEDALLION_STAMPS}
        pageSize={6}
        onSelectStamp={setOpenId}
        onVerify={noop}
      />
      {detail ? (
        <StampDetailDrawer
          stamp={detail}
          onClose={() => setOpenId(null)}
          onMint={noop}
          onClaim={noop}
          onViewOnchain={noop}
          onRenew={noop}
        />
      ) : null}
    </Stage>
  );
};

export const Interactive: Story = {
  name: "Stamp detail / Interactive (tap a medallion)",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT}>
        <InteractiveStage />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tap any medallion in the Stamps window to slide its detail drawer in over the grid. The scrim dims and blurs the grid behind; tap the scrim, the drag handle, the back arrow, or press Escape to close. Each stamp resolves to its own action: minted stamps view on chain, mintable stamps mint the reward, off-chain verified stamps show Verified, and unverified stamps claim.",
      },
    },
  },
};
