import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { WalletLinking } from "./WalletLinking";
import type { LinkWalletInfo, WalletLinkStep, WalletLinkingProps } from "./WalletLinking";
import { PassportShell } from "./PassportShell";
import { ScoreWindow } from "./ScoreWindow";
import { ThemePair, SAMPLE_ACCOUNT } from "./storyFrame";

/**
 * WalletLinking - the wallet-linking flow as an in-shell overlay. It takes over
 * the fixed shell content region with a back / close affordance (StampDetailDrawer
 * pattern), so every step fits the shell height and the 360x600 wallet iframe with
 * no clip or scroll. Reproduces the HTDS design in the redesign token system (not
 * vendored). One story per state, full + mini, both themes.
 *
 * State machine (single SIWE signature, silk#895):
 *   picker -> connecting -> sign -> pending -> success | error409 | errorGeneric
 *   unlink: confirm -> (cooldown) -> relinkBlocked
 *
 * The real connect / sign happen via callback props; the stories mock them.
 * Cooldown / pending / relink are spec-only (backend not built) and are clearly
 * mocked here.
 */
const meta: Meta<typeof WalletLinking> = {
  title: "Redesign/Wallet Linking",
  component: WalletLinking,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof WalletLinking>;

const noop = () => undefined;

/** Demo wallet data (reuses the SAMPLE_ACCOUNT addresses from storyFrame). */
const DEMO_WALLET: LinkWalletInfo = {
  address: "0x1332f4c1b9a70d5e2c8a4f6e11c9b3d0aa7e4a9f",
  display: "0x1332…a9f",
  ecosystem: "ethereum",
};
const CONFLICT_WALLET: LinkWalletInfo = {
  address: "0x77aa20c3e9b1d4f60825ab19c7d3e5f0126b8c11",
  display: "0x77aa…c11",
  ecosystem: "ethereum",
};

/** The stage fills the shell content region and positions the linking overlay so
 *  it takes over inside the shell bounds (never escaping the fixed height). */
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

/** One shell at a given size with a Score window behind the linking overlay. */
const flowAt = (size: "full" | "mini", props: Partial<WalletLinkingProps>) => (
  <PassportShell account={SAMPLE_ACCOUNT} size={size} score={24} threshold={20} onScoreClick={noop}>
    <Stage>
      <ScoreWindow size={size} state="verified" score={24} threshold={20} onContinue={noop} />
      <WalletLinking
        size={size}
        wallet={DEMO_WALLET}
        conflictWallet={CONFLICT_WALLET}
        onClose={noop}
        onDone={noop}
        onConfirmUnlink={noop}
        {...props}
      />
    </Stage>
  </PassportShell>
);

const SizeLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontFamily: "ui-monospace, monospace",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "rgba(128,128,128,0.9)",
    }}
  >
    {children}
  </span>
);

/** Full + mini, each in both themes (the §9 fit matrix per state). */
const Both: React.FC<{ props: Partial<WalletLinkingProps> }> = ({ props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SizeLabel>full</SizeLabel>
    <ThemePair>{flowAt("full", props)}</ThemePair>
    <SizeLabel>mini</SizeLabel>
    <ThemePair>{flowAt("mini", props)}</ThemePair>
  </div>
);

const state = (step: WalletLinkStep, extra: Partial<WalletLinkingProps> = {}): Story => ({
  render: () => <Both props={{ step, ...extra }} />,
});

/* ── One story per state ── */

export const Picker: Story = {
  ...state("picker", { detectedWalletLabel: "MetaMask" }),
  name: "1. Picker (Link a wallet)",
  parameters: {
    docs: {
      description: {
        story:
          "Flow entry. Rows in HTDS order: Another WaaP wallet, Browser wallet (auto-detected, here MetaMask), WalletConnect, Sui, then Solana last (Soon, disabled). Each row is a tinted icon + title + subtitle + chevron. In mini the subtitles drop so all five rows fit without scroll.",
      },
    },
  },
};

export const Connecting: Story = {
  ...state("connecting"),
  name: "2. Connecting",
  parameters: {
    docs: { description: { story: "After a pick: waiting for the chosen wallet to connect, with the reused indeterminate arc loader." } },
  },
};

export const Sign: Story = {
  ...state("sign"),
  name: "3. Sign (single SIWE)",
  parameters: {
    docs: {
      description: {
        story:
          "The single signature step. The WaaP side is already the authenticated session, so only the connecting wallet signs (no '1 of 2' language). The wallet chip names which wallet is signing.",
      },
    },
  },
};

export const Pending: Story = {
  ...state("pending"),
  name: "4. Pending (verifying)",
  parameters: { docs: { description: { story: "Signature collected; the backend verifies it. Spec-only timing (mocked)." } } },
};

export const Success: Story = {
  ...state("success", {
    scoreContribution: "+1.4",
    gains: [
      { id: "stamps", label: "5 stamps" },
      { id: "points", label: "250 Human Points" },
      { id: "cred", label: "Clean Hands credential" },
    ],
  }),
  name: "5. Success (Wallet linked)",
  parameters: {
    docs: {
      description: {
        story:
          "Success: a link graphic (wallet to your WaaP account), an 'Added to your account' gains list, and the Passport-branded Unique Humanity Score contribution in emerald, then a confirmation check and Done. Mini condenses to the graphic, gains, score, and Done.",
      },
    },
  },
};

export const Error409: Story = {
  ...state("error409"),
  name: "6. Error 409 (already linked)",
  parameters: {
    docs: {
      description: {
        story:
          "The wallet is already linked to another account. The conflicting wallet is shown as a chip, with a 'Try a different wallet' action back to the picker.",
      },
    },
  },
};

export const ErrorGeneric: Story = {
  ...state("errorGeneric"),
  name: "7. Error generic (linking failed)",
  parameters: {
    docs: { description: { story: "A generic failure (network or rejected signature). No changes were made. Try again or Cancel." } },
  },
};

export const UnlinkConfirm: Story = {
  ...state("unlinkConfirm"),
  name: "8. Unlink confirm",
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the embed's immediate unlink. The wallet chip plus three consequence bullets, then the danger 'Start 30 day unlink' and Cancel. The 30 day cooldown is spec-only (backend not built).",
      },
    },
  },
};

