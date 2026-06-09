import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      {/* Full screenshot */}
      <KenBurns
        src="scoutside/screenshots/01-landing.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        endY={-10}
      />

      {/* Floating text card — bottom left */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: 60, zIndex: 10 }}>
        <div
          style={{
            backgroundColor: "rgba(28,28,26,0.88)",
            borderRadius: 20,
            padding: "36px 44px",
            maxWidth: 520,
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <SceneTitle
            title="Your Recruiting Dashboard"
            subtitle="Personalized insights based on your profile, position, and graduation year."
            color={theme.colors.white}
            subtitleColor="rgba(255,255,255,0.65)"
          />
          <Callout label="428 matched programs" delay={30} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
