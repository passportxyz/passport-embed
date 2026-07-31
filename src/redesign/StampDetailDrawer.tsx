import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./StampDetailDrawer.module.css";
import { Medallion, type Stamp } from "./StampsWindow";
import {
  ArrowLeftIcon,
  CaretDownIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  LinkIcon,
  PlusIcon,
  RetryIcon,
  ShieldIcon,
} from "./icons";
import { OptimismMark } from "./stampIcons";
import { deriveTints } from "./deriveTints";
import { formatExpiry } from "./expiry";
import { useAccentRgb } from "./hooks";
import type { ShellSize } from "./PassportShell";

/**
 * Canonical human.tech docs links (not per-credential data, so they live here as
 * constants rather than on the credential prop). These point at the consolidated
 * hub (docs.human.tech), not the legacy docs.id host:
 *  - the VOLE-based ZK trust badge opens the proof-system explainer;
 *  - the Clean Hands "Disclosure conditions" link opens the disclosure-conditions
 *    doc (the rule-based disclosure gate), NOT an invented Etherscan link.
 */
const VOLE_ZK_DOCS_URL = "https://docs.human.tech/vole-based-zk";
const CLEAN_HANDS_DOCS_URL = "https://docs.human.tech/disclosure-conditions";

/**
 * One sub-credential that contributes to a stamp's score. Each is a row in the
 * drawer with its own points, verified / expiry state, and an icon.
 */
export type StampComponent = {
  /** Short component name, e.g. "Government ID number" or "Liveness check". */
  name: string;
  /** Points this component contributes to the stamp's total. */
  points: number;
  /** Whether this component is verified (earned) or still missing. */
  verified: boolean;
  /**
   * Plain expiry / renewal line for a verified component, e.g. "Renews Aug 3" or
   * "Expired". Kept plain, no crypto jargon, no dashes. Omit when not relevant.
   */
  expiry?: string;
  /** Optional row icon (an emoji, an <img>, or an icon node). Omit for no icon. */
  icon?: React.ReactNode;
};

/**
 * A stamp with the detail-drawer payload: the components used to score it and an
 * optional plain description. Extends the Stamps window `Stamp` so the same id /
 * name / points / verified / onchain / icon carry through.
 */
