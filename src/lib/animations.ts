import { interpolate, spring, SpringConfig, useCurrentFrame, useVideoConfig } from "remotion";

export const useFadeIn = (startFrame = 0, duration = 20) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const useSlideUp = (startFrame = 0, config?: Partial<SpringConfig>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ fps, frame: frame - startFrame, config: { damping: 80, ...config } });
  return interpolate(progress, [0, 1], [40, 0]);
};

export const useScale = (startFrame = 0, config?: Partial<SpringConfig>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ fps, frame: frame - startFrame, config: { damping: 100, ...config } });
};
