import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  x: number;      // 0–1 fraction of video width
  y: number;      // 0–1 fraction of video height
  width: number;  // 0–1 fraction of video width
  height: number; // 0–1 fraction of video height
  color?: string;
  durationInFrames: number;
}

export const HighlightBox: React.FC<Props> = ({
  x, y, width, height, color = "#0066ff", durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width: vw, height: vh } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const pulse  = 0.8 + 0.2 * Math.sin((frame / 35) * Math.PI);
  const opacity = fadeIn * pulse;

  const px = x * vw;
  const py = y * vh;
  const pw = width  * vw;
  const ph = height * vh;
  const corner = 14; // corner marker length in px

  const lineStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: color,
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20, opacity }}>
      {/* full border rect */}
      <div style={{
        position: "absolute",
        left: px, top: py, width: pw, height: ph,
        border: `2px solid ${color}`,
        borderRadius: 6,
        boxShadow: `0 0 18px ${color}88`,
      }} />

      {/* corner markers — top-left */}
      <div style={{ ...lineStyle, left: px - 2,          top: py - 2,          width: corner, height: 4 }} />
      <div style={{ ...lineStyle, left: px - 2,          top: py - 2,          width: 4,      height: corner }} />
      {/* top-right */}
      <div style={{ ...lineStyle, left: px + pw - corner + 2, top: py - 2,    width: corner, height: 4 }} />
      <div style={{ ...lineStyle, left: px + pw - 2,     top: py - 2,          width: 4,      height: corner }} />
      {/* bottom-left */}
      <div style={{ ...lineStyle, left: px - 2,          top: py + ph - 2,     width: corner, height: 4 }} />
      <div style={{ ...lineStyle, left: px - 2,          top: py + ph - corner + 2, width: 4, height: corner }} />
      {/* bottom-right */}
      <div style={{ ...lineStyle, left: px + pw - corner + 2, top: py + ph - 2, width: corner, height: 4 }} />
      <div style={{ ...lineStyle, left: px + pw - 2,     top: py + ph - corner + 2, width: 4, height: corner }} />
    </div>
  );
};
