import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Intro } from "./scenes/Intro";

export const Scoutside: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <Intro />
        </Series.Sequence>
        {/* More scenes will be added once screenshots are shared */}
      </Series>
    </AbsoluteFill>
  );
};