export type StampDetail = Stamp & {
  /** The components / sub-credentials that were used to score this stamp. */
  components: StampComponent[];
  /* `description` is inherited from Stamp (surfaced as the grid tooltip and the
     drawer's own description line). */
  /**
   * Onchain credential metadata, for the Human ID SBT stamps ONLY (Government ID,
   * Biometrics, Phone, Proof of Clean Hands). Everything here is non-PII.
   *
   * Data model: these come from the Human ID SDK getters. The SBT reads
   * (getKycSBTByAddress / getPhoneSBTByAddress / getBiometricsSBTByAddress)
   * return { expiry, publicValues: [expiry, recipient, actionId, nullifier,
   * issuer], revoked }; Proof of Clean Hands returns a Sign Protocol attestation
   * ({ attestTimestamp, validUntil, revoked, attestationId, data }). The embed
   * already fetches these in useHumanIDVerification and discards them, so this
   * block is purely presentational: seed it via props, render, done.
   *
   * Unit gotcha for whoever wires the real getters: the SBT `expiry` and the
   * attestation `validUntil` are UNIX SECONDS, while the attestation
   * `attestTimestamp` is MILLISECONDS. Convert before formatting the strings
   * passed in here.
   *
   * DELIBERATELY NOT SURFACED: name, DOB, document number, nationality, phone
   * number, biometric data, the recipient/user address, and crucially the
   * nullifier / indexingValue (a stable per-user correlation handle). For Proof
   * of Clean Hands the attestation `data` is only a scope actionId with nothing
   * to decode, there is NO observer and NO displayable signature, so none are
   * invented here. Leaving all of this out is the privacy point, not an omission.
   * There is no ERC-721 tokenId and no mint transaction in the SBT read path, so
   * no "SBT #1234" id is shown.
   *
   * Named `onchainCredential` (not `onchain`) because `Stamp.onchain` already
   * carries the minted / mintable / none state string.
   */
  onchainCredential?: {
    /**
     * Which protocol backs the credential, so the block labels + view link are
     * accurate: "sbt" = a Human ID SBT on Optimism (view on chain -> the HubV3
     * contract); "sign" = a Sign Protocol attestation (Proof of Clean Hands;
     * view -> scan.sign.global). NOT EAS.
     */
    protocol: "sbt" | "sign";
    /** Issue date, e.g. "Apr 12, 2026". Omit when unknown (never invented). */
    issued?: string;
    /** Expiry date, e.g. "Oct 17, 2026". Mirrors the header clock's validity. */
    expires?: string;
    /** Chain the credential lives on, e.g. "Optimism". */
    chain: string;
    /** Revocation flag from the SBT / attestation; false renders "Valid". */
    revoked: boolean;
    /**
     * Revocation detail, shown ONLY when `revoked` is true. Revocation is the one
     * real per-user observable state change on the Sign Protocol attestation /
     * SBT (the SDK exposes NO decryption event, so there is no "decrypted" state).
     * These map to the attestation's real `revokeTimestamp` / `revokeReason` /
     * `revokeTransactionHash` fields. All optional: render whichever are known.
     */
    /** When it was revoked, e.g. "Jul 28, 2026" (from `revokeTimestamp`). */
    revokedAt?: string;
    /** Why it was revoked, a plain reason string (from `revokeReason`). */
    revokeReason?: string;
    /** Link to the revoke transaction (from `revokeTransactionHash`). */
    revokeTxUrl?: string;
    /**
     * Pre-committed on-chain disclosure conditions link (Proof of Clean Hands).
     * The conditions gate that governs disclosure IS on chain and linkable; the
     * raw decryption is not. Renders the "Disclosure only under pre-committed on
     * chain conditions" affordance. Omit to drop it.
     */
    disclosureUrl?: string;
    /**
     * "View transaction" link from the attestation / mint `transactionHash`,
     * distinct from the contract (`explorerUrl`) and issuer (`issuerUrl`) links.
     * Omit to drop the affordance. Never the user address or nullifier.
     */
    txUrl?: string;
    /**
     * Optional credential provenance, shown as a small "Proven with VOLE-based ZK"
     * tag whose tooltip carries this provenance line (non-PII, e.g. "Issued by
     * human.tech and proven with a VOLE-based zero knowledge proof."). Omit to
     * drop the tag.
     */
    zkProof?: string;
    /** Credential type, e.g. "Government ID". */
    credential: string;
    /**
     * Verified issuer DISPLAY name, e.g. "human.tech". Never a raw hex address:
     * the issuer / attester address is a verified on-chain identity, so it reads
     * as a name with a view-on-chain link, not a hex string.
     */
    issuer: string;
    /**
     * View-on-chain link for the verified issuer / attester: the HubV3 contract
     * (0x2AA822e264F8cc31A2b9C22f39e5551241e94DfB) for SBTs, the Clean Hands
     * attester (0xB1f50c6C34C72346b1229e5C80587D0D659556Fd) for Sign Protocol.
     * Omit to render the issuer name without a link.
     */
    issuerUrl?: string;
    /**
     * View-the-credential link: the HubV3 contract on Optimism for the SBTs, or
     * `https://scan.sign.global/attestation/${id}` (id like `onchain_evm_10_0x…`)
     * for a Proof of Clean Hands attestation. Omit to drop the affordance.
     */
    explorerUrl?: string;
  };
};

/** The bottom-pinned action the drawer resolves to. One primary action. */
export type StampAction = "mint" | "claim" | "view" | "verified";

export type StampDetailDrawerProps = {
  /** The stamp being detailed (header + components + action derive from it). */
  stamp: StampDetail;
  /**
   * Whether the drawer is shown. Default true. When false the overlay stays
   * mounted but slides down and fades out (pointer-events off), so a parent can
   * animate it closed instead of unmounting. Consumers may also just conditionally
   * mount it; the enter animation plays either way.
   */
  open?: boolean;
  /**
   * Size variant, mirrors the shell's, used only to tune density (components per
   * page + medallion size). The drawer always fills its container. Default full.
   */
  size?: ShellSize;
  /** Components shown per page before the list paginates (never scrolls). */
  componentsPerPage?: number;

  /** Close the drawer (scrim tap, drag handle, close button, Escape). */
  onClose?: () => void;
  /** Mint the stamp on-chain (the emerald reward action when mintable, never gold). */
  onMint?: () => void;
  /** Claim / verify the stamp (unverified). */
  onClaim?: () => void;
  /** View the minted stamp on-chain. */
  onViewOnchain?: () => void;
  /** Renew an expiring credential. Shown as a quiet secondary when provided. */
  onRenew?: () => void;

  /** Force the primary action state, overriding the derived one. */
  actionState?: StampAction;
  /** Label overrides for each action (dev-overridable copy). */
  mintLabel?: string;
  claimLabel?: string;
  viewOnchainLabel?: string;
  verifiedLabel?: string;
  renewLabel?: string;

  /**
   * Render the "Onchain credential" accordion expanded on first paint (Human ID
   * SBT / attestation stamps only, and only when `stamp.onchainCredential` is
   * supplied). Defaults to collapsed so the fixed drawer height is never at risk;
   * open it to show the metadata rows.
   */
  defaultOnchainOpen?: boolean;
};

