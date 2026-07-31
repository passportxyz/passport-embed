import React from "react";
import { Widget, PassportWidgetTheme } from "../widgets/Widget";
import { DarkTheme, LightTheme } from "../utils/themes";
import type { Stamp } from "./StampsWindow";
import type { StampComponent, StampDetail } from "./StampDetailDrawer";
import { STAMP_ICONS } from "./stampIcons";
import { daysFromNow } from "./expiry";

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

// Verbatim Passport category names (from usePlatforms.tsx BASE_PLATFORM_CATEGORIES).
const CAT_PHYSICAL = "Physical Verification";
const CAT_CHAIN = "Blockchain Networks and Activities";
const CAT_WEB2 = "Web2 Platforms & Services";

/**
 * The REAL Human Passport stamp catalog for the redesign stories. Names, weights,
 * categories, and icons all come from passportxyz/passport (platform Providers
 * config + BASE_PLATFORM_CATEGORIES). `id` is the platform id; `icon` is the real
 * platform SVG (currentColor). A spread of states so every face + navigation reads:
 * verified / unverified, minted / mintable / off-chain, valid / expiring-soon /
 * expired. `expirationDate` is present on verified stamps (a stamp expires as a
 * whole; default lifetime is 90 days). `isHumanId` flags the SBT stamps.
 */
const MEDALLION_BASE: Stamp[] = [
  // ---- Physical Verification ----
  {
    id: "HumanIdKyc",
    name: "Government ID",
    category: CAT_PHYSICAL,
    points: 16,
    verified: true,
    onchain: "minted",
    icon: STAMP_ICONS.HumanIdKyc,
    isHumanId: true,
    expirationDate: daysFromNow(78),
  },
  {
    id: "Biometrics",
    name: "Biometrics",
    category: CAT_PHYSICAL,
    points: 6,
    verified: true,
    onchain: "mintable",
    icon: STAMP_ICONS.Biometrics,
    isHumanId: true,
    expirationDate: daysFromNow(88),
  },
  {
    id: "Civic",
    name: "Civic",
    category: CAT_PHYSICAL,
    points: 8.86,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.Civic,
    expirationDate: daysFromNow(9),
  },
  {
    id: "CleanHands",
    name: "Proof of Clean Hands",
    category: CAT_PHYSICAL,
    points: 3,
    verified: true,
    onchain: "mintable",
    icon: STAMP_ICONS.CleanHands,
    isHumanId: true,
    expirationDate: daysFromNow(83),
  },
  {
    id: "Coinbase",
    name: "Coinbase",
    category: CAT_PHYSICAL,
    points: 16,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Coinbase,
  },
  {
    id: "HumanIdPhone",
    name: "Phone Verification",
    category: CAT_PHYSICAL,
    points: 1.5,
    verified: true,
    onchain: "mintable",
    icon: STAMP_ICONS.HumanIdPhone,
    isHumanId: true,
    expirationDate: daysFromNow(88),
  },
  {
    id: "Binance",
    name: "Binance",
    category: CAT_PHYSICAL,
    points: 16,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.Binance,
    expirationDate: daysFromNow(62),
  },

  // ---- Blockchain Networks and Activities ----
  {
    id: "Ens",
    name: "ENS",
    category: CAT_CHAIN,
    points: 2,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.Ens,
    expirationDate: daysFromNow(40),
  },
  {
    id: "ETH",
    name: "Ethereum",
    category: CAT_CHAIN,
    points: 2,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.ETH,
    expirationDate: daysFromNow(21),
  },
  {
    id: "Gitcoin",
    name: "Gitcoin Grants",
    category: CAT_CHAIN,
    points: 2.5,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Gitcoin,
  },
  {
    id: "GtcStaking",
    name: "Identity Staking",
    category: CAT_CHAIN,
    points: 2.7,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.GtcStaking,
  },
  {
    // A verified stamp whose credential has lapsed: the expired visual state.
    id: "NFT",
    name: "NFT",
    category: CAT_CHAIN,
    points: 2,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.NFT,
    expirationDate: daysFromNow(-3),
  },
  {
    id: "GuildXYZ",
    name: "Guild.xyz",
    category: CAT_CHAIN,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.GuildXYZ,
  },
  {
    id: "Lens",
    name: "Lens",
    category: CAT_CHAIN,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Lens,
  },
  {
    id: "Snapshot",
    name: "Snapshot",
    category: CAT_CHAIN,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Snapshot,
  },
  {
    id: "GnosisSafe",
    name: "Safe",
    category: CAT_CHAIN,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.GnosisSafe,
  },
  {
    id: "Brightid",
    name: "BrightID",
    category: CAT_CHAIN,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Brightid,
  },
  {
    id: "Idena",
    name: "Idena",
    category: CAT_CHAIN,
    points: 1.5,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Idena,
  },
  {
    id: "ZkSync",
    name: "zkSync",
    category: CAT_CHAIN,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.ZkSync,
  },

  // ---- Web2 Platforms & Services ----
  {
    id: "Discord",
    name: "Discord",
    category: CAT_WEB2,
    points: 0.5,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Discord,
  },
  {
    id: "Github",
    name: "GitHub",
    category: CAT_WEB2,
    points: 3,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.Github,
    expirationDate: daysFromNow(55),
  },
  {
    id: "Google",
    name: "Google",
    category: CAT_WEB2,
    points: 1,
    verified: true,
    onchain: "none",
    icon: STAMP_ICONS.Google,
    expirationDate: daysFromNow(12),
  },
  {
    id: "Linkedin",
    name: "LinkedIn",
    category: CAT_WEB2,
    points: 1,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.Linkedin,
  },
  {
    id: "X",
    name: "X",
    category: CAT_WEB2,
    points: 2,
    verified: false,
    onchain: "none",
    icon: STAMP_ICONS.X,
  },
];

