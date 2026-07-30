import React from "react";
import styles from "./ScoreWindow.module.css";
import glass from "./glassTip.module.css";
import { Tooltip } from "../components/Tooltip";
import { CheckIcon, LinkIcon, PlusIcon, RetryIcon } from "./icons";
import { useCountUp, useReducedMotion } from "./hooks";
import { humanizeError, ErrorKind } from "./humanizeError";
import { Cryptex, CryptexSize } from "./vendor/cryptex/Cryptex";
import type { ShellSize } from "./PassportShell";

export type ScoreWindowState = "loading" | "below" | "verified" | "error";

/** A dev-configurable call to action. Omit `onClick` to leave it inert; set
 *  `hidden` to drop it from the action area entirely. */
export type ShellCta = {
  label?: string;
  onClick?: () => void;
  hidden?: boolean;
};

export type ScoreWindowProps = {
  state: ScoreWindowState;
  /** Current humanity score (below / verified states). */
  score?: number;
  /** Passing threshold. The single source of truth for it comes from score data. */
  threshold?: number;
  /** Tap the score (ring / number) to open the drill-down. */
  onDrilldown?: () => void;

  /** Below-threshold action area, CTA 1: add stamps / verifications. */
  addVerificationsCta?: ShellCta;
  /** Below-threshold action area, CTA 2: link an identity (a wallet / account)
   *  to import reputation. Present in the onboarding / below-threshold flow,
   *  dev-invokable. */
  linkIdentityCta?: ShellCta;

  /** Verified hand-off CTA (Continue back to the host app). */
  onContinue?: () => void;
  /** Override the verified hand-off CTA label. */
  continueLabel?: string;

  /** Retry handler for the error state. */
  onRetry?: () => void;
  /** Error kind, or the thrown value, mapped to friendly copy (never a raw
   *  error.message). */
  errorKind?: ErrorKind;
  error?: unknown;
  /** Optional explicit override of the humanized error message. */
  errorMessage?: string;

  /** Override the default per-state headline. */
  headline?: string;
  /** Override the default per-state subtext. */
  subtext?: string;

  /**
   * Size variant, mirrors the shell's. `full` (default) is the crafted card;
   * `mini` is a condensed ~half-size card; `pill` is a compact single-row pill
   * (mark + score + one action). Pass the SAME value you pass to PassportShell.
   */
  size?: ShellSize;
};

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const COUNT_MS = 1000;

/** Cryptex size + ring pixel size per shell size variant. */
const CRYPTEX_SIZE: Record<ShellSize, CryptexSize> = { full: "lg", mini: "md", pill: "sm" };

/** True circular progress ring. Emerald at or above the threshold, amber below. */
const ScoreRing: React.FC<{
  fill: number; // 0..1
  passing: boolean;
  celebrate?: boolean;
  reduced: boolean;
  children: React.ReactNode;
}> = ({ fill, passing, celebrate, reduced, children }) => {
  const target = Math.max(0, Math.min(1, fill));
  const [offset, setOffset] = React.useState(reduced ? RING_CIRCUMFERENCE * (1 - target) : RING_CIRCUMFERENCE);

  React.useEffect(() => {
    if (reduced) {
      setOffset(RING_CIRCUMFERENCE * (1 - target));
      return;
    }
    setOffset(RING_CIRCUMFERENCE);
    const raf = requestAnimationFrame(() => setOffset(RING_CIRCUMFERENCE * (1 - target)));
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return (
    <div className={`${styles.ringWrap} ${celebrate ? styles.celebrate : ""}`}>
      {celebrate ? <span className={styles.ringGlow} aria-hidden="true" /> : null}
      <svg className={styles.ringSvg} viewBox="0 0 150 150" aria-hidden="true">
        <circle className={styles.ringTrack} cx="75" cy="75" r={RING_RADIUS} />
        <circle
          className={`${styles.ringProgress} ${passing ? styles.ringPass : styles.ringWarn}`}
          cx="75"
          cy="75"
          r={RING_RADIUS}
          transform="rotate(-90 75 75)"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.ringNum}>{children}</div>
    </div>
  );
};

/**
 * The score-loading state now renders the REAL shared Cryptex loader
 * (`@holonym-foundation/ui`, vendored under ./vendor/cryptex until the package
 * is installable). A cipher of hex + brand marks orbiting the Human Passport
 * mark, resolving as the score settles. Not a bespoke spinner.
 */
const CryptexLoader: React.FC<{ size: ShellSize }> = ({ size }) => (
  <div className={styles.ringWrap}>
    <Cryptex variant="passport" field size={CRYPTEX_SIZE[size]} label="Checking your score" />
  </div>
);

/** One action button. Emerald primary or tonal secondary. All action buttons
 *  share ONE box metric (full width, same height + padding); only color differs. */
const ActionButton: React.FC<{
  variant: "primary" | "secondary";
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ variant, onClick, icon, children }) => (
  <button
    type="button"
    className={`${styles.cta} ${variant === "secondary" ? styles.ctaSecondary : ""}`}
    onClick={onClick}
  >
    <span className={styles.ctaIcon}>{icon}</span>
    <span className={styles.ctaLabel}>{children}</span>
  </button>
);

