import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { ProjectIntro } from "../ProjectShowcase/scenes/Intro";
import { ProjectOutro } from "../ProjectShowcase/scenes/Outro";
import { theme } from "../../lib/theme";
import { ProjectColors } from "../../types/project";
import { Dashboard } from "./scenes/Dashboard";
import { Outreach } from "./scenes/Outreach";
import { Schools } from "./scenes/Schools";
import { YourLane } from "./scenes/YourLane";

// Total: 750 frames @ 30fps = 25 seconds
const COLORS: ProjectColors = {
  bg: theme.colors.bg,
  bgDark: theme.colors.bgDark,
  accent: theme.colors.accent,
  text: theme.colors.text,
  textMuted: theme.colors.textMuted,
};

export const Scoutside: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={60}>
          <ProjectIntro name="scoutside" tagline="College recruiting, finally clear." colors={COLORS} />
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
          <ProjectOutro name="scoutside" cta="Your recruiting journey starts here." colors={COLORS} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
