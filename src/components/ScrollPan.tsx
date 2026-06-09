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

interface Props {
  src: string;
  durationInFrames: number;
  containerWidth: number;
  containerHeight: number;
  /** Frames to hold at top and bottom before/after scrolling. Default: 20 */
  pauseFrames?: number;
}

export const ScrollPan: React.FC<Props> = ({
  src,
  durationInFrames,
  containerWidth,
  containerHeight,
  pauseFrames = 20,
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

  // Displayed height when image fills containerWidth at natural aspect ratio
  const displayedHeight = Math.round((dims.height / dims.width) * containerWidth);
  const maxScroll = Math.max(0, displayedHeight - containerHeight);

  const scrollStart = pauseFrames;
  const scrollEnd = durationInFrames - pauseFrames;

  const translateY = interpolate(
    frame,
    [0, scrollStart, scrollEnd, durationInFrames],
    [0, 0, -maxScroll, -maxScroll],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
