import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { StampDetailDrawer } from "./StampDetailDrawer";
import { StampsWindow } from "./StampsWindow";
import { PassportShell } from "./PassportShell";
import { ThemePair, SAMPLE_ACCOUNT, SAMPLE_MEDALLION_STAMPS, SAMPLE_STAMP_DETAILS } from "./storyFrame";

/**
 * StampDetailDrawer - a passport-style slide-in drawer that opens OVER the Stamps
 * window (modeled on app.passport.xyz's stamp drawer). A scrim dims and blurs the
 * grid behind; the drawer slides up as a solid glass sheet with a drag handle.
 * Header: real medallion icon + name + total points + on-chain status pill, plus
 * whole-stamp expiry ("Valid for N days" / "Expires {date}" / "Expired"). Then the
 * real sub-credential rows, paginated never scrolled. Then how the score is
 * computed. Then one bottom-pinned state-driven action (Notarize stamp / Claim /
 * View on chain / Verified). Both themes, no network, everything inside the shell.
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

/** Compose a static Stamps window behind an open drawer, in both themes. The shell
 *  carries the persistent compact score so it shows on the detail view too. */
const drawerOver = (
  detail: (typeof SAMPLE_STAMP_DETAILS)[string],
  props: Partial<React.ComponentProps<typeof StampDetailDrawer>> = {}
) => (
  <ThemePair>
    <PassportShell account={SAMPLE_ACCOUNT} score={24} threshold={20} onScoreClick={noop}>
      <Stage>
        <StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} onSelectStamp={noop} onVerify={noop} />
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
  name: "Stamp detail / Government ID (verified and minted)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.HumanIdKyc, { onRenew: noop }),
  parameters: {
    docs: {
      description: {
        story:
          "The Government ID SBT: verified and minted on chain. The header medallion drops its own chip and pip, so points and on-chain state are each stated once (the total points text and the emerald Minted pill). The whole-stamp expiry line reads 'Valid for N days', and because this is a Human ID SBT it adds the auto-renew note. The minted state resolves to View on chain, with a quiet Renew beneath it.",
      },
    },
  },
};

export const MintableReward: Story = {
  name: "Stamp detail / Biometrics (Notarize stamp)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.Biometrics),
  parameters: {
    docs: {
      description: {
        story:
          "The Biometrics SBT: verified and mintable on chain. The status pill is gold (Mintable) and the bottom-pinned action is the gold Notarize stamp CTA (notarizing takes the stamp on chain). One primary action, so nothing competes with it. The Human ID auto-renew note rides beside the expiry line.",
      },
    },
  },
};

export const Unverified: Story = {
  name: "Stamp detail / Coinbase (unverified, Claim)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.Coinbase),
  parameters: {
    docs: {
      description: {
        story:
          "An unverified stamp. Its component reads as not verified yet, the header shows zero points earned so far, and the how-it-computes bar is omitted because nothing is earned. There is no expiry line (nothing is verified). The action resolves to Claim, so the state is never a dead end.",
      },
    },
  },
};

export const CleanHands: Story = {
  name: "Stamp detail / Proof of Clean Hands SBT",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.CleanHands),
  parameters: {
    docs: {
      description: {
        story:
          "The Proof of Clean Hands SBT. A verified, mintable credential awarded after identity verification and sanctions validation. The plain description avoids crypto jargon, the expiry line carries the Human ID auto-renew note, and the action is the gold Notarize stamp so the user can put the SBT on chain.",
      },
    },
  },
};

export const PaginatedComponents: Story = {
  name: "Stamp detail / Civic (paginated components)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.Civic),
  parameters: {
    docs: {
      description: {
        story:
          "Civic scores across three real sub-credentials (Captcha 0.82, Uniqueness 5.0, Liveness 3.04, summing to 8.86), so the list paginates with dots and arrows. There is no scrollbar (an absolute SOP rule). The how-it-computes bar and the bottom-pinned action stay fixed while the component rows page.",
      },
    },
  },
};

export const ExpiredStamp: Story = {
  name: "Stamp detail / NFT (expired)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.NFT, { onRenew: noop }),
  parameters: {
    docs: {
      description: {
        story:
          "An expired stamp. The header medallion desaturates and the expiry line reads Expired in warn color. A quiet Renew action sits beside the primary so the lapsed credential can be refreshed.",
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
      <StampsWindow stamps={SAMPLE_MEDALLION_STAMPS} onSelectStamp={setOpenId} onVerify={noop} />
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
      <PassportShell account={SAMPLE_ACCOUNT} score={24} threshold={20} onScoreClick={noop}>
        <InteractiveStage />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Switch category, then tap any medallion to slide its detail drawer in over the grid. The scrim dims and blurs the grid behind; tap the scrim, the drag handle, the back arrow, or press Escape to close. Each stamp resolves to its own action: minted stamps view on chain, mintable stamps notarize, off-chain verified stamps show Verified, and unverified stamps claim.",
      },
    },
  },
};
