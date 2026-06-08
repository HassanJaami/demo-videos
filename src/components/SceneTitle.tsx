import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../lib/theme";

interface Props {
  title: string;
  subtitle?: string;
  color?: string;
  subtitleColor?: string;
  delay?: number;
}

export const SceneTitle: React.FC<Props> = ({
  title,
  subtitle,
  color = theme.colors.text,
  subtitleColor = theme.colors.textMuted,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ fps, frame: frame - delay, config: { damping: 80, mass: 0.8 } });
  const subtitleOpacity = interpolate(frame, [delay + 15, delay + 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ fontFamily: theme.fonts.sans }}>
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color,
          lineHeight: 1.15,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 22,
            color: subtitleColor,
            marginTop: 14,
            lineHeight: 1.5,
            opacity: subtitleOpacity,
            maxWidth: 480,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
