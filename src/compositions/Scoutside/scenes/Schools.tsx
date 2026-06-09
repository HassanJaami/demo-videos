import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

const FitBadge: React.FC<{ label: string; count: number; bg: string; delay: number }> = ({
  label,
  count,
  bg,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ fps, frame: frame - delay, config: { damping: 70, mass: 0.6 } });
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        src="scoutside/screenshots/03-schools.png"
        durationInFrames={150}
        startScale={1}
        endScale={1.04}
        startX={0}
        endX={-10}
      />

      {/* Floating text card — bottom left */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: 60, zIndex: 10 }}>
        <div
          style={{
            backgroundColor: "rgba(28,28,26,0.88)",
            borderRadius: 20,
            padding: "36px 44px",
            maxWidth: 580,
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <SceneTitle
            title="Programs Where You Align"
            subtitle="Ranked by fit — not just division or geography."
            color={theme.colors.white}
            subtitleColor="rgba(255,255,255,0.65)"
          />
          <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
            <FitBadge label="Strong Fit" count={79} bg={theme.colors.strongFit} delay={25} />
            <FitBadge label="Possible Fit" count={107} bg={theme.colors.accent} delay={35} />
            <FitBadge label="Reach" count={106} bg={theme.colors.reach} delay={45} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