/**
 * Per-stamp detail payload: real description + the sub-credential components used
 * to score it. Single-credential platforms (including every Human ID SBT) list
 * one component; multi-component platforms (Civic, Ethereum, NFT, Gitcoin,
 * Identity Staking, GitHub) list several. Verified components sum to the header
 * total; unverified list what is still available. Values mirror passport's real
 * providers (e.g. Civic Captcha 0.82 + Uniqueness 5.0 + Liveness 3.04 = 8.86).
 */
const DETAIL_META: Record<string, { description: string; components: StampComponent[] }> = {
  HumanIdKyc: {
    description:
      "Complete identity verification using a government issued ID to prove uniqueness while keeping your details private.",
    components: [{ name: "Government ID Holder", points: 16, verified: true }],
  },
  Biometrics: {
    description: "Proves unique humanity through 3D facial liveness verification and deduplication.",
    components: [{ name: "Unique Biometric Identity", points: 6, verified: true }],
  },
  Civic: {
    description: "Connect to Civic to verify your identity across CAPTCHA, uniqueness, and liveness checks.",
    components: [
      { name: "Civic CAPTCHA Pass", points: 0.82, verified: true },
      { name: "Civic Uniqueness Pass", points: 5.0, verified: true },
      { name: "Civic Liveness Pass", points: 3.04, verified: true },
    ],
  },
  CleanHands: {
    description:
      "Awarded after completing identity verification and sanctions validation, strengthening your proof of humanity.",
    components: [{ name: "Sanctions-Free Identity Verified", points: 3, verified: true }],
  },
  Coinbase: {
    description: "Verify your Coinbase account and onchain ID to link a trusted, verified exchange account.",
    components: [{ name: "Coinbase KYC Verified", points: 16, verified: false }],
  },
  HumanIdPhone: {
    description: "Confirm ownership of a unique phone number to prove a real human.",
    components: [{ name: "Verified Phone Number", points: 1.5, verified: true }],
  },
  Binance: {
    description:
      "Verify KYC with your Binance Account Bound Token, proving you completed identity verification on Binance.",
    components: [{ name: "Binance Account Bound Token (BABT)", points: 16, verified: true }],
  },
  Ens: {
    description: "Own and configure an ENS domain as your primary name to establish a decentralized identity.",
    components: [{ name: "ENS Domain Owner", points: 2, verified: true }],
  },
  ETH: {
    description: "Verify your Ethereum mainnet and L2 transaction history for genuine network participation.",
    components: [
      { name: "ETH Enthusiast", points: 1, verified: true },
      { name: "Execute over 100 transactions", points: 0.5, verified: true },
      { name: "Active on over 50 distinct days", points: 0.5, verified: true },
    ],
  },
  Gitcoin: {
    description: "Verify your Gitcoin Grants donations to official rounds.",
    components: [
      { name: "Bronze Contributor", points: 1, verified: false },
      { name: "Silver Contributor", points: 1.5, verified: false },
    ],
  },
  GtcStaking: {
    description: "Stake GTC on yourself or others to boost trust in the ecosystem.",
    components: [
      { name: "Bronze Staker", points: 1.2, verified: false },
      { name: "Community Participant", points: 1.5, verified: false },
    ],
  },
  NFT: {
    description: "Verify your Ethereum L1 NFT collection and holdings.",
    components: [
      { name: "Digital Collector", points: 1, verified: true },
      { name: "Holds at least 1 NFT (ERC-721)", points: 1, verified: true },
    ],
  },
  GuildXYZ: {
    description: "Verify membership in your Guild.xyz communities.",
    components: [{ name: "Guild Member", points: 1, verified: false }],
  },
  Lens: {
    description: "Verify ownership of your Lens Protocol handle.",
    components: [{ name: "Lens Handle Owner", points: 1, verified: false }],
  },
  Snapshot: {
    description: "Verify your participation in Snapshot governance votes.",
    components: [{ name: "Snapshot Voter", points: 1, verified: false }],
  },
  GnosisSafe: {
    description: "Verify that you are a signer on a Safe multisig wallet.",
    components: [{ name: "Safe Signer", points: 1, verified: false }],
  },
  Brightid: {
    description: "Verify your BrightID to prove a unique social identity.",
    components: [{ name: "BrightID Verified", points: 1, verified: false }],
  },
  Idena: {
    description: "Verify your Idena proof of person validation status.",
    components: [{ name: "Idena Validated", points: 1.5, verified: false }],
  },
  ZkSync: {
    description: "Verify your zkSync Era transaction history.",
    components: [{ name: "zkSync Era Activity", points: 1, verified: false }],
  },
  Discord: {
    description: "Verify genuine Discord engagement and Sybil resistance.",
    components: [{ name: "Discord Engagement Verification", points: 0.5, verified: false }],
  },
  Github: {
    description: "Verify your GitHub activity through a sustained contribution history.",
    components: [
      { name: "Regular Contributor", points: 2, verified: true },
      { name: "Active Developer", points: 1, verified: true },
    ],
  },
  Google: {
    description: "Connect and verify ownership of your Google account.",
    components: [{ name: "Verify Google Account Ownership", points: 1, verified: true }],
  },
  Linkedin: {
    description: "Connect and verify ownership of your LinkedIn account.",
    components: [{ name: "Verify LinkedIn Account Ownership", points: 1, verified: false }],
  },
  X: {
    description: "Verify your X account, including verified status, followers, and account age.",
    components: [{ name: "Verify X Verified Account", points: 2, verified: false }],
  },
};

