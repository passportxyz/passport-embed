/**
 * Stamp expiry helpers.
 *
 * Every Human Passport stamp expires as a whole: the score endpoint returns a
 * per-stamp `expiration_date`, and the default credential lifetime is 90 days.
 * These helpers turn that ISO date into plain, dash-free copy for the drawer
 * header ("Valid for N days" / "Expires {date}" / "Expired") and a compact form
 * for the grid medallion chip ("88d" / "8d" / "Expired").
 */

export type ExpiryState = "valid" | "soon" | "expired";

export type ExpiryInfo = {
  state: ExpiryState;
  /** Whole days remaining (0 once expired). */
  days: number;
  /** Full phrasing for the drawer header. */
  long: string;
  /** Compact phrasing for the grid medallion chip. */
  short: string;
};

/** Below this many days remaining, a stamp reads as "expiring soon" (amber). */
const SOON_DAYS = 14;
const DAY_MS = 86_400_000;

/**
 * Format a stamp's expiry. Returns null when no date is supplied. `now` is
 * injectable so tests / stories can pin a reference point.
 */
export const formatExpiry = (iso?: string, now: Date = new Date()): ExpiryInfo | null => {
  if (!iso) return null;
  const exp = new Date(iso);
  if (Number.isNaN(exp.getTime())) return null;

  const days = Math.ceil((exp.getTime() - now.getTime()) / DAY_MS);
  if (days <= 0) {
    return { state: "expired", days: 0, long: "Expired", short: "Expired" };
  }

  const date = exp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days <= SOON_DAYS) {
    return { state: "soon", days, long: `Expires ${date}`, short: `${days}d` };
  }
  return { state: "valid", days, long: `Valid for ${days} days`, short: `${days}d` };
};

/** ISO date string N days from `from` (default now). Keeps mock expiry copy stable. */
export const daysFromNow = (n: number, from: Date = new Date()): string =>
  new Date(from.getTime() + n * DAY_MS).toISOString();
