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
  SAMPLE_STAMP_DETAIL_REVOKED,
} from "./storyFrame";

/**
 * StampDetailDrawer - a passport-style slide-in drawer that opens OVER the Stamps
 * window (modeled on app.passport.xyz's stamp drawer). A scrim dims and blurs the
 * grid behind; the drawer slides up as a solid glass sheet with a drag handle.
 * Header: real medallion icon + name + total points (stated once) + on-chain
 * status pill, plus whole-stamp expiry behind the clock tooltip. Then, for
 * multi-component stamps, a Score breakdown accordion (all components reachable,
 * never clipped or scrolled); for SBT / attestation stamps, an Onchain credential
 * accordion. Then one bottom-pinned state-driven action (Mint stamp / Claim /
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
          "The Government ID SBT: verified and minted on chain. The header medallion is STAMPED (an embossed struck-metal plate), and drops its own chip and pip, so points and on-chain state are each stated once (the total points text and the emerald Minted pill). There is no header clock or tooltip: the exact Issued / Expires dates live in the onchain block, so nothing repeats. The minted state resolves to View on chain, with a quiet Renew beside it.",
      },
    },
  },
};

export const OnchainCredential: Story = {
  name: "Stamp detail / Onchain credential (Human ID SBT)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.HumanIdKyc, { onRenew: noop, defaultOnchainOpen: true }),
  parameters: {
    docs: {
      description: {
        story:
          "The Government ID SBT with its Onchain credential accordion expanded. This block is a CANONICAL label:value record (one aligned column, not scattered icons) showing non-PII metadata only: Network led by the real Optimism mark in brand red, Protocol (Onchain SBT), Issued, Expires, and the verified Issuer as a named on-chain identity (human.tech with a check and a view-on-chain link, never raw hex). The stamp state (Minted) is NOT restated here, and a healthy credential is not labelled 'Valid' (the header pill owns the state, the block owns the details, so nothing repeats). All the view actions are grouped in one row as labeled links, and a 'Proven with VOLE-based ZK' tag sits beneath. It never surfaces the nullifier, the user address, or any personal field, and there is no fake token id. It is one section of an accordion group, so it always fits the fixed drawer height without scrolling.",
      },
    },
  },
};

export const MintableReward: Story = {
  name: "Stamp detail / Biometrics (Mint stamp)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.Biometrics),
  parameters: {
    docs: {
      description: {
        story:
          "The Biometrics SBT: verified and mintable on chain. Because it is not minted yet, the header medallion stays FLAT (only a minted stamp is embossed). The status pill is an emerald outline (Mintable, never gold) and the bottom-pinned action is the emerald Mint stamp CTA (minting takes the stamp on chain). One primary action, so nothing competes with it. The header stays clean, with no clock or tooltip.",
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
          "An unverified stamp. The header shows zero points earned so far, and because Coinbase scores from a single credential there is no breakdown accordion to restate that. There is no expiry line (nothing is verified). The action resolves to Claim, so the state is never a dead end.",
      },
    },
  },
};

export const CleanHands: Story = {
  name: "Stamp detail / Proof of Clean Hands (Sign Protocol)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.CleanHands, { defaultOnchainOpen: true }),
  parameters: {
    docs: {
      description: {
        story:
          "Proof of Clean Hands is a SIGN PROTOCOL attestation, not an SBT and not EAS, so the canonical record's Protocol row reads 'Sign Protocol' and its grouped view link reads 'View on Sign Protocol' (scan.sign.global). A privacy-accurate line sits beneath the record: 'Identity encrypted to the Human Network.', and a 'Disclosure conditions' link joins the grouped actions. The attestation data is only a scope actionId with nothing to decode, so there is no observer and no signature shown, and the nullifier and user address are never rendered. The verified Issuer is human.tech, linking to the attester on chain. The action is the emerald Mint stamp.",
      },
    },
  },
};

export const RevokedCredential: Story = {
  name: "Stamp detail / Revoked attestation (Clean Hands)",
  render: () => drawerOver(SAMPLE_STAMP_DETAIL_REVOKED, { defaultOnchainOpen: true }),
  parameters: {
    docs: {
      description: {
        story:
          "A revoked Proof of Clean Hands attestation. Revocation is the ONE real per-user observable state change. The SDK exposes no decryption event, so there is no fake 'Decrypted' state. The status reads Revoked, and a tonal band shows when it was revoked, why, and a link to the revoke transaction (the real revokeTimestamp / revokeReason / revokeTransactionHash fields). The default, non-revoked state stays Valid with the identity encrypted to the Human Network.",
      },
    },
  },
};

export const ComponentBreakdown: Story = {
  name: "Stamp detail / Civic (component accordion)",
  render: () => drawerOver(SAMPLE_STAMP_DETAILS.Civic),
  parameters: {
    docs: {
      description: {
        story:
          "Civic scores across three real sub-credentials (Captcha 0.82, Uniqueness 5.0, Liveness 3.04, summing to 8.86). They live in a Score breakdown accordion that opens by default, so all three rows are reachable and readable at once, none clipped. Each component's points show once on its row; the total (8.86) shows once in the header, so the redundant 'how your points add up = 8.86' caption is gone and the weighted bar carries no number. There is no scrollbar (an absolute SOP rule); if a stamp ever had more than a page of components the accordion paginates. The bottom-pinned action stays fixed.",
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
          "An expired stamp. The header medallion desaturates with a muted outline, and the header state pill reads Expired (no clock, no tooltip). A quiet Renew action sits beside the primary so the lapsed credential can be refreshed.",
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
          "Switch category, then tap any medallion to slide its detail drawer in over the grid. The scrim dims and blurs the grid behind; tap the scrim, the drag handle, the back arrow, or press Escape to close. Each stamp resolves to its own action: minted stamps view on chain, mintable stamps mint, off-chain verified stamps show Verified, and unverified stamps claim.",
      },
    },
  },
};
