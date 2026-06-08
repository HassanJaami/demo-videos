import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 80, mass: 0.7 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [20, 40], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.bgDark,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: theme.fonts.sans,
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: theme.colors.white,
          letterSpacing: "-2px",
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        scoutside
      </div>
      <div
        style={{
          fontSize: 24,
          color: theme.colors.accent,
          marginTop: 24,
          fontWeight: 500,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        Your recruiting journey starts here.
      </div>
    </AbsoluteFill>
  );
};
