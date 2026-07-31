import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./StampDetailDrawer.module.css";
import glass from "./glassTip.module.css";
import { Tooltip } from "../components/Tooltip";
import { Medallion, type Stamp, type StampOnchain } from "./StampsWindow";
import {
  ArrowLeftIcon,
  CaretDownIcon,
  CheckIcon,
  ClockIcon,
  LinkIcon,
  PlusIcon,
  RetryIcon,
  StarIcon,
} from "./icons";
import { deriveTints } from "./deriveTints";
import { formatExpiry } from "./expiry";
import { useAccentRgb, useReducedMotion } from "./hooks";
import type { ShellSize } from "./PassportShell";

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
  /** Optional row icon (an emoji, an <img>, or an icon node). */
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
  /** Optional plain one-line description of what the stamp proves. */
  description?: string;
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
  /** Mint the stamp on-chain (the gold reward action when mintable). */
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

  /** Override the on-chain status pill's glass tooltip copy. */
  statusTooltip?: React.ReactNode;
};

const ONCHAIN_PILL: Record<StampOnchain, string> = {
  minted: "Minted",
  mintable: "Mintable",
  none: "Off chain",
};

const ONCHAIN_TIP: Record<StampOnchain, string> = {
  minted: "This stamp is recorded on chain.",
  mintable: "You can mint this stamp on chain to earn the reward.",
  none: "This stamp lives off chain. Nothing is written on chain.",
};

// Conservative so a page's rows always fit the fixed shell height alongside the
// header, the how-computed bar, and the bottom-pinned action, with the rest of
// the components moving to the next page (paginate, never scroll).
const DEFAULT_PER_PAGE: Record<ShellSize, number> = { full: 2, mini: 2, pill: 2 };

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

/** One sub-credential row: icon + name + verified / expiry line + points chip. */
const ComponentRow: React.FC<{ component: StampComponent }> = ({ component }) => {
  const { name, points, verified, expiry, icon } = component;
  const state = verified ? (expiry ? expiry : "Verified") : "Not verified yet";
  return (
    <div className={styles.row} data-verified={verified ? "true" : "false"}>
      <span className={styles.rowIcon} aria-hidden="true">
        {icon ?? <StarIcon size={15} strokeWidth={1.6} />}
      </span>
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
  statusTooltip,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const accent = useAccentRgb(rootRef);
  const [page, setPage] = useState(0);

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

  const action = deriveAction(stamp, actionState);
  const showRenew = Boolean(onRenew) && stamp.verified && action !== "claim";

  // Every stamp expires as a whole. The header states it in full ("Valid for N
  // days" / "Expires {date}" / "Expired"); Human ID SBTs add the auto-renew note.
  const expiry = formatExpiry(stamp.expirationDate);

  const compact = size !== "full";
  const medallionPx = compact ? 40 : 46;

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
            once, below) + name + total points + on-chain status pill. */}
        <header className={styles.header}>
          <Medallion stamp={stamp} showPoints={false} showPip={false} sizePx={medallionPx} />
          <div className={styles.headMeta}>
            <h3 className={styles.name}>{stamp.name}</h3>
            <div className={styles.headSub}>
              <Tooltip content={statusTooltip ?? ONCHAIN_TIP[stamp.onchain]} placement="top" className={glass.tip}>
                <span
                  className={styles.statusPill}
                  data-onchain={stamp.onchain}
                  tabIndex={0}
                  role="button"
                  aria-label={`${ONCHAIN_PILL[stamp.onchain]}. ${
                    statusTooltip ? "" : ONCHAIN_TIP[stamp.onchain]
                  }`}
                >
                  <span className={styles.statusDot} aria-hidden="true">
                    {stamp.onchain === "none" ? null : <LinkIcon size={9} strokeWidth={2} />}
                  </span>
                  {ONCHAIN_PILL[stamp.onchain]}
                </span>
              </Tooltip>
              <span className={styles.headPoints}>{earned} points</span>
            </div>
          </div>
        </header>

        {stamp.description ? <p className={styles.desc}>{stamp.description}</p> : null}

        {/* Expiry: a stamp expires as a whole. Amber when expiring soon, warn when
            expired. Human ID SBTs carry the auto-renew note beside it. */}
        {expiry ? (
          <div className={styles.expiry} data-state={expiry.state}>
            <span className={styles.expiryIcon} aria-hidden="true">
              <ClockIcon size={13} strokeWidth={1.9} />
            </span>
            <span className={styles.expiryText}>
              {expiry.long}
              {stamp.isHumanId ? (
                <span className={styles.expiryNote}>
                  {" "}
                  Auto renews after 90 days, full reverification after a year.
                </span>
              ) : null}
            </span>
          </div>
        ) : null}

        {/* Sub-credential rows, paginated (never scrolled). */}
        <div className={styles.list}>
          <p className={styles.srOnly} aria-live="polite">
            {stamp.components.length} components. Page {current + 1} of {pageCount}.
          </p>
          {pageComponents.map((c, i) => (
            <ComponentRow key={`${c.name}-${current}-${i}`} component={c} />
          ))}
        </div>

        {pageCount > 1 ? <Pager page={current} pageCount={pageCount} onPage={setPage} /> : null}

        {/* How the score is computed: the weighted components summing to the total.
            Length encodes each share; one accent family; the total on the right. */}
        {segments.length ? (
          <div className={styles.compute}>
            <div className={styles.computeHead}>
              <span className={styles.computeLabel}>How your points add up</span>
              <span className={styles.computeTotal}>{earned} points</span>
            </div>
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
          </div>
        ) : null}

        {/* Action area: bottom-pinned, one primary action, state-driven. When a
            renew is shown it sits BESIDE the primary on one row (not stacked), so
            the two-action case reserves no extra height inside the fixed shell. */}
        <div className={`${styles.actions} ${showRenew ? styles.actionsRow : ""}`}>
          {action === "mint" ? (
            <button type="button" className={`${styles.cta} ${styles.ctaReward}`} onClick={onMint}>
              <span className={styles.ctaIcon}>
                <StarIcon size={15} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaLabel}>{mintLabel ?? "Notarize stamp"}</span>
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

          {/* Renewal, where relevant. Quiet tonal secondary, never the primary. */}
          {showRenew ? (
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
