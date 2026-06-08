import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

export const Schools: React.FC = () => {
  const frame = useCurrentFrame();

  const overlayOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <KenBurns
        src="scoutside/screenshots/03-schools.png"
        durationInFrames={150}
        startScale={1.04}
        endScale={1.08}
        startX={0}
        endX={-20}
        startY={0}
        endY={-10}
      />

      {/* Gradient overlay on right for text */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to left, rgba(245,241,236,0.97) 38%, rgba(245,241,236,0.6) 60%, transparent 80%)`,
          opacity: overlayOpacity,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-end",
          paddingRight: 100,
          opacity: overlayOpacity,
        }}
      >
        <div style={{ textAlign: "right", maxWidth: 520 }}>
          <SceneTitle
            title="Programs Where You Align"
            subtitle="Personalized matches ranked by fit — not just geography or division."
          />
          <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
            <Callout label="79 Strong Fit" delay={25} bg={theme.colors.strongFit} />
            <Callout label="107 Possible Fit" delay={35} bg={theme.colors.accent} />
            <Callout label="106 Reach" delay={45} bg={theme.colors.reach} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