/**
 * The header STATE pill: one word (or short phrase) that names the stamp's state,
 * matching the grid medallion's carrier so the two never disagree. Precedence puts
 * the time-sensitive states first, so an expiring minted stamp reads the actionable
 * "Expiring in Nd" while its onchain state is still carried by the drawer's onchain
 * block. `showLink` renders the chain-link dot only when the state IS an onchain
 * one. No tooltip: the pill states the state in a word; the onchain block carries
 * the credential detail, so each fact is stated exactly once (founder review).
 */
type StatePill = {
  label: string;
  /** Drives the pill color: minted / mintable / verified (emerald tints), soon
   *  (amber), expired / none (neutral). */
  tone: "minted" | "mintable" | "verified" | "soon" | "expired" | "none";
  showLink: boolean;
};

const deriveStatePill = (stamp: StampDetail, expiry: ReturnType<typeof formatExpiry>): StatePill => {
  if (expiry?.state === "expired") return { label: "Expired", tone: "expired", showLink: false };
  if (expiry?.state === "soon")
    return {
      label: `Expiring in ${expiry.days}${expiry.days === 1 ? " day" : "d"}`,
      tone: "soon",
      showLink: false,
    };
  if (!stamp.verified) return { label: "Not verified", tone: "none", showLink: false };
  if (stamp.onchain === "minted") return { label: "Minted", tone: "minted", showLink: true };
  if (stamp.onchain === "mintable") return { label: "Mintable", tone: "mintable", showLink: true };
  return { label: "Verified", tone: "verified", showLink: false };
};

// Components fit within the expanded breakdown accordion, paginating (never
// scrolling) only in the rare case a stamp carries more than a page of them. The
// real multi-component stamps top out at three, so a page holds them all.
const DEFAULT_PER_PAGE: Record<ShellSize, number> = { full: 4, mini: 3, pill: 3 };

/** Derive the single primary action from the stamp state (dev-overridable). */
const deriveAction = (stamp: StampDetail, override?: StampAction): StampAction => {
  if (override) return override;
  if (!stamp.verified) return "claim";
  if (stamp.onchain === "mintable") return "mint";
  if (stamp.onchain === "minted") return "view";
  return "verified";
};

/** Split a flat list into fixed-size pages (mirrors the Stamps window pager). */
const paginate = <T,>(items: T[], per: number): T[][] => {
  if (per <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += per) pages.push(items.slice(i, i + per));
  return pages.length ? pages : [[]];
};

/**
 * One sub-credential row: [meaningful icon, if any] + name + verified / expiry
 * state + points chip. No filler icon: when a component has no real icon the row
 * simply leads with the name (the old placeholder star was meaningless).
 */