export const RelinkBlocked: Story = {
  ...state("relinkBlocked", { cooldownDaysRemaining: 22 }),
  name: "9. Relink blocked (cooldown)",
  parameters: {
    docs: {
      description: {
        story:
          "Relinking is blocked while the wallet's 30 day unlink cooldown is active, showing the days remaining. Spec-only: the backend cooldown is not built yet (mocked here).",
      },
    },
  },
};

/* ── Interactive: reachable from the AccountMenu ── */

const InteractiveDemo: React.FC<{ size: "full" | "mini" }> = ({ size }) => {
  const [mode, setMode] = useState<"idle" | "link" | "unlink">("idle");

  // A mocked wallet connect / sign: brief delays drive the real state machine
  // (picker -> connecting -> sign -> pending -> success).
  const connect = () => new Promise<void>((r) => setTimeout(r, 900));
  const sign = () => new Promise<void>((r) => setTimeout(r, 900));

  if (mode === "idle") {
    // The AccountMenu's "Link additional wallet" opens the flow; a wallet row's
    // unlink opens the Unlink-confirm (replacing the immediate unlink).
    return (
      <PassportShell
        key="idle"
        account={SAMPLE_ACCOUNT}
        size={size}
        defaultAccountMenuOpen
        onLinkWallet={() => setMode("link")}
        onUnlinkWallet={() => setMode("unlink")}
      >
        <ScoreWindow size={size} state="verified" score={24} threshold={20} onContinue={noop} />
      </PassportShell>
    );
  }

  // Distinct key: remount so the account menu's open state resets (an integrator
  // closes the menu on link; here the fresh mount does the same).
  return (
    <PassportShell key="flow" account={SAMPLE_ACCOUNT} size={size} score={24} threshold={20} onScoreClick={noop}>
      <Stage>
        <ScoreWindow size={size} state="verified" score={24} threshold={20} onContinue={noop} />
        <WalletLinking
          size={size}
          initialStep={mode === "unlink" ? "unlinkConfirm" : "picker"}
          wallet={DEMO_WALLET}
          conflictWallet={CONFLICT_WALLET}
          scoreContribution="+1.4"
          detectedWalletLabel="MetaMask"
          connect={connect}
          sign={sign}
          onClose={() => setMode("idle")}
          onDone={() => setMode("idle")}
          onConfirmUnlink={() => setMode("idle")}
        />
      </Stage>
    </PassportShell>
  );
};

export const Interactive: Story = {
  name: "Interactive (from the account menu)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SizeLabel>full</SizeLabel>
      <ThemePair>
        <InteractiveDemo size="full" />
      </ThemePair>
      <SizeLabel>mini</SizeLabel>
      <ThemePair>
        <InteractiveDemo size="mini" />
      </ThemePair>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Open the account menu, then 'Link additional wallet' launches the flow: pick a wallet type and the mocked connect / sign / verify runs through to success. A wallet row's unlink opens the Unlink-confirm instead of unlinking immediately. Back returns to the picker mid-flow, or exits from the picker.",
      },
    },
  },
};