export const ScoreWindow: React.FC<ScoreWindowProps> = ({
  state,
  score = 0,
  threshold = 20,
  onDrilldown,
  addVerificationsCta,
  linkIdentityCta,
  onContinue,
  continueLabel,
  onRetry,
  errorKind,
  error,
  errorMessage,
  headline,
  subtext,
  size = "full",
}) => {
  const reduced = useReducedMotion();
  const toGo = Math.max(0, Math.ceil(threshold - score));
  const fill = threshold > 0 ? score / threshold : 0;
  const counted = useCountUp(score, COUNT_MS, reduced || state === "loading" || state === "error");
  const shownScore = Math.round(counted);
  const compact = size !== "full";
  const winClass = `${styles.window} ${size === "mini" ? styles.miniWin : ""} ${size === "pill" ? styles.pillWin : ""}`;

  if (state === "loading") {
    return (
      <div className={winClass}>
        <CryptexLoader size={size} />
        {size === "pill" ? (
          <p className={styles.headline}>{headline ?? "Checking your score"}</p>
        ) : (
          <>
            <p className={styles.headline}>{headline ?? "Checking your score"}</p>
            <p className={styles.sub}>{subtext ?? "This only takes a moment."}</p>
          </>
        )}
      </div>
    );
  }

  if (state === "error") {
    const human = humanizeError(errorKind ?? error);
    const title = headline ?? human.title;
    const message = errorMessage ?? subtext ?? human.message;
    return (
      <div className={winClass}>
        <div className={styles.errorBadge} aria-hidden="true">
          <RetryIcon size={22} />
        </div>
        <p className={styles.headline}>{title}</p>
        <p className={styles.sub} role="alert">
          {message}
        </p>
        {human.retryable && onRetry ? (
          <ActionButton variant="primary" onClick={onRetry} icon={<RetryIcon size={15} strokeWidth={2} />}>
            Try again
          </ActionButton>
        ) : null}
      </div>
    );
  }

  const verified = state === "verified";
  const roundedScore = Math.round(score);

  // The score (ring + number) is itself the hover / tap target: the tooltip
  // tells the user the state and that they can tap to see how it is computed.
  const ringTip = verified ? (
    <>
      Verified and above the threshold. <em>Tap to see how it&rsquo;s computed.</em>
    </>
  ) : (
    <>
      {toGo} more to reach the threshold. <em>Tap to see how it&rsquo;s computed.</em>
    </>
  );
  const ringLabel = verified
    ? "Verified and above the threshold. Tap to see how your score is computed."
    : `${toGo} more to reach the threshold. Tap to see how your score is computed.`;

  const addCta = addVerificationsCta ?? {};
  const idCta = linkIdentityCta ?? {};

  const ringButton = (
    <Tooltip content={ringTip} placement="top" className={glass.tip}>
      <button type="button" className={styles.ringButton} onClick={onDrilldown} aria-label={ringLabel}>
        <ScoreRing fill={verified ? 1 : fill} passing={verified} celebrate={verified && !compact} reduced={reduced}>
          <span className={styles.scoreWrap}>
            <span className={styles.count}>{shownScore}</span>
            {verified ? null : <small className={styles.outOf}>/{threshold}</small>}
          </span>
        </ScoreRing>
      </button>
    </Tooltip>
  );

  // ---- pill: one compact horizontal row (mark/score + label + one action) ----
  if (size === "pill") {
    return (
      <div className={winClass}>
        <p className={styles.srOnly} aria-live="polite">
          Score {roundedScore} of {threshold}. {verified ? "Above the threshold." : `${toGo} to go.`}
        </p>
        {ringButton}
        <span className={styles.pillText}>{headline ?? (verified ? "Verified" : `${toGo} to go`)}</span>
        {verified ? (
          <button type="button" className={`${styles.cta} ${styles.ctaInline}`} onClick={onContinue}>
            <span className={styles.ctaIcon}>
              <CheckIcon size={14} strokeWidth={2} />
            </span>
            <span className={styles.ctaLabel}>{continueLabel ?? "Continue"}</span>
          </button>
        ) : addCta.hidden ? null : (
          <button type="button" className={`${styles.cta} ${styles.ctaInline}`} onClick={addCta.onClick}>
            <span className={styles.ctaIcon}>
              <PlusIcon size={14} strokeWidth={2} />
            </span>
            <span className={styles.ctaLabel}>{addCta.label ?? "Verify"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={winClass}>
      <p className={styles.srOnly} aria-live="polite">
        Score {roundedScore} of {threshold}. {verified ? "Above the threshold." : `${toGo} to go.`}
      </p>

      {ringButton}

      {verified ? (
        <>
          <div className={`${styles.verifiedLine} ${reduced ? styles.verifiedLineStatic : ""}`}>
            {/* The external seal / check now sits inline with the headline, and
                animates in together with the text. Its tooltip carries the
                "Score N. Above the threshold" detail, and it is tappable. */}
            <Tooltip
              content={
                <>
                  <b>Score {roundedScore}.</b> Above the threshold. <em>Tap to see how it&rsquo;s computed.</em>
                </>
              }
              placement="top"
              className={glass.tip}
            >
              <button
                type="button"
                className={styles.inlineSeal}
                onClick={onDrilldown}
                aria-label={`Score ${roundedScore}. Above the threshold. Tap to see how it's computed.`}
              >
                <CheckIcon size={14} strokeWidth={2.6} />
              </button>
            </Tooltip>
            <span className={styles.verifiedText}>{headline ?? "You're verified"}</span>
          </div>

          <button type="button" className={styles.cta} onClick={onContinue}>
            <span className={styles.ctaIcon}>
              <CheckIcon size={15} strokeWidth={2} />
            </span>
            <span className={styles.ctaLabel}>{continueLabel ?? "Continue"}</span>
          </button>
        </>
      ) : (
        <>
          <p className={styles.headline}>{headline ?? "Almost verified"}</p>
          {compact ? null : <p className={styles.sub}>{subtext ?? "You need a little more to pass."}</p>}

          {compact ? null : (
            <div className={styles.toGo}>
              <span className={styles.toGoBar}>
                <i style={{ width: `${Math.min(100, fill * 100)}%` }} />
              </span>
              <span className={styles.toGoLabel}>{toGo} to go</span>
            </div>
          )}

          <div className={styles.actions}>
            {addCta.hidden ? null : (
              <ActionButton
                variant="primary"
                onClick={addCta.onClick}
                icon={<PlusIcon size={15} strokeWidth={2} />}
              >
                {addCta.label ?? "Add verifications"}
              </ActionButton>
            )}
            {/* mini keeps only the primary action so it stays half-size. */}
            {compact || idCta.hidden ? null : (
              <ActionButton
                variant="secondary"
                onClick={idCta.onClick}
                icon={<LinkIcon size={15} strokeWidth={1.9} />}
              >
                {idCta.label ?? "Link an identity"}
              </ActionButton>
            )}
          </div>
        </>
      )}
    </div>
  );
};
