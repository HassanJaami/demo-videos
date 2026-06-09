import React from "react";
import { AbsoluteFill } from "remotion";
import { KenBurns } from "../../../components/KenBurns";
import { TextCard } from "../../../components/TextCard";
import { useCardAnimation, usePopIn } from "../../../lib/animations";
import { theme } from "../../../lib/theme";

const FitBadge: React.FC<{ label: string; count: number; bg: string; delay: number }> = ({
  label,
  count,
  bg,
  delay,
}) => {
  const { scale, opacity } = usePopIn(delay);
  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 12,
        padding: "12px 20px",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, color: theme.colors.white, fontFamily: theme.fonts.sans }}>
        {count}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: theme.fonts.sans, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
};

export const Schools: React.FC = () => {
  const { cardOpacity, cardY } = useCardAnimation();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <KenBurns
        src="scoutside/screenshots/03-schools.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        endX={-10}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: 60, zIndex: 10 }}>
        <TextCard
          title="Programs Where You Align"
          subtitle="Ranked by fit — not just division or geography."
          maxWidth={580}
          opacity={cardOpacity}
          cardY={cardY}
        >
          <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
            <FitBadge label="Strong Fit" count={79} bg={theme.colors.strongFit} delay={25} />
            <FitBadge label="Possible Fit" count={107} bg={theme.colors.accent} delay={35} />
            <FitBadge label="Reach" count={106} bg={theme.colors.reach} delay={45} />
          </div>
        </TextCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
