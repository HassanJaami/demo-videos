import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { buildCaptionWindows } from "../lib/scrollTimeline";
import { SceneCaption } from "../types/project";

interface Props {
  captions: SceneCaption[];
  durationInFrames: number;
}

const FADE = 8;

export const CaptionOverlay: React.FC<Props> = ({ captions, durationInFrames }) => {
  const frame = useCurrentFrame();
  const windows = buildCaptionWindows({ durationInFrames, captions });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 28,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {captions.map((caption, i) => {
        const win = windows[i];
        if (!win) return null;

        const opacity = interpolate(
          frame,
          [win.startFrame, win.startFrame + FADE, win.endFrame - FADE, win.endFrame],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (opacity === 0) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.78)",
              borderRadius: 100,
              padding: "11px 30px",
              fontSize: 22,
              fontWeight: 500,
              color: "#ffffff",
              fontFamily: "Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
              opacity,
              backdropFilter: "blur(6px)",
              letterSpacing: "0.01em",
            }}
          >
            {caption.text}
          </div>
        );
      })}
    </div>
  );
};
