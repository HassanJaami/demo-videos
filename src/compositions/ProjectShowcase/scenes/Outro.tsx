import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ProjectColors } from "../../../types/project";

interface Props {
  name: string;
  cta: string;
  colors: ProjectColors;
}

export const ProjectOutro: React.FC<Props> = ({ name, cta, colors }) => {
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
        backgroundColor: colors.bgDark,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-2px",
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 24,
          color: colors.accent,
          marginTop: 24,
          fontWeight: 500,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};
