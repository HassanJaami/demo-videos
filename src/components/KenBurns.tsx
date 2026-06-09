import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  src: string;
  durationInFrames: number;
  startScale?: number;
  endScale?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
}

export const KenBurns: React.FC<Props> = ({
  src,
  durationInFrames,
  startScale = 1,
  endScale = 1.06,
  startX = 0,
  endX = 0,
  startY = 0,
  endY = -20,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale], {
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [0, durationInFrames], [startX, endX], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, durationInFrames], [startY, endY], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
};
