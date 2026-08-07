import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./WalletLinking.module.css";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  InfoIcon,
  LinkIcon,
  WaaPIcon,
  WalletIcon,
} from "./icons";
import { useReducedMotion } from "./hooks";
import type { ShellSize } from "./PassportShell";

/**
 * WalletLinking - the wallet-linking flow as a standalone popup WINDOW, not an
 * in-shell drawer. In production this flow arrives from the Shield SDK as its own
 * popup window, so the embed presents it the same way: each step renders as a
 * centered ModalCard (its own rounded bezel + header with back / close +
 * elevation) floating over a scrim that dims the passport widget behind it (the
 * HTDS ModalCard placement="center" pattern), NOT the StampDetailDrawer in-shell
 * takeover. It is rendered in-frame (disablePortal-style) so it stays inside the
 * widget area and fits the 360x600 iframe. It drives a local state machine across
 * the linking steps. Presentational: the real wallet connect / sign happen via
 * callback props (consistent with the embed's callback architecture); stories
 * mock them.
 *
 * Reproduces the HTDS wallet-linking design (walletLinkingShared.tsx) in the
 * redesign token system - NOT vendored from @holonym-foundation/ui. One consistent
 * internal padding means no element crowds the bezel and every CTA aligns flush
 * with it. Every screen fits the fixed shell height and the 360x600 wallet iframe
 * with no clip / scroll, bottom CTA always visible, full + mini, both themes
 * (design-sop §9).
 */

/** The step machine (single SIWE signature, silk#895). */
export type WalletLinkStep =
  | "picker"
  | "connecting"
  | "sign"
  | "pending"
  | "success"
  | "error409"
  | "errorGeneric"
  | "unlinkConfirm"
  | "unlinkScheduled"
  | "relinkBlocked";

/** Wallet types offered by the picker (order matches HTDS). */
export type WalletLinkKind = "waap" | "browser" | "walletconnect" | "sui";

/** Compact wallet descriptor for chips + link graphic. */
export type LinkWalletInfo = {
  /** Full address (used as the accessible / copy value). */
  address: string;
  /** Short display, e.g. "0x9A3…c81". Falls back to a truncation of `address`. */
  display?: string;
  /** Which ecosystem glyph to show. Defaults to ethereum. */
  ecosystem?: "ethereum" | "solana" | "sui";
};

/** One gain shown on the success screen ("Added to your account"). */
export type LinkGain = {
  id: string;
  icon?: React.ReactNode;
  label: string;
};

export type WalletLinkingProps = {
  /** Whether the overlay is shown. Default true. */
  open?: boolean;
  /**
   * Size variant. `full` (default) and `mini` are supported; `pill` has no
   * header chrome, so the flow is not offered there.
   */
  size?: Exclude<ShellSize, "pill">;
  /**
   * Controlled step. When provided the overlay renders exactly this state (used
   * by the per-state stories). Omit to run the internal state machine from
   * `initialStep`.
   */
  step?: WalletLinkStep;
  /** Starting step when uncontrolled. Default "picker". */
  initialStep?: WalletLinkStep;

  /** The wallet being linked (sign / success / conflict chip, and unlink). */
  wallet?: LinkWalletInfo;
  /** The conflicting wallet for the 409 state. */
  conflictWallet?: LinkWalletInfo;
  /** Days remaining in the cooldown (relink blocked). Default 22. */
  cooldownDaysRemaining?: number;
  /** Length of the unlink cooldown in days. Default 30. */
  cooldownDays?: number;
  /**
   * ISO date the cooldown lifts. Copy names a DATE rather than making the user
   * do arithmetic on a duration. Omit to compute it from `cooldownDays`; stories
   * pin it so the rendered date does not drift day to day.
   */
  cooldownEndsAt?: string;
  /** Auto-detected browser wallet label, e.g. "MetaMask". Shown on the browser row. */
  detectedWalletLabel?: string;

  /**
   * Passport-branded: the wallet's Unique Humanity Score contribution shown in
   * emerald on the success screen (e.g. "+1.4"). Omit to hide it.
   */
  scoreContribution?: string;
  /** Gains list on the success screen. Falls back to a sensible demo set. */
  gains?: LinkGain[];

  /**
   * Connect the chosen wallet. May be async; a throw routes to the generic error
   * state. Real wallet connect lives here (mocked in stories).
   */
  connect?: (kind: WalletLinkKind) => Promise<void> | void;
  /**
   * Collect the single SIWE signature. May be async; a throw routes to the
   * generic error state. Real signing lives here (mocked in stories).
   */
  sign?: () => Promise<void> | void;

  /** Back / close the flow (returns to the account view). */
  onClose?: () => void;
  /** Success "Done". */
  onDone?: () => void;
  /** Confirm the unlink (start the 30 day cooldown). */
  onConfirmUnlink?: () => void;
  /** Notified on every internal step transition. */
  onStepChange?: (step: WalletLinkStep) => void;
};

