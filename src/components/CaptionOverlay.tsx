import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SCROLL_PAUSE_FRAMES } from "../lib/constants";
import { SceneCaption } from "../types/project";

interface Props {
  captions: SceneCaption[];
  durationInFrames: number;
}

export const CaptionOverlay: React.FC<Props> = ({ captions, durationInFrames }) => {
  const frame = useCurrentFrame();
  const scrollStart = SCROLL_PAUSE_FRAMES;
  const scrollEnd = durationInFrames - SCROLL_PAUSE_FRAMES;
  const scrollDuration = scrollEnd - scrollStart;
  const FADE = 10;

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
        const startFrame = scrollStart + caption.atProgress * scrollDuration;
        const endFrame =
          i < captions.length - 1
            ? scrollStart + captions[i + 1].atProgress * scrollDuration
            : scrollEnd + SCROLL_PAUSE_FRAMES;

        const opacity = interpolate(
          frame,
          [startFrame, startFrame + FADE, endFrame - FADE, endFrame],
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
