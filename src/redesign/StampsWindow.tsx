import React, { useEffect, useMemo, useState } from "react";
import styles from "./StampsWindow.module.css";
import glass from "./glassTip.module.css";
import { Tooltip } from "../components/Tooltip";
import { CaretDownIcon, LinkIcon, PlusIcon, StarIcon } from "./icons";
import { CATEGORY_ICONS } from "./stampIcons";
import { formatExpiry } from "./expiry";
import { useReducedMotion } from "./hooks";
import type { ShellSize } from "./PassportShell";

/*
 * Real data model note: in production the presentational shape below is the JOIN
 * of two endpoints, keyed by credential id. `/embed/stamps/metadata` supplies the
 * icon, weight, category, credential ids and descriptions; `/embed/score` supplies
 * the per-stamp `expiration_date`, `dedup`, and earned `score`. The catalog + the
 * score are merged into these `Stamp` / `StampDetail` props before render; the
 * components here take that joined shape and never fetch.
 */

/**
 * On-chain state of a stamp. Everything is emerald (no gold): the medallion's
 * own treatment carries the state, not a colored chip.
 *  - "minted"   notarized on-chain: emerald glow + a small chain-link pip + a
 *               subtle settle animation. The "special" state.
 *  - "mintable" verified but not notarized yet: emerald outline / glow invite.
 *  - "none"     lives off-chain: a calm neutral-glass medallion.
 */
export type StampOnchain = "minted" | "mintable" | "none";

export type Stamp = {
  /** Stable id passed back through onSelectStamp. */
  id: string;
  /** Short stamp name, e.g. "Government ID". */
  name: string;
  /** Grouping label, e.g. "Identity" / "Biometrics" / "Social". */
  category: string;
  /** Points this stamp contributes to the score (earned when verified). */
  points: number;
  /** Whether the credential is verified (earned) or still available to add. */
  verified: boolean;
  /** On-chain state. Drives the medallion's corner pip only (one signal). */
  onchain: StampOnchain;
  /** Optional badge face art (an emoji, an <img>, or an icon node). */
  icon?: React.ReactNode;
  /**
   * ISO date this stamp expires. Every stamp expires as a whole (the score
   * endpoint carries a per-stamp expiration date; default lifetime is 90 days).
   * Drives the "Valid for N days" / "Expires {date}" / "Expired" copy + the
   * expired visual state. Omit for a stamp that is not yet verified.
   */
  expirationDate?: string;
  /**
   * True when this stamp is a Human ID SBT (Government ID, Phone, Biometrics,
   * Proof of Clean Hands). Such stamps auto-renew after 90 days, with full
   * reverification after a year - the drawer reflects that copy.
   */
  isHumanId?: boolean;
  /**
   * Plain one-line description of what the stamp proves. Surfaced as the grid
   * medallion's hover / focus tooltip (what the stamp does) and reused verbatim
   * by the detail drawer. Omit to render the medallion with no tooltip.
   */
  description?: string;
};

export type StampsWindowProps = {
  /** The stamps to show, grouped by category and paginated (never scrolled). */
  stamps: Stamp[];
  /** Tapping a badge fires this with the stamp id (the detail drawer is a later slice). */
  onSelectStamp?: (stampId: string) => void;
  /**
   * The verify / add entry point (bottom-pinned primary CTA, consistent with the
   * shell's "Add verifications"). Omit to drop the CTA entirely.
   */
  onVerify?: () => void;
  /** Override the verify CTA label. */
  verifyLabel?: string;
  /** Badges per category page before it paginates. Defaults to 6 (full) / 3 (mini). */
  pageSize?: number;
  /** Category selected on first paint (by verbatim name). Defaults to the first. */
  initialCategory?: string;
  /** Override the header label. Defaults to "Your stamps". */
  headline?: string;
  /** Empty-state message. Defaults to a plain "No stamps yet" line. */
  emptyLabel?: string;
  /**
   * Interim loading state. Reuses the ScoreWindow ScoreLoader approach (a simple
   * indeterminate emerald arc); it does NOT invent a new loader or pull Cryptex.
   */
  loading?: boolean;
  /**
   * Size variant, mirrors the shell's. Pass the SAME value you pass to
   * PassportShell so the fixed height matches and the tab-switch never jumps.
   */
  size?: ShellSize;
};

