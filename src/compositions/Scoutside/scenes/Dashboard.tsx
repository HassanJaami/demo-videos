import React from "react";
import { AbsoluteFill } from "remotion";
import { KenBurns } from "../../../components/KenBurns";
import { TextCard } from "../../../components/TextCard";
import { useCardAnimation } from "../../../lib/animations";
import { theme } from "../../../lib/theme";

export const Dashboard: React.FC = () => {
  const { cardOpacity, cardY } = useCardAnimation();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <KenBurns
        src="scoutside/screenshots/01-landing.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        endY={-10}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: 60, zIndex: 10 }}>
        <TextCard
          title="Your Recruiting Dashboard"
          subtitle="Personalized insights based on your profile, position, and graduation year."
          callout="428 matched programs"
          accentColor={theme.colors.accent}
          opacity={cardOpacity}
          cardY={cardY}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
