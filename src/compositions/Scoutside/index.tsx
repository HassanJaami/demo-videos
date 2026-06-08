import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Dashboard } from "./scenes/Dashboard";
import { Intro } from "./scenes/Intro";
import { Outreach } from "./scenes/Outreach";
import { Outro } from "./scenes/Outro";
import { Schools } from "./scenes/Schools";
import { YourLane } from "./scenes/YourLane";

// Total: 750 frames @ 30fps = 25 seconds
// Intro: 60 | Dashboard: 150 | YourLane: 150 | Schools: 150 | Outreach: 150 | Outro: 90

export const Scoutside: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={60}>
          <Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <Dashboard />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <YourLane />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <Schools />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <Outreach />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
