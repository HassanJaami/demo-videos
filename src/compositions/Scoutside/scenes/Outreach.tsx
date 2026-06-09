import React from "react";
import { AbsoluteFill } from "remotion";
import { KenBurns } from "../../../components/KenBurns";
import { TextCard } from "../../../components/TextCard";
import { useCardAnimation } from "../../../lib/animations";
import { theme } from "../../../lib/theme";

export const Outreach: React.FC = () => {
  const { cardOpacity, cardY } = useCardAnimation();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <KenBurns
        src="scoutside/screenshots/04-outreach.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        endY={-15}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: 60, zIndex: 10 }}>
        <TextCard
          title="Connect With Coaches"
          subtitle="AI-powered outreach that helps you draft emails, improve your tone, and follow up at the right time."
          callout="AI-powered · Your data stays private"
          accentColor={theme.colors.accent}
          opacity={cardOpacity}
          cardY={cardY}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