// Badges per page WITHIN a category before it paginates. The primary nav is the
// category selector; paging is the secondary overflow within one category, never
// a scrollbar. Full fits two rows of three under the tabs + heading + CTA in the
// fixed shell height; mini keeps one short row.
const DEFAULT_PAGE_SIZE: Record<ShellSize, number> = { full: 6, mini: 3, pill: 3 };

const ONCHAIN_LABEL: Record<StampOnchain, string> = {
  minted: "Minted on chain",
  mintable: "Can be minted on chain",
  none: "Off chain",
};

/** Plain-language points phrase for the accessible name (earned vs available). */
const pointsPhrase = (s: Stamp) =>
  s.verified ? `${s.points} points earned` : `${s.points} points available`;

const stampLabel = (s: Stamp) =>
  `${s.name}. ${pointsPhrase(s)}. ${s.verified ? "Verified" : "Not verified yet"}. ${
    ONCHAIN_LABEL[s.onchain]
  }. Open stamp.`;

/** Split a flat list into fixed-size pages. */
const paginate = <T,>(items: T[], per: number): T[][] => {
  if (per <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += per) pages.push(items.slice(i, i + per));
  return pages.length ? pages : [[]];
};

type CategoryGroup = { category: string; stamps: Stamp[]; verified: number };

/** Group stamps by category, preserving first-appearance order, with a per-category
 *  verified count for the tab badge (e.g. "5/7"). */
const deriveCategories = (items: Stamp[]): CategoryGroup[] => {
  const order: string[] = [];
  const map = new Map<string, Stamp[]>();
  for (const s of items) {
    if (!map.has(s.category)) {
      map.set(s.category, []);
      order.push(s.category);
    }
    map.get(s.category)!.push(s);
  }
  return order.map((category) => {
    const stamps = map.get(category)!;
    return { category, stamps, verified: stamps.filter((s) => s.verified).length };
  });
};

export type MedallionProps = {
  /** The stamp whose face, state treatment, and points chip to render. */
  stamp: Stamp;
  /** Condensed ~half-size medallion (mini card). */
  compact?: boolean;
  /** Show the overlapping points chip. Default true. The drawer header carries
   *  the total as its own text, so it renders the medallion WITHOUT the chip to
   *  avoid stating the points twice (one carrier per signal). */
  showPoints?: boolean;
  /** Show the corner status glyphs (the minted chain-link pip + the expiring dot).
   *  Default true (grid). The drawer header carries on-chain state in its status
   *  pill and expiry in its timer tooltip, so it passes false to drop both. */
  showPip?: boolean;
  /** Override the diameter (px). Sets --rd-med inline (wins over the size rule). */
  sizePx?: number;
};

/**
 * A single glass medallion: a rim + embossed face carrying the stamp icon, with
 * its on-brand STATE carried by the medallion itself (no chips):
 *  - unverified: recessive, neutral rim.
 *  - verified + off-chain ("none"): calm emerald-glass (unminted).
 *  - verified + mintable: an emerald outline / glow invite (never gold).
 *  - verified + minted: emerald glow + a small chain-link pip + a settle animation.
 *  - expiring soon: a small amber dot in the corner (the ONLY amber here).
 *  - expired: desaturated with a muted outline; reads inactive.
 * Points ride on the chip; everything else is emerald. One carrier per meaning.
 *
 * Exported so the stamp detail drawer reuses the exact medallion look for its
 * header. The header passes showPoints/showPip false so on-chain + expiry are not
 * stated twice (the drawer states them in its own pill + timer).
 */