/**
 * The catalog with each stamp's plain description attached (from DETAIL_META), so
 * the grid medallion's hover / focus tooltip explains WHAT the stamp does. The
 * drawer reuses the same description verbatim.
 */
export const SAMPLE_MEDALLION_STAMPS: Stamp[] = MEDALLION_BASE.map((s) => ({
  ...s,
  description: DETAIL_META[s.id]?.description,
}));

// The full catalog already spills each category past one page (Physical 7,
// Blockchain 12), so category nav + within-category paging both read from it.
export const SAMPLE_MEDALLION_STAMPS_PAGED = SAMPLE_MEDALLION_STAMPS;

// ---- Onchain credential block, Human ID SBT / attestation stamps only (all
// non-PII). ----
// The three Human ID SBTs (Government ID, Biometrics, Phone) live on the HubV3
// contract on Optimism. Proof of Clean Hands is a SIGN PROTOCOL attestation (NOT
// EAS), viewed on scan.sign.global; its attester is a distinct address. In
// production these fields come from the Human ID SDK getters (already fetched in
// useHumanIDVerification and discarded); here we seed the same non-PII shape. No
// nullifier / indexingValue, no user address, no fake tokenId. The issuer renders
// as the verified identity "human.tech", never a raw hex string, with a
// view-on-chain link to the contract / attester.
const HUB_V3 = "0x2AA822e264F8cc31A2b9C22f39e5551241e94DfB";
const CLEAN_HANDS_ATTESTER = "0xB1f50c6C34C72346b1229e5C80587D0D659556Fd";
const opAddr = (address: string): string => `https://optimistic.etherscan.io/address/${address}`;
const opTx = (hash: string): string => `https://optimistic.etherscan.io/tx/${hash}`;
// A representative Sign Protocol attestation id (shape: onchain_evm_10_0x…). It
// is an on-chain handle, not PII; the nullifier / indexingValue is never shown.
const CLEAN_HANDS_ATTESTATION_ID = "onchain_evm_10_0x7c9f2a4b8e1d6053";
// Representative on-chain transaction hashes (mint / attest). On-chain handles,
// not PII. Distinct from the contract link, so "View transaction" is its own
// affordance.
const SBT_TX_HASH = "0x5b1e7a0c9d4f2836a1c7e0b95d3f8241760ac9e2f4b18d05a6e3c72f9018b4d6";
const CLEAN_HANDS_TX_HASH = "0x8c2f4a6b1e9d0537c4a8f1e2b6d09547310ac8e1f4b27d6053a9e1c72f4b8d90";

type OcSeed = {
  protocol: "sbt" | "sign";
  credential: string;
  /** View the credential itself (the contract / attestation). */
  explorerUrl: string;
  /** View the verified issuer / attester on chain. */
  issuerUrl: string;
  /** View the mint / attest transaction, distinct from the contract link. */
  txUrl: string;
  /** Pre-committed on-chain disclosure-conditions gate (Clean Hands only). */
  disclosureUrl?: string;
};