const DEFAULT_GAINS: LinkGain[] = [
  { id: "stamps", label: "5 stamps" },
  { id: "points", label: "250 Human Points" },
  { id: "cred", label: "Clean Hands credential" },
];

/** Truncate a full address for display: "0x9A3…c81". */
function shortAddr(addr: string): string {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 5)}…${addr.slice(-3)}`;
}

const DAY_MS = 86_400_000;

/**
 * The day the cooldown lifts, as "Sep 6". Every cooldown string names a date
 * rather than a duration: "30 days" makes the user hold today's date and do the
 * arithmetic, and a wallet they cannot relink is exactly the moment not to.
 * Matches the phrasing shape in `expiry.ts` and stays dash free.
 */
function cooldownEndLabel(days: number, endsAt?: string, now: Date = new Date()): string {
  const end = endsAt ? new Date(endsAt) : new Date(now.getTime() + days * DAY_MS);
  if (Number.isNaN(end.getTime())) return "";
  return end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Flow-local glyphs (currentColor, both themes). Reproduced here, not
   vendored: trivial marks for the picker + status bullets. ── */

const G: React.FC<{ size?: number; children: React.ReactNode; fill?: boolean }> = ({
  size = 20,
  children,
  fill,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill ? "currentColor" : "none"}
    stroke={fill ? "none" : "currentColor"}
    // 2px on the 24 box, matching Lucide and `icons.tsx` (design-sop §7.5).
    // These glyphs sit beside imported icons on the same screen, so a different
    // weight here reads as two icon sets.
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    vectorEffect={fill ? undefined : "non-scaling-stroke"}
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const WalletConnectMark: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size} fill>
    <path d="M6 10.5c3.3-3.3 8.7-3.3 12 0l.5.5-2 2-.5-.5c-2.2-2.2-5.8-2.2-8 0l-.5.5-2-2 .5-.5zM3 13.5l2 2 4 4 3-3 3 3 4-4 2-2-2-2-4 4-3-3-3 3-4-4-2 2z" />
  </G>
);

const SuiMark: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size} fill>
    <path d="M12 2C8 8 6 11 6 14.5A6 6 0 0 0 18 14.5C18 11 16 8 12 2Z" />
  </G>
);

const SolanaMark: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size} fill>
    <path d="M6 5h13l-3 3H3l3-3z" opacity="0.9" />
    <path d="M6 10.5h13l-3 3H3l3-3z" opacity="0.7" />
    <path d="M6 16h13l-3 3H3l3-3z" opacity="0.9" />
  </G>
);

const AlertGlyph: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </G>
);

const BanGlyph: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6l12.8 12.8" />
  </G>
);

const CalendarGlyph: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </G>
);

const CloseGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <G size={size}>
    <path d="M6 6l12 12M18 6L6 18" />
  </G>
);

/** Ethereum diamond (currentColor), for the ethereum ecosystem chip glyph. */
const EthGlyph: React.FC<{ size?: number }> = ({ size }) => (
  <G size={size} fill>
    <path d="M12 2 5.5 12.3l6.5 3.9 6.5-3.9L12 2Z" opacity="0.9" />
    <path d="M12 17.6l-6.5-3.9L12 22l6.5-8.3-6.5 3.9Z" opacity="0.6" />
  </G>
);

function ecosystemGlyph(eco: LinkWalletInfo["ecosystem"], size?: number): React.ReactNode {
  if (eco === "solana") return <SolanaMark size={size} />;
  if (eco === "sui") return <SuiMark size={size} />;
  return <EthGlyph size={size} />;
}

/* ── Indeterminate loader (reused arc, same spirit as ScoreWindow). ── */

const Loader: React.FC<{ px: number }> = ({ px }) => {
  const reduced = useReducedMotion();
  return (
    <span className={styles.loaderWrap} role="status" aria-label="Working">
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={reduced ? undefined : styles.spin}
      >
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(var(--muted), 0.25)" strokeWidth="4" />
        <path
          d="M24 4 a20 20 0 0 1 20 20"
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
};

/* ── Wallet chip (icon circle + short address + ecosystem sub-glyph). ── */

const WalletChip: React.FC<{
  wallet: LinkWalletInfo;
  icon?: React.ReactNode;
  block?: boolean;
}> = ({ wallet, icon, block }) => (
  <span className={`${styles.chip} ${block ? styles.chipBlock : ""}`}>
    <span className={styles.chipIcon} aria-hidden="true">
      {icon ?? <WalletIcon size={15} />}
      <span className={styles.chipChain} aria-hidden="true">
        {ecosystemGlyph(wallet.ecosystem, 10)}
      </span>
    </span>
    <span className={styles.chipLabel}>{wallet.display ?? shortAddr(wallet.address)}</span>
  </span>
);

/** The WaaP account chip (the account wallets link TO). */
const WaapChip: React.FC<{ block?: boolean }> = ({ block }) => (
  <span className={`${styles.chip} ${styles.chipWaap} ${block ? styles.chipBlock : ""}`}>
    <span className={styles.chipIcon} aria-hidden="true">
      <WaaPIcon size={16} />
    </span>
    <span className={styles.chipLabel}>your WaaP account</span>
  </span>
);

/* ── Picker row (NavListItem look: tinted icon + title + subtitle + chevron). ── */

const ChevronGlyph: React.FC = () => (
  <G size={18}>
    <path d="M9 6l6 6-6 6" />
  </G>
);

type PickerTint = "accent" | "orange" | "sky" | "purple" | "muted";

const PickerRow: React.FC<{
  icon: React.ReactNode;
  tint: PickerTint;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ icon, tint, title, subtitle, trailing, disabled, onClick }) => (
  <button
    type="button"
    className={`${styles.row} ${disabled ? styles.rowDisabled : ""}`}
    onClick={disabled ? undefined : onClick}
    aria-disabled={disabled || undefined}
  >
    <span className={`${styles.rowIcon} ${styles[`tint-${tint}`]}`} aria-hidden="true">
      {icon}
    </span>
    <span className={styles.rowMeta}>
      <span className={styles.rowTitle}>{title}</span>
      <span className={styles.rowSub}>{subtitle}</span>
    </span>
    {trailing ? <span className={styles.rowTrailing}>{trailing}</span> : null}
    {!disabled ? (
      <span className={styles.rowChevron} aria-hidden="true">
        <ChevronGlyph />
      </span>
    ) : null}
  </button>
);

/* ── Status bullet (icon circle + text), for unlink / relink consequences. ── */

type BulletTint = "danger" | "warn" | "muted";

const Bullet: React.FC<{ icon: React.ReactNode; tint: BulletTint; children: React.ReactNode }> = ({
  icon,
  tint,
  children,
}) => (
  <span className={styles.bullet}>
    <span className={`${styles.bulletIcon} ${styles[`bullet-${tint}`]}`} aria-hidden="true">
      {icon}
    </span>
    <span className={styles.bulletText}>{children}</span>
  </span>
);

/* ── Title per step. ── */
const STEP_TITLE: Record<WalletLinkStep, string> = {
  picker: "Link a wallet",
  connecting: "Link a wallet",
  sign: "Sign with your wallet",
  pending: "Link a wallet",
  success: "Wallet linked",
  error409: "Link a wallet",
  errorGeneric: "Link a wallet",
  unlinkConfirm: "Unlink this wallet?",
  unlinkScheduled: "Wallet unlinked",
  relinkBlocked: "Link a wallet",
};

export const WalletLinking: React.FC<WalletLinkingProps> = ({
  open = true,
  size = "full",
  step: controlledStep,
  initialStep = "picker",
  wallet,
  conflictWallet,
  cooldownDaysRemaining = 22,
  cooldownDays = 30,
  cooldownEndsAt,
  detectedWalletLabel,
  scoreContribution,
  gains,
  connect,
  sign,
  onClose,
  onDone,
  onConfirmUnlink,
  onStepChange,
}) => {
  const controlled = controlledStep !== undefined;
  const [internal, setInternal] = useState<WalletLinkStep>(controlledStep ?? initialStep);
  const step = controlled ? (controlledStep as WalletLinkStep) : internal;
  const runId = useRef(0);

  useEffect(() => {
    if (controlled) setInternal(controlledStep as WalletLinkStep);
  }, [controlled, controlledStep]);

  const go = useCallback(
    (next: WalletLinkStep) => {
      if (!controlled) setInternal(next);
      onStepChange?.(next);
    },
    [controlled, onStepChange]
  );

  // Escape closes the flow while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Drive the linking machine: connect -> sign -> pending -> success. A throw in
  // either callback routes to the generic error state. Controlled stories skip
  // this (each state is pinned via the `step` prop).
  const runLink = useCallback(
    async (kind: WalletLinkKind) => {
      if (controlled) return;
      const id = ++runId.current;
      try {
        go("connecting");
        await connect?.(kind);
        if (id !== runId.current) return;
        go("sign");
        await sign?.();
        if (id !== runId.current) return;
        go("pending");
        // Brief settle before the backend confirms (mocked; real verify is async).
        await new Promise((r) => setTimeout(r, 700));
        if (id !== runId.current) return;
        go("success");
      } catch {
        if (id !== runId.current) return;
        go("errorGeneric");
      }
    },
    [controlled, connect, sign, go]
  );

  const loaderPx = size === "mini" ? 44 : 64;
  const gainList = gains ?? DEFAULT_GAINS;

  // The date the cooldown lifts, for the confirm screen (full cooldown ahead)
  // and the relink-blocked screen (part of it already served).
  const cooldownEnd = cooldownEndLabel(cooldownDays, cooldownEndsAt);
  const relinkDate = cooldownEndLabel(cooldownDaysRemaining, cooldownEndsAt);

  // Confirming an unlink must land somewhere. Previously this fired the callback
  // and left the user on the confirm screen with no acknowledgement, which is the
  // no-dead-ends rule (design-sop §5, PASSPORT-STATE-01) broken.
  const confirmUnlink = useCallback(() => {
    onConfirmUnlink?.();
    if (!controlled) go("unlinkScheduled");
  }, [onConfirmUnlink, controlled, go]);

  // The header back affordance returns to the picker mid-flow, else exits.
  const midFlow =
    step === "connecting" || step === "sign" || step === "pending" || step === "errorGeneric";
  const onBack = useCallback(() => {
    if (midFlow && !controlled) {
      runId.current++; // cancel any in-flight run
      go("picker");
    } else {
      onClose?.();
    }
  }, [midFlow, controlled, go, onClose]);

  if (!open) return null;

  let bodyEl: React.ReactNode = null;

  if (step === "picker") {
    bodyEl = (
      <div className={styles.list}>
        <PickerRow
          icon={<WaaPIcon size={20} />}
          tint="accent"
          title="Another WaaP wallet"
          subtitle="Link a second WaaP account you own"
          onClick={() => runLink("waap")}
        />
        <PickerRow
          icon={<WalletIcon size={20} />}
          tint="orange"
          title="Browser wallet"
          subtitle={
            detectedWalletLabel
              ? `${detectedWalletLabel} detected, plus other installed wallets`
              : "MetaMask, Rabby and other installed wallets"
          }
          onClick={() => runLink("browser")}
        />
        <PickerRow
          icon={<WalletConnectMark size={20} />}
          tint="sky"
          title="WalletConnect"
          subtitle="Mobile and desktop wallets via QR"
          onClick={() => runLink("walletconnect")}
        />
        <PickerRow
          icon={<SuiMark size={18} />}
          tint="sky"
          title="Sui wallet"
          subtitle="Sui ecosystem wallets"
          onClick={() => runLink("sui")}
        />
        <PickerRow
          icon={<SolanaMark size={18} />}
          tint="purple"
          title="Solana wallet"
          subtitle="Phantom and Solana wallets"
          trailing={<span className={styles.soon}>Soon</span>}
          disabled
        />
      </div>
    );
  } else if (step === "connecting" || step === "sign" || step === "pending") {
    const copy =
      step === "connecting"
        ? { title: "Waiting for wallet", desc: "Approve the connection request in your wallet." }
        : step === "sign"
          ? { title: "Sign with your wallet", desc: "Sign the message in your wallet to prove you own it." }
          : { title: "Verifying signature", desc: "This usually takes a few seconds." };
    bodyEl = (
      <div className={styles.center}>
        <Loader px={loaderPx} />
        <span className={styles.centerTitle}>{copy.title}</span>
        <span className={styles.centerDesc}>{copy.desc}</span>
        {step === "sign" && wallet ? <WalletChip wallet={wallet} /> : null}
      </div>
    );
  } else if (step === "success") {
    const graphic = (
      <div className={styles.linkGraphic} aria-label="Wallet linked to your WaaP account">
        {wallet ? <WalletChip wallet={wallet} /> : null}
        <span className={styles.linkGlyph} aria-hidden="true">
          <LinkIcon size={16} />
        </span>
        <WaapChip />
      </div>
    );
    const scoreRow = scoreContribution ? (
      <span className={styles.scoreRow}>
        <span className={styles.scoreValue}>{scoreContribution}</span>
        <span className={styles.scoreLabel}>Unique Humanity Score</span>
      </span>
    ) : null;

    // Mini condenses to graphic + a one-line gains summary + score + Done, so the
    // fixed half-height shell never clips the bottom CTA.
    bodyEl =
      size === "mini" ? (
        <div className={styles.success}>
          {graphic}
          <span className={styles.miniSummary}>{gainList.map((g) => g.label).join(" · ")}</span>
          {scoreRow}
          <button type="button" className={`${styles.cta} ${styles.successCta}`} onClick={onDone}>
            Done
          </button>
        </div>
      ) : (
        <div className={styles.success}>
          {graphic}
          <div className={styles.gainsCard}>
            <span className={styles.gainsLabel}>Added to your account</span>
            <div className={styles.gainsList}>
              {gainList.map((g) => (
                <span key={g.id} className={styles.gainRow}>
                  <span className={styles.gainIcon} aria-hidden="true">
                    {g.icon ?? <CheckIcon size={14} />}
                  </span>
                  <span className={styles.gainText}>{g.label}</span>
                </span>
              ))}
            </div>
            {scoreRow}
          </div>
          <span className={styles.confirmRow} aria-hidden="true">
            <span className={styles.confirmCheck}>
              <CheckIcon size={14} strokeWidth={2.4} />
            </span>
          </span>
          <button type="button" className={styles.cta} onClick={onDone}>
            Done
          </button>
        </div>
      );
  } else if (step === "error409") {
    bodyEl = (
      <div className={styles.center}>
        <span className={`${styles.bigIcon} ${styles.bigIconDanger}`} aria-hidden="true">
          <AlertGlyph size={size === "mini" ? 20 : 30} />
        </span>
        <span className={styles.centerTitle}>Wallet already linked</span>
        <span className={styles.centerDesc}>This wallet is already linked to another account.</span>
        {conflictWallet ? (
          <div className={styles.centerChip}>
            <WalletChip wallet={conflictWallet} />
          </div>
        ) : null}
        <button type="button" className={`${styles.cta} ${styles.ctaSecondary}`} onClick={onBack}>
          Try a different wallet
        </button>
      </div>
    );
  } else if (step === "errorGeneric") {
    const mini = size === "mini";
    bodyEl = (
      <div className={styles.center}>
        <span className={`${styles.bigIcon} ${styles.bigIconDanger}`} aria-hidden="true">
          <AlertGlyph size={mini ? 20 : 30} />
        </span>
        <span className={styles.centerTitle}>Linking failed</span>
        <span className={styles.centerDesc}>Something went wrong. No changes were made to your account.</span>
        {/* Mini shares the two actions on one row so the shorter card keeps both
            fully visible (matches the unlink-confirm mini pattern). */}
        <div className={`${styles.actionStack} ${mini ? styles.actionRow : ""}`}>
          <button
            type="button"
            className={styles.cta}
            onClick={() => (wallet ? runLink("browser") : go("picker"))}
          >
            Try again
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaSecondary}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  } else if (step === "unlinkConfirm") {
    const mini = size === "mini";
    bodyEl = (
      <div className={styles.confirm}>
        {wallet ? <WalletChip wallet={wallet} block /> : null}
        <div className={styles.bullets}>
          <Bullet icon={<AlertGlyph size={16} />} tint="danger">
            Stamps and points stop counting.
          </Bullet>
          <Bullet icon={<ClockIcon size={16} />} tint="warn">
            You can relink it from {cooldownEnd}, {cooldownDays} days from now.
          </Bullet>
          <Bullet icon={<BanGlyph size={16} />} tint="muted">
            Applies across all your accounts.
          </Bullet>
        </div>
        <div className={`${styles.actionStack} ${mini ? styles.actionRow : ""}`}>
          <button type="button" className={`${styles.cta} ${styles.ctaDanger}`} onClick={confirmUnlink}>
            {mini ? "Unlink" : "Unlink wallet"}
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaSecondary}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  } else if (step === "unlinkScheduled") {
    bodyEl = (
      <div className={styles.center}>
        <span className={`${styles.bigIcon} ${styles.bigIconMuted}`} aria-hidden="true">
          <ClockIcon size={size === "mini" ? 20 : 30} />
        </span>
        {/* The header already says the wallet is unlinked, so the title carries
            the next fact instead of repeating it. Each line adds something. */}
        <span className={styles.centerTitle}>Cooldown started</span>
        <span className={styles.centerDesc}>
          Its stamps and points no longer count toward your score.
        </span>
        {wallet ? (
          <div className={styles.centerChip}>
            <WalletChip wallet={wallet} />
          </div>
        ) : null}
        <span className={styles.centerNote}>You can link this wallet again from {cooldownEnd}.</span>
        <button type="button" className={styles.cta} onClick={onDone ?? onClose}>
          Done
        </button>
      </div>
    );
  } else if (step === "relinkBlocked") {
    bodyEl = (
      <div className={styles.confirm}>
        {wallet ? <WalletChip wallet={wallet} block /> : null}
        <div className={styles.bullets}>
          <Bullet icon={<ClockIcon size={16} />} tint="warn">
            This wallet was unlinked recently.
          </Bullet>
          <Bullet icon={<CalendarGlyph size={16} />} tint="warn">
            You can link it again from {relinkDate}.
          </Bullet>
          <Bullet icon={<InfoIcon size={16} />} tint="muted">
            {cooldownDaysRemaining} days left in the cooldown.
          </Bullet>
        </div>
        <div className={styles.actionStack}>
          <button type="button" className={`${styles.cta} ${styles.ctaSecondary}`} onClick={onBack}>
            Try a different wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.overlay}
      data-open={open ? "true" : "false"}
      data-size={size}
      role="dialog"
      aria-modal="true"
      aria-label={STEP_TITLE[step]}
    >
      {/* Scrim: dims + blurs the passport window behind. Clicking it closes the
          popup (same as the header close), so it reads as a true modal window. */}
      <button
        type="button"
        className={styles.scrim}
        onClick={onClose}
        aria-label="Close"
        tabIndex={-1}
      />
      {/* Card: the floating popup window with its own bezel, header, and padding. */}
      <div className={styles.card}>
        <header className={styles.head}>
          <button type="button" className={styles.headBtn} onClick={onBack} aria-label="Back">
            <ArrowLeftIcon size={16} />
          </button>
          <h2 className={styles.headTitle}>{STEP_TITLE[step]}</h2>
          <button type="button" className={styles.headBtn} onClick={onClose} aria-label="Close">
            <CloseGlyph size={16} />
          </button>
        </header>
        <div className={styles.body}>{bodyEl}</div>
      </div>
    </div>
  );
};