export const Medallion: React.FC<MedallionProps> = ({
  stamp,
  compact,
  showPoints = true,
  showPip = true,
  sizePx,
}) => {
  const expiry = formatExpiry(stamp.expirationDate);
  const expired = expiry?.state === "expired";
  const soon = expiry?.state === "soon";
  // Minted is the "special" state: an emerald glow + chain pip + a settle-in.
  const minted = stamp.verified && stamp.onchain === "minted" && !expired;
  return (
    <span
      className={`${styles.medallion} ${compact ? styles.medallionSm : ""} ${minted ? styles.medallionMinted : ""}`}
      data-verified={stamp.verified ? "true" : "false"}
      data-onchain={stamp.onchain}
      data-expired={expired ? "true" : undefined}
      style={sizePx ? ({ "--rd-med": `${sizePx}px` } as React.CSSProperties) : undefined}
    >
      <span className={styles.face}>
        <span className={styles.glyph} aria-hidden="true">
          {stamp.icon ?? <StarIcon size={compact ? 15 : 20} strokeWidth={1.6} />}
        </span>
      </span>
      {/* Minted chain-link pip: the single "notarized on chain" mark. Emerald only;
          mintable / off-chain carry their state through the medallion treatment. */}
      {showPip && minted ? (
        <span className={styles.pip} aria-hidden="true">
          <LinkIcon size={compact ? 8 : 9} strokeWidth={2} />
        </span>
      ) : null}
      {/* Expiring-soon dot: the ONLY amber on the medallion, and a small indicator
          only (never the whole face). Suppressed once expired (that reads muted). */}
      {showPip && soon && !expired ? <span className={styles.expiringDot} aria-hidden="true" /> : null}
      {showPoints ? <span className={styles.points}>+{stamp.points}</span> : null}
    </span>
  );
};

/**
 * One grid badge: the medallion + name, the whole thing a tap target. When the
 * stamp carries a description it is wrapped in the portal glass Tooltip so hover
 * / focus reveals WHAT the stamp does, readable in both themes and never clipped
 * (the tooltip portals to the body, so it escapes the fixed shell bounds).
 */
const StampBadge: React.FC<{
  stamp: Stamp;
  compact?: boolean;
  onSelect?: (id: string) => void;
}> = ({ stamp, compact, onSelect }) => {
  const btn = (
    <button
      type="button"
      className={styles.badge}
      onClick={() => onSelect?.(stamp.id)}
      aria-label={stampLabel(stamp)}
    >
      <Medallion stamp={stamp} compact={compact} />
      <span className={styles.name}>{stamp.name}</span>
    </button>
  );
  return stamp.description ? (
    <Tooltip content={stamp.description} placement="top" className={glass.tip}>
      {btn}
    </Tooltip>
  ) : (
    btn
  );
};

/**
 * Interim loader, mirroring ScoreWindow's ScoreLoader (a simple indeterminate
 * emerald arc). Not a new loader, and NOT the Cryptex loader (see ScoreWindow /
 * design-sop §7 reuse-shared-components): the shared loader is consumed as a
 * dependency once installable, never vendored into this public repo.
 */
const StampsLoader: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <div className={styles.loaderWrap} role="status" aria-label="Loading your stamps">
      <svg width={44} height={44} viewBox="0 0 48 48" aria-hidden className={reduced ? undefined : styles.spin}>
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(var(--muted), 0.25)" strokeWidth="4" />
        <path d="M24 4 a20 20 0 0 1 20 20" fill="none" stroke="rgb(var(--accent))" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/** Reused pager: dots + arrows, never a scrollbar (matches the shell pager). */
const Pager: React.FC<{ page: number; pageCount: number; onPage: (p: number) => void }> = ({
  page,
  pageCount,
  onPage,
}) => (
  <div className={styles.pager} role="group" aria-label="Stamp pages">
    <button
      type="button"
      className={styles.pagerArrow}
      onClick={() => onPage(Math.max(0, page - 1))}
      disabled={page === 0}
      aria-label="Previous stamps"
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
          aria-label={`Stamp page ${i + 1}`}
          aria-current={i === page ? "true" : undefined}
        />
      ))}
    </span>
    <button
      type="button"
      className={styles.pagerArrow}
      onClick={() => onPage(Math.min(pageCount - 1, page + 1))}
      disabled={page === pageCount - 1}
      aria-label="More stamps"
    >
      <CaretDownIcon className={styles.pagerNext} size={13} />
    </button>
  </div>
);

