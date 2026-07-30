import React from "react";
import { Widget, PassportWidgetTheme } from "../widgets/Widget";
import { DarkTheme, LightTheme } from "../utils/themes";

/**
 * Story-only harness. Renders the redesign components inside the REAL widget
 * root (`Widget`) so the §1 token scope (--surface, --accent, --space-*, …) and
 * the 300px sizing resolve exactly as they do in a host app - then places that
 * widget on a light / dark HOST background to prove the "guest on any surface"
 * rule (SOP §2 / §7). No network: Widget provides its own providers.
 */

const hostBg: Record<"light" | "dark", string> = {
  light: "#eef0f4",
  dark: "#0b0b10",
};

const Frame: React.FC<{ theme: PassportWidgetTheme; label: string; bg: "light" | "dark"; children: React.ReactNode }> = ({
  theme,
  label,
  bg,
  children,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <span
      style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: bg === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
      }}
    >
      {label}
    </span>
    <div style={{ padding: 24, borderRadius: 20, background: hostBg[bg] }}>
      <Widget theme={theme}>{children}</Widget>
    </div>
  </div>
);

/** Render the same content in both themes, side by side, each on a matching host background. */
export const ThemePair: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
    <Frame theme={LightTheme} label="Light theme · light host" bg="light">
      {children}
    </Frame>
    <Frame theme={DarkTheme} label="Dark theme · dark host" bg="dark">
      {children}
    </Frame>
  </div>
);

export const SAMPLE_ACCOUNT = {
  display: "Shady.eth",
  kind: "ENS",
  email: "shady@holonym.id",
  address: "0x1332…4a9f",
  linkedWallets: [
    // `address` carries the FULL value for the hover-to-copy control, while
    // `display` stays truncated. Copying yields the complete address.
    { display: "0x1332…4a9f", kind: "Wallet", address: "0x1332f4c1b9a70d5e2c8a4f6e11c9b3d0aa7e4a9f" },
    { display: "vault.eth", kind: "ENS", address: "0x77aa20c3e9b1d4f60825ab19c7d3e5f0126b8c11" },
  ],
  accounts: [
    { display: "Shady.eth", kind: "ENS" },
    { display: "0x1332…4a9f", kind: "Wallet" },
  ],
};

const BASE = { display: "Shady.eth", kind: "ENS", email: "shady@holonym.id", address: "0x1332…4a9f" };

/** One linked wallet. */
export const ACCOUNT_ONE_WALLET = {
  ...BASE,
  linkedWallets: [{ display: "0x1332…4a9f", kind: "Wallet" }],
};

/** Exactly three linked wallets (fills a page, no pager yet). */
export const ACCOUNT_THREE_WALLETS = {
  ...BASE,
  linkedWallets: [
    { display: "0x1332…4a9f", kind: "Wallet" },
    { display: "vault.eth", kind: "ENS" },
    { display: "0x88b1…02aa", kind: "Wallet" },
  ],
};

/** Six linked wallets: paginates into two pages of three (dots + arrows). */
export const ACCOUNT_SIX_WALLETS = {
  ...BASE,
  linkedWallets: [
    { display: "0x1332…4a9f", kind: "Wallet" },
    { display: "vault.eth", kind: "ENS" },
    { display: "0x88b1…02aa", kind: "Wallet" },
    { display: "treasury.eth", kind: "ENS" },
    { display: "0x4c9d…7f10", kind: "Safe" },
    { display: "0xab20…6d33", kind: "Wallet" },
  ],
};

/** A mix including a wallet in cooldown and one still pending. */
export const ACCOUNT_COOLDOWN = {
  ...BASE,
  linkedWallets: [
    { display: "0x1332…4a9f", kind: "Wallet", status: "active" as const },
    { display: "vault.eth", status: "cooldown" as const, cooldownUntil: "Cooldown until Aug 3" },
    { display: "0x88b1…02aa", status: "pending" as const, cooldownUntil: "Linking in progress" },
  ],
};

export const SAMPLE_STAMPS = [
  { id: "gov-id", label: "Government ID", points: 6 },
  { id: "biometric", label: "Biometric", points: 5 },
  { id: "clean-hands", label: "Clean Hands", points: 5 },
  { id: "social", label: "Social", points: 5 },
  { id: "onchain", label: "On-chain", points: 3 },
];

// Medallion-stamp sample data for the Stamps window. A mix of verified /
// unverified and minted / mintable / off-chain so every face state is visible.
// Two categories (three each) so it reads as a full grid on one page. Icons are
// plain emoji (valid ReactNode) so the stories need no asset pipeline.
export const SAMPLE_MEDALLION_STAMPS = [
  { id: "gov-id", name: "Government ID", category: "Identity", points: 6, verified: true, onchain: "minted" as const, icon: "🪪" },
  { id: "clean-hands", name: "Clean Hands", category: "Identity", points: 5, verified: true, onchain: "mintable" as const, icon: "🤝" },
  { id: "phone", name: "Phone", category: "Identity", points: 2, verified: false, onchain: "none" as const, icon: "📱" },
  { id: "github", name: "GitHub", category: "Social", points: 3, verified: true, onchain: "none" as const, icon: "🐙" },
  { id: "discord", name: "Discord", category: "Social", points: 1, verified: false, onchain: "none" as const, icon: "💬" },
  { id: "x-social", name: "X", category: "Social", points: 1, verified: false, onchain: "none" as const, icon: "✖️" },
];

// A larger catalog that spills past one page (>6), so pagination shows two pages
// with dots + arrows and the "never scrolled" rule is visible.
export const SAMPLE_MEDALLION_STAMPS_PAGED = [
  { id: "gov-id", name: "Government ID", category: "Identity", points: 6, verified: true, onchain: "minted" as const, icon: "🪪" },
  { id: "clean-hands", name: "Clean Hands", category: "Identity", points: 5, verified: true, onchain: "mintable" as const, icon: "🤝" },
  { id: "phone", name: "Phone", category: "Identity", points: 2, verified: false, onchain: "none" as const, icon: "📱" },
  { id: "biometric", name: "Biometric", category: "Biometrics", points: 5, verified: true, onchain: "minted" as const, icon: "🫆" },
  { id: "face-scan", name: "Face scan", category: "Biometrics", points: 4, verified: false, onchain: "none" as const, icon: "🙂" },
  { id: "github", name: "GitHub", category: "Social", points: 3, verified: true, onchain: "none" as const, icon: "🐙" },
  { id: "discord", name: "Discord", category: "Social", points: 1, verified: false, onchain: "none" as const, icon: "💬" },
  { id: "linkedin", name: "LinkedIn", category: "Social", points: 2, verified: false, onchain: "none" as const, icon: "🔗" },
  { id: "eth-activity", name: "Ethereum activity", category: "On-chain activity", points: 4, verified: true, onchain: "mintable" as const, icon: "⟠" },
  { id: "gitcoin", name: "Gitcoin", category: "On-chain activity", points: 3, verified: false, onchain: "none" as const, icon: "🌱" },
];