// All Human ID credentials are proven with a VOLE-based zero knowledge proof, so
// each carries the same non-PII provenance line behind the ZK trust tag.
const ZK_PROVENANCE = "Issued by human.tech and proven with a VOLE-based zero knowledge proof.";

const HUMAN_ID_ONCHAIN: Record<string, OcSeed> = {
  HumanIdKyc: {
    protocol: "sbt",
    credential: "Government ID",
    explorerUrl: opAddr(HUB_V3),
    issuerUrl: opAddr(HUB_V3),
    txUrl: opTx(SBT_TX_HASH),
  },
  Biometrics: {
    protocol: "sbt",
    credential: "Biometrics",
    explorerUrl: opAddr(HUB_V3),
    issuerUrl: opAddr(HUB_V3),
    txUrl: opTx(SBT_TX_HASH),
  },
  HumanIdPhone: {
    protocol: "sbt",
    credential: "Phone",
    explorerUrl: opAddr(HUB_V3),
    issuerUrl: opAddr(HUB_V3),
    txUrl: opTx(SBT_TX_HASH),
  },
  CleanHands: {
    protocol: "sign",
    credential: "Proof of Clean Hands",
    explorerUrl: `https://scan.sign.global/attestation/${CLEAN_HANDS_ATTESTATION_ID}`,
    issuerUrl: opAddr(CLEAN_HANDS_ATTESTER),
    txUrl: opTx(CLEAN_HANDS_TX_HASH),
    // The gate that enforces the pre-committed disclosure conditions on chain.
    disclosureUrl: `${opAddr(CLEAN_HANDS_ATTESTER)}#code`,
  },
};

const ONE_DAY = 86_400_000;
const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const buildOnchain = (stamp: Stamp): StampDetail["onchainCredential"] => {
  const oc = HUMAN_ID_ONCHAIN[stamp.id];
  if (!oc) return undefined;
  // Issued is derivable (SBT default lifetime is 90 days), so issued = expiry - 90d.
  // (Real getters: SBT expiry / attestation validUntil are seconds, attestTimestamp
  // is ms; convert before formatting. Here the seed dates are already ISO.)
  const issued = stamp.expirationDate
    ? fmtDate(new Date(new Date(stamp.expirationDate).getTime() - 90 * ONE_DAY).toISOString())
    : undefined;
  return {
    protocol: oc.protocol,
    issued,
    expires: stamp.expirationDate ? fmtDate(stamp.expirationDate) : undefined,
    chain: "Optimism",
    revoked: false,
    credential: oc.credential,
    issuer: "human.tech",
    issuerUrl: oc.issuerUrl,
    explorerUrl: oc.explorerUrl,
    txUrl: oc.txUrl,
    disclosureUrl: oc.disclosureUrl,
    zkProof: ZK_PROVENANCE,
  };
};

/**
 * Presentational join: the catalog `Stamp` (icons / weights / category / expiry /
 * on-chain, from the metadata + score endpoints) merged with its scoring
 * components, keyed by stamp id. This is the exact shape the drawer takes via props.
 */
export const SAMPLE_STAMP_DETAILS: Record<string, StampDetail> = SAMPLE_MEDALLION_STAMPS.reduce(
  (acc, stamp) => {
    const meta = DETAIL_META[stamp.id];
    acc[stamp.id] = {
      ...stamp,
      description: meta?.description,
      components: meta?.components ?? [
        { name: stamp.name, points: stamp.points, verified: stamp.verified },
      ],
      onchainCredential: buildOnchain(stamp),
    };
    return acc;
  },
  {} as Record<string, StampDetail>
);

// A REVOKED Clean Hands attestation. Revocation is the one real per-user observable
// state change (the SDK exposes no decryption signal, so there is NO "decrypted"
// state to build). It carries when (revokeTimestamp), why (revokeReason), and a
// link to the revoke transaction (revokeTransactionHash) - all real attestation
// fields. The default state stays "Valid" + "encrypted to the Human Network".
const CLEAN_HANDS_REVOKE_TX = "0x2a7d19f4c8b3605e1a9c4f7d20b83e5619ac0f42d8b73e15069a2c4f7b30e8d1";
export const SAMPLE_STAMP_DETAIL_REVOKED: StampDetail = (() => {
  const base = SAMPLE_STAMP_DETAILS.CleanHands;
  const oc = base.onchainCredential!;
  return {
    ...base,
    onchainCredential: {
      ...oc,
      revoked: true,
      revokedAt: fmtDate(new Date(Date.now() - 3 * ONE_DAY).toISOString()),
      revokeReason: "Sanctions screening result changed.",
      revokeTxUrl: opTx(CLEAN_HANDS_REVOKE_TX),
    },
  };
})();