/**
 * Category selector (segmented control): one segment per real Passport category.
 * Each segment carries the category glyph + a verified/total count; the active
 * segment is highlighted. This is the PRIMARY navigation - it switches the whole
 * grid to that category (no blind whole-catalog paging). The full verbatim name
 * rides on the active-category heading below + every segment's accessible label.
 */
const CategoryTabs: React.FC<{
  groups: CategoryGroup[];
  active: number;
  onSelect: (index: number) => void;
}> = ({ groups, active, onSelect }) => (
  <div className={styles.tabs} role="tablist" aria-label="Stamp categories">
    {groups.map((g, i) => (
      <button
        type="button"
        key={g.category}
        role="tab"
        aria-selected={i === active}
        className={`${styles.tab} ${i === active ? styles.tabOn : ""}`}
        onClick={() => onSelect(i)}
        title={`${g.category}. ${g.verified} of ${g.stamps.length} verified.`}
        aria-label={`${g.category}. ${g.verified} of ${g.stamps.length} verified.`}
      >
        <span className={styles.tabIcon} aria-hidden="true">
          {CATEGORY_ICONS[g.category] ?? <StarIcon size={18} strokeWidth={1.6} />}
        </span>
        <span className={styles.tabCount}>
          {g.verified}/{g.stamps.length}
        </span>
      </button>
    ))}
  </div>
);

/**
 * StampsWindow - the medallion catalog, rendered INSIDE PassportShell like the
 * Score window. Stamps are glass plaques navigated BY CATEGORY (a segmented
 * control at the top), and within a category paginated and never scrolled
 * (§4 / §Windows). Presentational: props only, no data hooks, both-theme legible,
 * reduced-motion aware. Tapping a badge fires onSelectStamp.
 */
