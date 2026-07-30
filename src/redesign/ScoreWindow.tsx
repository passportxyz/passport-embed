import React, { useEffect, useRef, useState } from "react";
import styles from "./ScoreWindow.module.css";
import { Tooltip } from "../components/Tooltip";
import { CheckIcon, RetryIcon, ShieldIcon, StarIcon } from "./icons";
import { useCountUp, useReducedMotion } from "./hooks";

export type ScoreWindowState = "loading" | "below" | "verified" | "error";

export type ScoreWindowProps = {
  state: ScoreWindowState;
  /** Current humanity score (below / verified states). */
  score?: number;
  /** Passing threshold — the single source of truth for it comes from score data. */
  threshold?: number;
  /** Exponent tap — toggles to the drill-down (SOP §4). */
  onDrilldown?: () => void;
  /** Primary CTA handler. */
  onPrimaryAction?: () => void;
  /** Override the default per-state CTA label. */
  primaryActionLabel?: string;
  /** Retry handler for the error state. */
  onRetry?: () => void;
  /** Humanized error copy (never a raw error.message — SOP §5). */
  errorMessage?: string;
  /** Override the default per-state headline. */
  headline?: string;
  /** Override the default per-state subtext. */
  subtext?: string;
};

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const COUNT_MS = 1000;

/** True circular progress ring (SVG stroke-dashoffset), tokenized track + accent stroke. */
const ScoreRing: React.FC<{
  fill: number; // 0..1
  celebrate?: boolean;
  reduced: boolean;
  children: React.ReactNode;
}> = ({ fill, celebrate, reduced, children }) => {
  const target = Math.max(0, Math.min(1, fill));
  const [offset, setOffset] = useState(reduced ? RING_CIRCUMFERENCE * (1 - target) : RING_CIRCUMFERENCE);

  useEffect(() => {
    if (reduced) {
      setOffset(RING_CIRCUMFERENCE * (1 - target));
      return;
    }
    // start empty, then animate to target on next frame so the transition runs
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
          className={styles.ringProgress}
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

/** On-brand loader: a token-driven ring that traces itself. No bare spinner (SOP §5). */
const CraftedLoader: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <div className={styles.ringWrap}>
    <svg className={`${styles.ringSvg} ${reduced ? "" : styles.loaderSpin}`} viewBox="0 0 150 150" aria-hidden="true">
      <circle className={styles.ringTrack} cx="75" cy="75" r={RING_RADIUS} />
      <circle
        className={styles.loaderArc}
        cx="75"
        cy="75"
        r={RING_RADIUS}
        transform="rotate(-90 75 75)"
        strokeDasharray={`${RING_CIRCUMFERENCE * 0.28} ${RING_CIRCUMFERENCE}`}
      />
    </svg>
    <div className={styles.ringNum}>
      <ShieldIcon className={styles.loaderMark} size={26} />
    </div>
  </div>
);

const Exponent: React.FC<{
  variant: "q" | "ok";
  tooltip: React.ReactNode;
  onClick?: () => void;
}> = ({ variant, tooltip, onClick }) => (
  <Tooltip content={tooltip} placement="top">
    <button
      type="button"
      className={`${styles.exp} ${variant === "ok" ? styles.expOk : styles.expQ}`}
      aria-label={variant === "ok" ? "Verified — see how your score is computed" : "See how your score is computed"}
      onClick={onClick}
    >
      {variant === "ok" ? <CheckIcon size={9} strokeWidth={3} /> : "?"}
    </button>
  </Tooltip>
);

export const ScoreWindow: React.FC<ScoreWindowProps> = ({
  state,
  score = 0,
  threshold = 20,
  onDrilldown,
  onPrimaryAction,
  primaryActionLabel,
  onRetry,
  errorMessage = "We couldn't reach your score right now. Please try again.",
  headline,
  subtext,
}) => {
  const reduced = useReducedMotion();
  const toGo = Math.max(0, Math.ceil(threshold - score));
  const fill = threshold > 0 ? score / threshold : 0;
  const counted = useCountUp(score, COUNT_MS, reduced || state === "loading" || state === "error");
  const shownScore = Math.round(counted);

  if (state === "loading") {
    return (
      <div className={styles.window}>
        <CraftedLoader reduced={reduced} />
        <p className={styles.headline}>{headline ?? "Checking your score"}</p>
        <p className={styles.sub}>{subtext ?? "Verifying your onchain activity…"}</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={styles.window}>
        <div className={styles.errorBadge} aria-hidden="true">
          <RetryIcon size={22} />
        </div>
        <p className={styles.headline}>{headline ?? "Something went wrong"}</p>
        <p className={styles.sub} role="alert">
          {errorMessage}
        </p>
        <button type="button" className={styles.cta} onClick={onRetry}>
          <RetryIcon className={styles.ctaIcon} size={15} strokeWidth={2} />
          {primaryActionLabel ?? "Try again"}
        </button>
      </div>
    );
  }

  const verified = state === "verified";

  return (
    <div className={styles.window}>
      <p className={styles.srOnly} aria-live="polite">
        Score {Math.round(score)} of {threshold}. {verified ? "Above the threshold." : `${toGo} to go.`}
      </p>

      {verified ? (
        <div className={styles.seal} aria-hidden="true">
          <CheckIcon size={16} strokeWidth={2.4} />
        </div>
      ) : null}

      <ScoreRing fill={verified ? 1 : fill} celebrate={verified} reduced={reduced}>
        <span className={styles.scoreWrap}>
          <span className={styles.count}>{shownScore}</span>
          {verified ? null : <small className={styles.outOf}>/{threshold}</small>}
          <Exponent
            variant={verified ? "ok" : "q"}
            onClick={onDrilldown}
            tooltip={
              verified
                ? "verified · above the threshold · tap to see how it's computed"
                : `${toGo} to go to reach the threshold · tap to see how it's computed`
            }
          />
        </span>
      </ScoreRing>

      <p className={styles.headline}>{headline ?? (verified ? "You're verified" : "Almost verified")}</p>

      {verified ? (
        <p className={styles.sub}>
          {subtext ?? (
            <>
              <b>Score {Math.round(score)}</b> · above the threshold
            </>
          )}
        </p>
      ) : (
        <div className={styles.toGo}>
          <span className={styles.toGoBar}>
            <i style={{ width: `${Math.min(100, fill * 100)}%` }} />
          </span>
          <span className={styles.toGoLabel}>{toGo} to go</span>
        </div>
      )}

      <button type="button" className={styles.cta} onClick={onPrimaryAction}>
        {verified ? (
          <CheckIcon className={styles.ctaIcon} size={15} strokeWidth={2} />
        ) : (
          <StarIcon className={styles.ctaIcon} size={15} strokeWidth={2} />
        )}
        {primaryActionLabel ?? (verified ? "Continue" : "Add verifications")}
      </button>
    </div>
  );
};
