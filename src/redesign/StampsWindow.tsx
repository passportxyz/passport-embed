import React, { useMemo, useState } from "react";
import styles from "./StampsWindow.module.css";
import { CaretDownIcon, LinkIcon, PlusIcon, StarIcon } from "./icons";
import { useReducedMotion } from "./hooks";
import type { ShellSize } from "./PassportShell";

/**
 * On-chain state of a stamp, carried by ONE signal (the corner pip):
 *  - "minted"   the stamp is recorded on-chain (emerald chain pip)
 *  - "mintable" the stamp can be minted on-chain (gold chain pip)
 *  - "none"     the stamp lives off-chain (muted, recessive pip)
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
  /** Badges per page before it paginates. Defaults to 6 (full) / 3 (mini). */
  pageSize?: number;
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

// Kept small so a page never renders more medallion rows than the shell's fixed
// height holds (each category becomes its own row, so few-item categories add up
// fast). Stories that show a denser single page pass an explicit larger pageSize.
const DEFAULT_PAGE_SIZE: Record<ShellSize, number> = { full: 4, mini: 3, pill: 3 };

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

/** Group a page's stamps by category, preserving first-appearance order. */
const groupByCategory = (items: Stamp[]): Array<{ category: string; stamps: Stamp[] }> => {
  const order: string[] = [];
  const map = new Map<string, Stamp[]>();
  for (const s of items) {
    if (!map.has(s.category)) {
      map.set(s.category, []);
      order.push(s.category);
    }
    map.get(s.category)!.push(s);
  }
  return order.map((category) => ({ category, stamps: map.get(category)! }));
};

/**
 * A single glass medallion: a rim + embossed face carrying the stamp icon, a
 * corner on-chain pip, and a points chip. Verified vs not is carried by the face
 * / rim tone; on-chain by the pip; points by the chip. One signal per meaning.
 */
const Medallion: React.FC<{ stamp: Stamp; compact?: boolean }> = ({ stamp, compact }) => (
  <span
    className={`${styles.medallion} ${compact ? styles.medallionSm : ""}`}
    data-verified={stamp.verified ? "true" : "false"}
    data-onchain={stamp.onchain}
  >
    <span className={styles.face}>
      <span className={styles.glyph} aria-hidden="true">
        {stamp.icon ?? <StarIcon size={compact ? 15 : 20} strokeWidth={1.6} />}
      </span>
    </span>
    {/* On-chain pip: the ONE carrier of on-chain state. Glyph only when it relates
        to the chain (minted / mintable); "none" is a recessive muted disc. */}
    <span className={styles.pip} aria-hidden="true">
      {stamp.onchain === "none" ? null : <LinkIcon size={compact ? 8 : 9} strokeWidth={2} />}
    </span>
    <span className={styles.points}>+{stamp.points}</span>
  </span>
);

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
 * StampsWindow - the medallion catalog, rendered INSIDE PassportShell like the
 * Score window. Stamps are glass plaques grouped by category, paginated and never
 * scrolled (§4 / §Windows). Presentational: props only, no data hooks, both-theme
 * legible, reduced-motion aware. Tapping a badge fires onSelectStamp; the detail
 * drawer is a later slice.
 */
export const StampsWindow: React.FC<StampsWindowProps> = ({
  stamps,
  onSelectStamp,
  onVerify,
  verifyLabel,
  pageSize,
  headline,
  emptyLabel,
  loading = false,
  size = "full",
}) => {
  const [page, setPage] = useState(0);
  const per = pageSize ?? DEFAULT_PAGE_SIZE[size];
  const compact = size !== "full";

  const pages = useMemo(() => paginate(stamps, per), [stamps, per]);
  const pageCount = pages.length;
  const current = Math.min(page, pageCount - 1);
  const pageStamps = pages[current] ?? [];
  const groups = useMemo(() => groupByCategory(pageStamps), [pageStamps]);

  const verifiedCount = useMemo(() => stamps.filter((s) => s.verified).length, [stamps]);

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
        {compact ? (
          // mini stays simpler: one flat grid, no category headers, so the
          // half-size card keeps to a single medallion row per page.
          <div className={styles.grid}>
            {pageStamps.map((s) => (
              <button
                type="button"
                key={s.id}
                className={styles.badge}
                onClick={() => onSelectStamp?.(s.id)}
                aria-label={stampLabel(s)}
              >
                <Medallion stamp={s} compact />
                <span className={styles.name}>{s.name}</span>
              </button>
            ))}
          </div>
        ) : (
          groups.map((group) => (
            <div className={styles.group} key={group.category}>
              {/* Category header: tonal text + space, no hard line (§ no-hard-lines). */}
              <div className={styles.catHead}>{group.category}</div>
              <div className={styles.grid}>
                {group.stamps.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className={styles.badge}
                    onClick={() => onSelectStamp?.(s.id)}
                    aria-label={stampLabel(s)}
                  >
                    <Medallion stamp={s} />
                    <span className={styles.name}>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {pageCount > 1 ? <Pager page={current} pageCount={pageCount} onPage={setPage} /> : null}

      {/* Bottom-pinned verify entry, consistent with the shell's primary CTA. mini
          stays simpler and drops it to keep the half-size card uncluttered. */}
      {onVerify && !compact ? (
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
