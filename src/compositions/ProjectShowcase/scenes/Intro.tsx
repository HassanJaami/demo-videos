import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ProjectColors } from "../../../types/project";

interface Props {
  name: string;
  tagline: string;
  colors: ProjectColors;
}

export const ProjectIntro: React.FC<Props> = ({ name, tagline, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 80, mass: 0.7 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [20, 45], [16, 0], {
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
          fontSize: 28,
          color: colors.textMuted,
          marginTop: 20,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
