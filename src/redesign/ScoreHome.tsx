import React, { useState } from "react";
import { ScoreWindow, ScoreWindowProps } from "./ScoreWindow";
import { ScoreDrilldown, StampContribution } from "./ScoreDrilldown";

export type ScoreHomeProps = Omit<ScoreWindowProps, "onDrilldown"> & {
  /** Contribution breakdown shown when the score is tapped. */
  stamps: StampContribution[];
  /** Start on the drill-down (stories / deep-link). */
  defaultView?: "score" | "drilldown";
  /** Fired when a breakdown segment is tapped (stamp-detail is a later slice). */
  onSelectStamp?: (stampId: string) => void;
  /** Fired by the "See all stamps" CTA in the drill-down. */
  onSeeAllStamps?: () => void;
};

/**
 * ScoreHome - thin presentational connector that toggles between the Score
 * window and its drill-down when the score is tapped. Holds only local view
 * state (no data hooks), so it stays fully storybookable.
 */
export const ScoreHome: React.FC<ScoreHomeProps> = ({
  stamps,
  defaultView = "score",
  onSelectStamp,
  onSeeAllStamps,
  ...scoreProps
}) => {
  const [view, setView] = useState<"score" | "drilldown">(defaultView);

  if (view === "drilldown") {
    return (
      <ScoreDrilldown
        stamps={stamps}
        total={scoreProps.score}
        onBack={() => setView("score")}
        onSelectStamp={onSelectStamp}
        onSeeAllStamps={onSeeAllStamps}
      />
    );
  }

  return <ScoreWindow {...scoreProps} onDrilldown={() => setView("drilldown")} />;
};
