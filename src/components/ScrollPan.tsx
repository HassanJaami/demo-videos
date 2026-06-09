import { getImageDimensions } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import {
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SCROLL_PAUSE_FRAMES } from "../lib/constants";
import { buildScrollKeyframes } from "../lib/scrollTimeline";
import { SceneCaption } from "../types/project";

interface Props {
  src: string;
  durationInFrames: number;
  containerWidth: number;
  containerHeight: number;
  captions?: SceneCaption[];
  pauseFrames?: number;
}

export const ScrollPan: React.FC<Props> = ({
  src,
  durationInFrames,
  containerWidth,
  containerHeight,
  captions,
  pauseFrames = SCROLL_PAUSE_FRAMES,
}) => {
  const frame = useCurrentFrame();
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const [handle] = useState(() => delayRender("ScrollPan: reading image dimensions"));

  useEffect(() => {
    getImageDimensions(staticFile(src)).then((d) => {
      setDims(d);
      continueRender(handle);
    });
  }, [src, handle]);

  if (!dims) return null;

  const displayedHeight = Math.round((dims.height / dims.width) * containerWidth);
  const maxScroll = Math.max(0, displayedHeight - containerHeight);

  let translateY: number;

  if (captions && captions.length > 0) {
    // Pause at each caption's scroll position so sections are fully visible
    const { frames, progresses } = buildScrollKeyframes({
      durationInFrames,
      captions,
      holdFrames: pauseFrames,
    });
    const progress = interpolate(frame, frames, progresses, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    translateY = progress * -maxScroll;
  } else {
    // Smooth linear scroll (no captions / backward compat)
    translateY = interpolate(
      frame,
      [0, pauseFrames, durationInFrames - pauseFrames, durationInFrames],
      [0, 0, -maxScroll, -maxScroll],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: containerWidth,
          height: displayedHeight,
          display: "block",
          transform: `translateY(${translateY}px)`,
        }}
      />
    </div>
  );
};