const ComponentRow: React.FC<{ component: StampComponent }> = ({ component }) => {
  const { name, points, verified, expiry, icon } = component;
  const state = verified ? (expiry ? expiry : "Verified") : "Not verified yet";
  return (
    <div className={styles.row} data-verified={verified ? "true" : "false"}>
      {icon ? (
        <span className={styles.rowIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.rowMeta}>
        <span className={styles.rowName}>{name}</span>
        <span className={styles.rowState}>
          {verified ? (
            expiry ? (
              <ClockIcon size={11} strokeWidth={1.9} />
            ) : (
              <CheckIcon size={11} strokeWidth={2.2} />
            )
          ) : null}
          {state}
        </span>
      </span>
      <span className={styles.rowPoints}>+{points}</span>
    </div>
  );
};

/** Reused pager: dots + arrows, never a scrollbar (matches the Stamps window). */
const Pager: React.FC<{ page: number; pageCount: number; onPage: (p: number) => void }> = ({
  page,
  pageCount,
  onPage,
}) => (
  <div className={styles.pager} role="group" aria-label="Component pages">
    <button
      type="button"
      className={styles.pagerArrow}
      onClick={() => onPage(Math.max(0, page - 1))}
      disabled={page === 0}
      aria-label="Previous components"
    >
      <CaretDownIcon className={styles.pagerPrev} size={13} />
    </button>
    <span className={styles.pagerDots}>
      {Array.from({ length: pageCount }).map((_, i) => (
        <button
          type="button"
          key={i}
          className={`${styles.pagerDot} ${i === page ? styles.pagerDotOn : ""}`}
          onClick={() => onPage(i)}
          aria-label={`Component page ${i + 1}`}
          aria-current={i === page ? "true" : undefined}
        />
      ))}
    </span>
    <button
      type="button"
      className={styles.pagerArrow}
      onClick={() => onPage(Math.min(pageCount - 1, page + 1))}
      disabled={page === pageCount - 1}
      aria-label="More components"
    >
      <CaretDownIcon className={styles.pagerNext} size={13} />
    </button>
  </div>
);

/**
 * StampDetailDrawer - a passport-style slide-in drawer that opens OVER the Stamps
 * window (SOP §4, modeled on app.passport.xyz's stamp drawer). A scrim dims and
 * blurs the grid behind; the drawer slides up from the bottom as a solid glass
 * sheet with a drag handle. Header carries the medallion + name + total points +
 * on-chain status pill; then the sub-credential rows (each with its own points +
 * verified / expiry + icon), paginated never scrolled; then how the score is
 * computed (the weighted components summing to the total); then one bottom-pinned
 * state-driven action (Mint / Claim / View on chain / Verified) plus an optional
 * renew. Presentational: props only, both-theme legible, reduced-motion aware,
 * everything inside the shell.
 */
export const StampDetailDrawer: React.FC<StampDetailDrawerProps> = ({
  stamp,
  open = true,
  size = "full",
  componentsPerPage,
  onClose,
  onMint,
  onClaim,
  onViewOnchain,
  onRenew,
  actionState,
  mintLabel,
  claimLabel,
  viewOnchainLabel,
  verifiedLabel,
  renewLabel,
  defaultOnchainOpen = false,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const accent = useAccentRgb(rootRef);
  const [page, setPage] = useState(0);

  const oc = stamp.onchainCredential;
  // A single-component stamp needs no breakdown: the header total already states
  // its one contribution once (no restating the same number three ways). A
  // multi-component stamp gets the "Score breakdown" accordion instead.
  const isMulti = stamp.components.length > 1;

  // The drawer body is an accordion GROUP: at most one section is open at a time,
  // so an expanded section always fits the fixed drawer height (no clip, no
  // scroll). FILL SPACE, do not hide (design-sop): when a section fits, it opens
  // by default, so the fixed height is used rather than left empty with content
  // hidden behind a closed row. A multi-component stamp opens "Score breakdown"
  // (every component immediately readable, Civic's three no longer clip); a
  // single-component stamp WITH an onchain credential has room for the taller
  // "Onchain credential" block, so it opens that instead of sitting empty. Only
  // when both would overflow does the group keep the other collapsed (progressive
  // disclosure for genuine overflow, not the default). Reset on stamp change.
  type Section = "breakdown" | "onchain";
  const initialSection = (): Section | null =>
    isMulti ? "breakdown" : oc ? "onchain" : null;
  const [openSection, setOpenSection] = useState<Section | null>(initialSection);
  // The onchain "Links and details" disclosure is COLLAPSED by default so the
  // dense onchain block never overflows the fixed drawer height (this reclaimed
  // space is what keeps the revoked Mint / Renew CTA fully visible, §9). Reset it
  // whenever the drawer switches to another stamp.
  const [linksOpen, setLinksOpen] = useState(false);
  useEffect(() => {
    setOpenSection(isMulti ? "breakdown" : oc ? "onchain" : null);
    setLinksOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp.id, isMulti, defaultOnchainOpen]);
  const breakdownOpen = openSection === "breakdown";
  const onchainOpen = openSection === "onchain";
  const toggleSection = (s: Section) => setOpenSection((prev) => (prev === s ? null : s));

  // Description FILLS SPACE (design-sop §7.5 fill-space). When the accordion is
  // collapsed it shows in FULL, using the freed vertical space; when the Score
  // breakdown is expanded it compresses to one line (Civic's three components all
  // stay reachable). The onchain-credential section is the one dense block that
  // needs the whole height, so the description steps fully aside while it is open.
  const descMode: "full" | "compressed" | "hidden" =
    openSection === "onchain" ? "hidden" : openSection === "breakdown" ? "compressed" : "full";

  // Escape closes the drawer while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const per = componentsPerPage ?? DEFAULT_PER_PAGE[size];
  const pages = useMemo(() => paginate(stamp.components, per), [stamp.components, per]);
  const pageCount = pages.length;
  const current = Math.min(page, pageCount - 1);
  const pageComponents = pages[current] ?? [];

  // Earned total = sum of the verified components' points. This is the number the
  // header states and the weighted bar sums to (one source, no hardcoded total).
  const earned = useMemo(
    () => stamp.components.reduce((a, c) => a + (c.verified ? c.points : 0), 0),
    [stamp.components]
  );

  // How the score is computed: the verified components as accent-derived segments
  // whose LENGTH is each one's share of the total. One hue family, no rainbow, no
  // legend (points ride on the rows above). Ranked so the largest reads deepest.
  const segments = useMemo(() => {
    const verified = stamp.components.filter((c) => c.verified && c.points > 0);
    const denom = verified.reduce((a, c) => a + c.points, 0) || 1;
    const ranked = verified.slice().sort((a, b) => b.points - a.points);
    const tints = deriveTints(accent, verified.length);
    return verified.map((c) => ({
      name: c.name,
      pct: (c.points / denom) * 100,
      color: tints[Math.max(0, ranked.indexOf(c))],
    }));
  }, [stamp.components, accent]);

  // Every stamp expires as a whole. The expiring / expired states are named in
  // the header state pill; the SBT stamps carry the exact Issued / Expires dates
  // in the onchain block. There is no separate header clock (its tooltip was the
  // kind of overuse this pass removes), so no standalone validity line here.
  const expiry = formatExpiry(stamp.expirationDate);
  const expired = expiry?.state === "expired";

  const action = deriveAction(stamp, actionState);
  // Expired + renewable: RENEW leads as the primary emerald CTA (for an expired
  // stamp the next action is to renew, so it leads; "Expired" reads only in the
  // header state pill, never as a second action). A minted expired stamp keeps a
  // quiet "View on chain" secondary beside it; everything else shows Renew alone.
  const renewPrimary = expired && Boolean(onRenew) && !actionState;
  const secondaryView = renewPrimary && stamp.onchain === "minted";
  const showRenew =
    Boolean(onRenew) && stamp.verified && action !== "claim" && !renewPrimary;
  const twoActions = showRenew || secondaryView;
  const statePill = deriveStatePill(stamp, expiry);

  const compact = size !== "full";
  const medallionPx = compact ? 40 : 42;

  return (
    <div
      ref={rootRef}
      className={styles.overlay}
      data-open={open ? "true" : "false"}
      role="dialog"
      aria-modal="false"
      aria-label={`${stamp.name} details`}
    >
      {/* Scrim: the ONE translucent layer. Dims + blurs the grid behind and closes
          the drawer on tap. The drawer sheet on top is solid so content stays
          legible (materials rule: never stack translucent layers to mush). */}
      <button
        type="button"
        className={styles.scrim}
        aria-label="Close stamp details"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <section className={styles.drawer}>
        {/* Drag handle doubles as a close affordance; an explicit back button sits
            beside it for keyboard users. */}
        <div className={styles.handleRow}>
          <button
            type="button"
            className={styles.back}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            aria-label="Back to stamps"
          >
            <ArrowLeftIcon size={13} />
          </button>
          <button
            type="button"
            className={styles.handle}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            aria-label="Close stamp details"
          >
            <span className={styles.handleBar} aria-hidden="true" />
          </button>
          <span className={styles.handleSpacer} aria-hidden="true" />
        </div>

        {/* Header: clean medallion (no chip / pip, so points + on-chain are stated
            once, below) + name + total points + on-chain state pill. The stamp's
            state is carried HERE in one word; the exact dates + credential detail
            live in the onchain block, so nothing repeats (founder review). */}
        <header className={styles.header}>
          <Medallion stamp={stamp} showPoints={false} showPip={false} sizePx={medallionPx} />
          <div className={styles.headMeta}>
            <h3 className={styles.name}>{stamp.name}</h3>
            <div className={styles.headSub}>
              {/* State pill: the ONE header carrier of the stamp's state, naming it
                  in a word (Minted / Mintable / Verified / Expiring in Nd / Expired)
                  so it matches the grid medallion. Plain, no tooltip. */}
              <span
                className={styles.statusPill}
                data-state={statePill.tone}
                aria-label={`State. ${statePill.label}.`}
              >
                {statePill.showLink ? (
                  <span className={styles.statusDot} aria-hidden="true">
                    <LinkIcon size={9} strokeWidth={2} />
                  </span>
                ) : null}
                <span className={styles.statusPillLabel}>{statePill.label}</span>
              </span>
              {/* Points, shown ONCE (the medallion drops its chip): a first-class
                  "+N points" pill. */}
              <span className={styles.headPoints}>+{earned} points</span>
            </div>
          </div>
        </header>

        {/* Description fills the freed space: shown in FULL when the accordion
            below is collapsed, compressed to one line when a section is expanded
            (so the open section still fits the fixed drawer height). Never hidden
            with the space left blank (design-sop §7.5 fill-space). */}
        {stamp.description && descMode !== "hidden" ? (
          <div className={styles.descWrap}>
            <p className={`${styles.desc} ${descMode === "compressed" ? styles.descCompressed : ""}`}>
              {stamp.description}
            </p>
          </div>
        ) : null}

        {/* Score breakdown accordion (multi-component stamps only). Expanded, it
            shows EVERY component row (Civic's Captcha / Uniqueness / Liveness all
            reachable and readable, no clip) plus a weighted bar whose LENGTH
            encodes each share. No "how your points add up = {total}" caption: the
            header already states the total once, so the bar carries no number. A
            single-component stamp has no breakdown at all (its one contribution is
            the header total, stated once). Paginates only if a stamp ever exceeds
            a page of components (never scrolls). */}
        {isMulti ? (
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHead}
              onClick={() => toggleSection("breakdown")}
              aria-expanded={breakdownOpen}
            >
              <span className={styles.sectionLabel}>Score breakdown</span>
              <CaretDownIcon className={breakdownOpen ? styles.sectionChevOpen : styles.sectionChev} size={13} />
            </button>
            {breakdownOpen ? (
              <div className={styles.sectionBody}>
                <div className={styles.list}>
                  <p className={styles.srOnly} aria-live="polite">
                    {stamp.components.length} components. Page {current + 1} of {pageCount}.
                  </p>
                  {pageComponents.map((c, i) => (
                    <ComponentRow key={`${c.name}-${current}-${i}`} component={c} />
                  ))}
                </div>
                {pageCount > 1 ? <Pager page={current} pageCount={pageCount} onPage={setPage} /> : null}
                {segments.length ? (
                  <div
                    className={styles.computeBar}
                    role="img"
                    aria-label={`The verified components sum to ${earned} points.`}
                  >
                    {segments.map((seg, i) => (
                      <span
                        key={`${seg.name}-${i}`}
                        className={styles.computeSeg}
                        style={{ width: `${seg.pct}%`, background: seg.color }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Onchain credential accordion (Human ID SBT / attestation stamps only).
            A CANONICAL label:value layout (not a scattered pile): one aligned
            column of rows for the credential facts, then the privacy note, then
            all the view actions grouped in one place, then the ZK trust tag. The
            stamp STATE (Minted / Valid) is NOT restated here; the header pill owns
            it. This block owns the details: network, protocol, dates, issuer,
            revocation. All non-PII (see StampDetail.onchainCredential). */}
        {oc ? (
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHead}
              onClick={() => toggleSection("onchain")}
              aria-expanded={onchainOpen}
            >
              <span className={styles.ocHeadIcon} aria-hidden="true">
                <LinkIcon size={13} strokeWidth={1.9} />
              </span>
              <span className={styles.sectionLabel}>Onchain credential</span>
              <CaretDownIcon className={onchainOpen ? styles.sectionChevOpen : styles.sectionChev} size={13} />
            </button>
            {onchainOpen ? (
              <div className={styles.ocBody}>
                {/* (a) TRUST BADGE AT TOP: the VOLE-based ZK provenance, its own
                    badge, linked to the architecture doc (new tab). It leads the
                    block so the proof system reads first, above the record. */}
                {oc.zkProof && !oc.revoked ? (
                  <a
                    className={styles.ocTrust}
                    href={VOLE_ZK_DOCS_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Proven with VOLE-based ZK. Read the docs (opens in a new tab)."
                  >
                    <span className={styles.ocTrustDot} aria-hidden="true">
                      <CheckIcon size={9} strokeWidth={2.8} />
                    </span>
                    Proven with VOLE-based ZK
                    <ExternalLinkIcon className={styles.ocTrustExt} size={11} strokeWidth={1.9} />
                  </a>
                ) : null}

                {/* (b) CREDENTIAL RECORD PANEL: the aligned label:value grid,
                    contained as one subtle surface. Consistent Key on the left,
                    value on the right, so it reads as an organised record. Led by
                    the REAL Optimism mark in brand red (the chain-logo brand-color
                    exception, §7.5). Both the SBT and the Sign Protocol attestation
                    live on Optimism. The stamp STATE (Minted / Valid) is NOT
                    restated here; the header pill owns it. */}
                <div className={styles.ocPanel}>
                  <dl className={styles.ocGrid}>
                    <div className={styles.ocItem}>
                      <dt className={styles.ocKey}>Network</dt>
                      <dd className={styles.ocVal}>
                        <span className={styles.ocChain} aria-hidden="true">
                          <OptimismMark size={14} />
                        </span>
                        {oc.chain}
                      </dd>
                    </div>
                    <div className={styles.ocItem}>
                      <dt className={styles.ocKey}>Protocol</dt>
                      <dd className={styles.ocVal}>{oc.protocol === "sbt" ? "Onchain SBT" : "Sign Protocol"}</dd>
                    </div>
                    {oc.issued ? (
                      <div className={styles.ocItem}>
                        <dt className={styles.ocKey}>Issued</dt>
                        <dd className={styles.ocVal}>{oc.issued}</dd>
                      </div>
                    ) : null}
                    {oc.expires ? (
                      <div className={styles.ocItem}>
                        <dt className={styles.ocKey}>Expires</dt>
                        <dd className={styles.ocVal}>{oc.expires}</dd>
                      </div>
                    ) : null}
                    {/* Verified issuer: a named on-chain identity (human.tech) with a
                        small check + a view link, never a raw hex address. */}
                    <div className={styles.ocItem}>
                      <dt className={styles.ocKey}>Issuer</dt>
                      <dd className={styles.ocVal}>
                        {oc.issuerUrl ? (
                          <a className={styles.ocIssuer} href={oc.issuerUrl} target="_blank" rel="noreferrer noopener">
                            <span className={styles.ocVerifiedMark} aria-hidden="true">
                              <CheckIcon size={9} strokeWidth={2.8} />
                            </span>
                            {oc.issuer}
                          </a>
                        ) : (
                          <span className={styles.ocIssuer}>
                            <span className={styles.ocVerifiedMark} aria-hidden="true">
                              <CheckIcon size={9} strokeWidth={2.8} />
                            </span>
                            {oc.issuer}
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* (c) CLEAN HANDS PRIVACY CALLOUT: a distinct bordered box with a
                    shield, so the encryption + rule-based disclosure point stands
                    apart as its own element (not an inline line). Honest framing:
                    identity is ENCRYPTED to the Human Network and disclosure is
                    rule-based, gated by pre-committed on-chain conditions. Never
                    "nothing is stored"; never a nullifier or any personal field.
                    Steps aside once revoked. */}
                {oc.protocol === "sign" && !oc.revoked ? (
                  <div className={styles.ocCallout}>
                    <span className={styles.ocCalloutIcon} aria-hidden="true">
                      <ShieldIcon size={14} strokeWidth={1.8} />
                    </span>
                    <p className={styles.ocCalloutText}>
                      Identity encrypted to the Human Network. Disclosure is rule-based, gated on chain.
                    </p>
                  </div>
                ) : null}

                {/* Revocation detail (only when revoked): when + why + a link to the
                    revoke transaction, grouped in a tonal band. */}
                {oc.revoked ? (
                  <div className={styles.ocRevoke}>
                    {oc.revokedAt ? <p className={styles.ocLine}>Revoked on {oc.revokedAt}.</p> : null}
                    {oc.revokeReason ? <p className={styles.ocLine}>Reason. {oc.revokeReason}</p> : null}
                  </div>
                ) : null}

                {/* (d) LINKS AND DETAILS: a collapsible disclosure, COLLAPSED by
                    default, holding the view links (View on chain / View
                    transaction / Disclosure conditions). Each names itself; the
                    collapsed default reclaims the height that keeps the revoked CTA
                    fully visible. "Disclosure conditions" opens the Clean Hands doc
                    (the rule-based disclosure gate), never an invented Etherscan
                    link. */}
                {oc.explorerUrl || oc.txUrl || oc.revokeTxUrl || (oc.protocol === "sign" && !oc.revoked) ? (
                  <div className={styles.ocLinks}>
                    <button
                      type="button"
                      className={styles.ocLinksHead}
                      onClick={() => setLinksOpen((v) => !v)}
                      aria-expanded={linksOpen}
                    >
                      <span className={styles.ocLinksLabel}>Links and details</span>
                      <CaretDownIcon
                        className={linksOpen ? styles.sectionChevOpen : styles.sectionChev}
                        size={12}
                      />
                    </button>
                    {linksOpen ? (
                      <div className={styles.ocLinksBody}>
                        {oc.explorerUrl ? (
                          <a className={styles.ocView} href={oc.explorerUrl} target="_blank" rel="noreferrer noopener">
                            <LinkIcon size={13} strokeWidth={1.9} />
                            {oc.protocol === "sign" ? "View on Sign Protocol" : "View on chain"}
                          </a>
                        ) : null}
                        {oc.txUrl ? (
                          <a className={styles.ocView} href={oc.txUrl} target="_blank" rel="noreferrer noopener">
                            <ExternalLinkIcon size={13} strokeWidth={1.9} />
                            View transaction
                          </a>
                        ) : null}
                        {oc.protocol === "sign" && !oc.revoked ? (
                          <a
                            className={styles.ocView}
                            href={CLEAN_HANDS_DOCS_URL}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <ExternalLinkIcon size={13} strokeWidth={1.9} />
                            Disclosure conditions
                          </a>
                        ) : null}
                        {/* The revoke transaction link lives here (revoked case), so
                            the revoke band stays compact and the CTA is never
                            clipped (§9). */}
                        {oc.revokeTxUrl ? (
                          <a className={styles.ocView} href={oc.revokeTxUrl} target="_blank" rel="noreferrer noopener">
                            <ExternalLinkIcon size={13} strokeWidth={1.9} />
                            View revoke transaction
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Action area: bottom-pinned, one primary action, state-driven. When a
            renew is shown it sits BESIDE the primary on one row (not stacked), so
            the two-action case reserves no extra height inside the fixed shell. */}
        <div className={`${styles.actions} ${twoActions ? styles.actionsRow : ""}`}>
          {renewPrimary ? (
            /* Expired: Renew is the PRIMARY emerald action, the next step for a
               lapsed credential. */
            <button type="button" className={styles.cta} onClick={onRenew}>
              <span className={styles.ctaIcon}>
                <RetryIcon size={15} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaLabel}>{renewLabel ?? "Renew"}</span>
            </button>
          ) : action === "mint" ? (
            /* Mint = anchor the stamp on chain. Emerald primary (never gold), with
               the chain-link glyph. */
            <button type="button" className={styles.cta} onClick={onMint}>
              <span className={styles.ctaIcon}>
                <LinkIcon size={15} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaLabel}>{mintLabel ?? "Mint stamp"}</span>
            </button>
          ) : action === "claim" ? (
            <button type="button" className={styles.cta} onClick={onClaim}>
              <span className={styles.ctaIcon}>
                <PlusIcon size={15} strokeWidth={2} />
              </span>
              <span className={styles.ctaLabel}>{claimLabel ?? "Claim stamp"}</span>
            </button>
          ) : action === "view" ? (
            <button type="button" className={styles.cta} onClick={onViewOnchain}>
              <span className={styles.ctaIcon}>
                <LinkIcon size={15} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaLabel}>{viewOnchainLabel ?? "View on chain"}</span>
            </button>
          ) : (
            <div className={styles.doneRow}>
              <span className={styles.doneSeal} aria-hidden="true">
                <CheckIcon size={14} strokeWidth={2.6} />
              </span>
              <span className={styles.doneText}>{verifiedLabel ?? "Verified"}</span>
            </div>
          )}

          {/* Secondary. For a minted expired stamp, "View on chain" rides beside
              the primary Renew; otherwise a quiet Renew secondary where relevant.
              Never the primary. */}
          {secondaryView ? (
            <button
              type="button"
              className={`${styles.cta} ${styles.ctaSecondary} ${styles.ctaRenew}`}
              onClick={onViewOnchain}
            >
              <span className={styles.ctaIcon}>
                <LinkIcon size={15} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaLabel}>{viewOnchainLabel ?? "View on chain"}</span>
            </button>
          ) : showRenew ? (
            <button
              type="button"
              className={`${styles.cta} ${styles.ctaSecondary} ${styles.ctaRenew}`}
              onClick={onRenew}
            >
              <span className={styles.ctaIcon}>
                <RetryIcon size={15} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaLabel}>{renewLabel ?? "Renew"}</span>
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
};
