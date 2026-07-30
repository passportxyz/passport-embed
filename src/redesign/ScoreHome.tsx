import React, { useState } from "react";
import { ScoreWindow, ScoreWindowProps } from "./ScoreWindow";
import { ScoreDrilldown, StampContribution } from "./ScoreDrilldown";

export type ScoreHomeProps = Omit<ScoreWindowProps, "onDrilldown"> & {
  /** Contribution breakdown shown when the exponent is tapped. */
  stamps: StampContribution[];
  /** Start on the drill-down (stories / deep-link). */
  defaultView?: "score" | "drilldown";
};

/**
 * ScoreHome — thin presentational connector that toggles between the Score
 * window and its drill-down when the stateful exponent is tapped (SOP §4). Holds
 * only local view state (no data hooks), so it stays fully storybookable (§3).
 */
export const ScoreHome: React.FC<ScoreHomeProps> = ({ stamps, defaultView = "score", ...scoreProps }) => {
  const [view, setView] = useState<"score" | "drilldown">(defaultView);

  if (view === "drilldown") {
    return <ScoreDrilldown stamps={stamps} total={scoreProps.score} onBack={() => setView("score")} />;
  }

  return <ScoreWindow {...scoreProps} onDrilldown={() => setView("drilldown")} />;
};
