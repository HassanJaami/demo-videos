import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../lib/theme";

interface Props {
  label: string;
  delay?: number;
  bg?: string;
  color?: string;
}

export const Callout: React.FC<Props> = ({
  label,
  delay = 20,
  bg = theme.colors.accent,
  color = theme.colors.white,
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
        display: "inline-block",
        marginTop: 28,
        padding: "10px 22px",
        borderRadius: 100,
        backgroundColor: bg,
        color,
        fontSize: 18,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "left center",
      }}
    >
      {label}
    </div>
  );
};