export const StampsWindow: React.FC<StampsWindowProps> = ({
  stamps,
  onSelectStamp,
  onVerify,
  verifyLabel,
  pageSize,
  initialCategory,
  headline,
  emptyLabel,
  loading = false,
  size = "full",
}) => {
  const per = pageSize ?? DEFAULT_PAGE_SIZE[size];
  const compact = size !== "full";

  const categories = useMemo(() => deriveCategories(stamps), [stamps]);
  const initialActive = useMemo(() => {
    const i = categories.findIndex((c) => c.category === initialCategory);
    return i >= 0 ? i : 0;
  }, [categories, initialCategory]);

  // active = which category tab is selected (full only); page = the page WITHIN
  // that category. Switching category resets the page to its first (bug fix: the
  // old flat pager split a single category across pages and mislabeled counts).
  const [active, setActive] = useState(initialActive);
  const [page, setPage] = useState(0);
  const activeIndex = Math.min(active, Math.max(0, categories.length - 1));
  const selectCategory = (i: number) => {
    setActive(i);
    setPage(0);
  };
  // Keep the page valid if the active category or data shrinks under the cursor.
  useEffect(() => {
    setPage(0);
  }, [activeIndex]);

  const verifiedCount = useMemo(() => stamps.filter((s) => s.verified).length, [stamps]);

  // full navigates a single category; mini flattens the whole list (no tabs) to
  // keep the half-size card to one short paged row.
  const activeGroup = categories[activeIndex];
  const source = compact ? stamps : activeGroup ? activeGroup.stamps : [];
  const pages = useMemo(() => paginate(source, per), [source, per]);
  const pageCount = pages.length;
  const current = Math.min(page, pageCount - 1);
  const pageStamps = pages[current] ?? [];

  const winClass = `${styles.window} ${size === "mini" ? styles.miniWin : ""} ${
    size === "pill" ? styles.pillWin : ""
  }`;

  // ---- pill: one short status row. Up to three mini medallions, a count, and
  // one compact action. No category headers, no pager (the pill summarizes). ----
  if (size === "pill") {
    // Two preview medallions keep the single row from crowding the count + action
    // at the 300px pill width (the third would push the label into an ellipsis).
    const preview = stamps.slice(0, 2);
    return (
      <div className={winClass}>
        {loading ? (
          <>
            <StampsLoader />
            <span className={styles.pillText}>Loading your stamps</span>
          </>
        ) : (
          <>
            <span className={styles.pillStack} aria-hidden="true">
              {preview.map((s) => (
                <Medallion key={s.id} stamp={s} compact />
              ))}
            </span>
            <span className={styles.pillText}>
              {verifiedCount}/{stamps.length} verified
            </span>
            {onVerify ? (
              <button type="button" className={`${styles.cta} ${styles.ctaInline}`} onClick={onVerify}>
                <span className={styles.ctaIcon}>
                  <PlusIcon size={14} strokeWidth={2} />
                </span>
                <span className={styles.ctaLabel}>{verifyLabel ?? "Verify"}</span>
              </button>
            ) : null}
          </>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={winClass}>
        <div className={styles.head}>
          <span className={styles.title}>{headline ?? "Your stamps"}</span>
        </div>
        <div className={styles.center}>
          <StampsLoader />
          <p className={styles.emptyText}>Loading your stamps</p>
        </div>
      </div>
    );
  }

  if (!stamps.length) {
    return (
      <div className={winClass}>
        <div className={styles.head}>
          <span className={styles.title}>{headline ?? "Your stamps"}</span>
        </div>
        <div className={styles.center}>
          <span className={styles.emptyMark} aria-hidden="true">
            <StarIcon size={22} strokeWidth={1.6} />
          </span>
          <p className={styles.emptyText}>{emptyLabel ?? "No stamps yet. Verify one to start your passport."}</p>
        </div>
        {onVerify ? (
          <button type="button" className={styles.cta} onClick={onVerify}>
            <span className={styles.ctaIcon}>
              <PlusIcon size={15} strokeWidth={2} />
            </span>
            <span className={styles.ctaLabel}>{verifyLabel ?? "Verify a stamp"}</span>
          </button>
        ) : null}
      </div>
    );
  }

  // ---- mini: no category tabs. One flat, paged, half-size grid. ----
  if (compact) {
    return (
      <div className={winClass}>
        <p className={styles.srOnly} aria-live="polite">
          {stamps.length} stamps, {verifiedCount} verified. Page {current + 1} of {pageCount}.
        </p>
        <div className={styles.head}>
          <span className={styles.title}>{headline ?? "Your stamps"}</span>
          <span className={styles.count}>
            {verifiedCount}/{stamps.length} verified
          </span>
        </div>
        <div className={styles.pages}>
          <div className={styles.grid}>
            {pageStamps.map((s) => (
              <StampBadge key={s.id} stamp={s} compact onSelect={onSelectStamp} />
            ))}
          </div>
        </div>
        {pageCount > 1 ? <Pager page={current} pageCount={pageCount} onPage={setPage} /> : null}
      </div>
    );
  }

  // ---- full: category selector + a single category's grid, paged within it. ----
  return (
    <div className={winClass}>
      <p className={styles.srOnly} aria-live="polite">
        {activeGroup?.category}. {activeGroup?.verified} of {activeGroup?.stamps.length} verified. Page{" "}
        {current + 1} of {pageCount}.
      </p>

      <CategoryTabs groups={categories} active={activeIndex} onSelect={selectCategory} />

      {activeGroup ? (
        <div className={styles.catBar}>
          {/* Verbatim category name (single line; full name in title + tab a11y
              labels), plus its verified/total count. */}
          <span className={styles.catName} title={activeGroup.category}>
            {activeGroup.category}
          </span>
          <span className={styles.count}>
            {activeGroup.verified}/{activeGroup.stamps.length}
          </span>
        </div>
      ) : null}

      <div className={styles.pages}>
        <div className={styles.grid}>
          {pageStamps.map((s) => (
            <StampBadge key={s.id} stamp={s} onSelect={onSelectStamp} />
          ))}
        </div>
      </div>

      {pageCount > 1 ? <Pager page={current} pageCount={pageCount} onPage={setPage} /> : null}

      {/* Bottom-pinned verify entry, consistent with the shell's primary CTA. */}
      {onVerify ? (
        <button type="button" className={styles.cta} onClick={onVerify}>
          <span className={styles.ctaIcon}>
            <PlusIcon size={15} strokeWidth={2} />
          </span>
          <span className={styles.ctaLabel}>{verifyLabel ?? "Verify more stamps"}</span>
        </button>
      ) : null}
    </div>
  );
};
