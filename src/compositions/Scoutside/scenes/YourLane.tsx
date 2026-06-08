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
        marginRight: 16,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
      <span style={{ fontSize: 18, fontWeight: 600, color: theme.colors.text, fontFamily: theme.fonts.sans }}>
        {label}
      </span>
    </div>
  );
};

export const YourLane: React.FC = () => {
  const frame = useCurrentFrame();
  const screenshotOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg, flexDirection: "row" }}>
      {/* Left: text panel */}
      <div
        style={{
          width: 620,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 100,
          paddingRight: 60,
          backgroundColor: theme.colors.bg,
          zIndex: 1,
        }}
      >
        <div>
          <SceneTitle
            title="Know Your Lane"
            subtitle="See exactly where your profile fits — and why — based on real NCAA data."
          />
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Tier label="Strong Fit" color={theme.colors.strongFit} delay={25} />
            <Tier label="Possible Fit" color={theme.colors.accent} delay={35} />
            <Tier label="Reach" color={theme.colors.reach} delay={45} />
          </div>
          <Callout label="Backed by historical NCAA data" delay={55} bg={theme.colors.bgDark} />
        </div>
      </div>

      {/* Right: screenshot */}
      <div style={{ flex: 1, opacity: screenshotOpacity, overflow: "hidden" }}>
        <KenBurns
          src="scoutside/screenshots/02-your-lane.png"
          durationInFrames={150}
          startScale={1}
          endScale={1.05}
          startY={0}
          endY={-20}
        />
      </div>
    </AbsoluteFill>
  );
};
