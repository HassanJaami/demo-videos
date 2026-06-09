import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

export const Outreach: React.FC = () => {
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
        src="scoutside/screenshots/04-outreach.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        startY={0}
        endY={-15}
      />

      {/* Floating text card — bottom right */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: 60, zIndex: 10 }}>
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
            title="Connect With Coaches"
            subtitle="AI-powered outreach that helps you draft emails, improve your tone, and follow up at the right time."
            color={theme.colors.white}
            subtitleColor="rgba(255,255,255,0.65)"
          />
          <Callout label="AI-powered · Your data stays private" delay={30} bg={theme.colors.accent} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
