import React, { useMemo, useRef } from "react";
import styles from "./ScoreDrilldown.module.css";
import { ArrowLeftIcon, SparkIcon } from "./icons";
import { deriveTints } from "./deriveTints";
import { useAccentRgb, useCountUp, useReducedMotion } from "./hooks";

export type StampContribution = {
  /** Stable id passed back through onSelectStamp. Falls back to `label`. */
  id?: string;
  /** Short stamp label, e.g. "Government ID". */
  label: string;
  /** Points this stamp contributes to the total. */
  points: number;
};

export type ScoreDrilldownProps = {
  stamps: StampContribution[];
  /** Total shown in the ring center. Defaults to the sum of contributions. */
  total?: number;
  /** Override the accent triplet ("r, g, b"). Defaults to the resolved --accent. */
  accentRgb?: string;
  /** Return to the Score window. */
  onBack?: () => void;
  /** Fired when a breakdown segment is tapped (stamp-detail is a later slice). */
  onSelectStamp?: (stampId: string) => void;
  /** Fired by the "See all stamps" CTA. */
  onSeeAllStamps?: () => void;
};

// Ring geometry lives inside a generous viewBox that scales down to the widget
// width, so labels are always INSIDE the frame and nothing clips. The breakdown
// is the whole window now (no header), so the ring is larger.
const CX = 180;
const CY = 118;
const R = 78;
const SW = 16; // uniform stroke-width on EVERY arc: contribution shows in LENGTH only
const GAP = 8;
const C = 2 * Math.PI * R;

type Segment = {
  id: string;
  label: string;
  points: number;
  color: string;
  dash: string;
  offset: number;
  ptX: number;
  ptY: number;
  labelX: number;
  labelY: number;
  labelAnchor: "start" | "end" | "middle";
};

export const ScoreDrilldown: React.FC<ScoreDrilldownProps> = ({
  stamps,
  total,
  accentRgb,
  onBack,
  onSelectStamp,
  onSeeAllStamps,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const accent = useAccentRgb(rootRef, accentRgb);

  const sum = total ?? stamps.reduce((a, s) => a + s.points, 0);
  const counted = useCountUp(sum, 900, reduced);

  const segments = useMemo<Segment[]>(() => {
    const denom = stamps.reduce((a, s) => a + s.points, 0) || 1;
    const ranked = stamps.slice().sort((a, b) => b.points - a.points);
    const tints = deriveTints(accent, stamps.length);
    let pos = 0;
    return stamps.map((s) => {
      const rank = ranked.indexOf(s);
      const frac = s.points / denom;
      const arcLen = frac * C;
      const draw = Math.max(6, arcLen - GAP);
      const midAngle = ((pos + arcLen / 2) / C) * 2 * Math.PI - Math.PI / 2;
      const ux = Math.cos(midAngle);
      const uy = Math.sin(midAngle);
      const lr = R + SW / 2 + 12;
      const seg: Segment = {
        id: s.id ?? s.label,
        label: s.label,
        points: s.points,
        color: tints[Math.max(0, rank)],
        dash: `${draw.toFixed(2)} ${(C - draw).toFixed(2)}`,
        offset: -(pos + GAP / 2),
        ptX: CX + ux * R,
        ptY: CY + uy * R,
        labelX: CX + ux * lr,
        labelY: CY + uy * lr,
        labelAnchor: ux >= 0.15 ? "start" : ux <= -0.15 ? "end" : "middle",
      };
      pos += arcLen;
      return seg;
    });
  }, [stamps, accent]);

  return (
    <div ref={rootRef} className={styles.drilldown}>
      <div className={styles.head}>
        {onBack ? (
          <button type="button" className={styles.back} onClick={onBack}>
            <ArrowLeftIcon size={13} />
            Back to score
          </button>
        ) : (
          <span />
        )}
      </div>

      <svg className={styles.arcSvg} viewBox="0 0 360 236" role="img" aria-label={`Score breakdown, total ${sum}`}>
        {/* faint track the arcs sit on */}
        <circle className={styles.track} cx={CX} cy={CY} r={R} />

        <g className={reduced ? "" : styles.resolveIn}>
          {segments.map((seg, i) => (
            <g
              key={`${seg.id}-${i}`}
              className={onSelectStamp ? styles.segment : undefined}
              role={onSelectStamp ? "button" : undefined}
              tabIndex={onSelectStamp ? 0 : undefined}
              aria-label={onSelectStamp ? `${seg.label}, ${seg.points} points. Open stamp.` : undefined}
              onClick={onSelectStamp ? () => onSelectStamp(seg.id) : undefined}
              onKeyDown={
                onSelectStamp
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectStamp(seg.id);
                      }
                    }
                  : undefined
              }
            >
              <circle
                className={styles.arc}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={SW}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`}
                strokeDasharray={seg.dash}
                strokeDashoffset={seg.offset}
              />
              <text
                className={styles.arcPt}
                x={seg.ptX.toFixed(1)}
                y={seg.ptY.toFixed(1)}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {seg.points}
              </text>
              <text
                className={styles.arcLabel}
                x={seg.labelX.toFixed(1)}
                y={seg.labelY.toFixed(1)}
                textAnchor={seg.labelAnchor}
                dominantBaseline="middle"
              >
                {seg.label}
              </text>
            </g>
          ))}
        </g>

        <text className={styles.total} x={CX} y={CY} textAnchor="middle" dominantBaseline="central">
          {Math.round(counted)}
        </text>
      </svg>

      <button type="button" className={styles.seeAll} onClick={onSeeAllStamps}>
        <SparkIcon size={15} strokeWidth={1.9} />
        See all stamps
      </button>
    </div>
  );
};
