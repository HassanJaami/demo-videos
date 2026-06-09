import React from "react";
import { AbsoluteFill } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { TextCard } from "../../../components/TextCard";
import { useCardAnimation, usePopIn } from "../../../lib/animations";
import { theme } from "../../../lib/theme";

const Tier: React.FC<{ label: string; color: string; delay: number }> = ({ label, color, delay }) => {
  const { scale, opacity } = usePopIn(delay);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginRight: 20,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
      <span style={{ fontSize: 18, fontWeight: 600, color: theme.colors.white, fontFamily: theme.fonts.sans }}>
        {label}
      </span>
    </div>
  );
};

export const YourLane: React.FC = () => {
  const { cardOpacity, cardY } = useCardAnimation();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <KenBurns
        src="scoutside/screenshots/02-your-lane.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        endY={-15}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: 60, zIndex: 10 }}>
        <TextCard
          title="Know Your Lane"
          subtitle="See exactly where your profile fits — and why — based on real NCAA data."
          callout="Backed by historical NCAA data"
          accentColor={theme.colors.accent}
          calloutDelay={55}
          opacity={cardOpacity}
          cardY={cardY}
        >
          <div style={{ marginTop: 28, display: "flex" }}>
            <Tier label="Strong Fit" color={theme.colors.strongFit} delay={25} />
            <Tier label="Possible Fit" color={theme.colors.accent} delay={35} />
            <Tier label="Reach" color={theme.colors.reach} delay={45} />
          </div>
        </TextCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
