import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

const Tier: React.FC<{ label: string; color: string; delay: number }> = ({ label, color, delay }) => {
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
        src="scoutside/screenshots/02-your-lane.png"
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
            title="Know Your Lane"
            subtitle="See exactly where your profile fits — and why — based on real NCAA data."
            color={theme.colors.white}
            subtitleColor="rgba(255,255,255,0.65)"
          />
          <div style={{ marginTop: 28, display: "flex" }}>
            <Tier label="Strong Fit" color={theme.colors.strongFit} delay={25} />
            <Tier label="Possible Fit" color={theme.colors.accent} delay={35} />
            <Tier label="Reach" color={theme.colors.reach} delay={45} />
          </div>
          <Callout label="Backed by historical NCAA data" delay={55} bg={theme.colors.accent} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
