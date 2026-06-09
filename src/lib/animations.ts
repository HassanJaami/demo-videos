import { interpolate, spring, SpringConfig, useCurrentFrame, useVideoConfig } from "remotion";
import { CARD_ENTER_END, CARD_ENTER_START, DEVICE_ENTER_FRAMES } from "./constants";

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

// Returns opacity + translateY for the floating glass card entrance.
export const useCardAnimation = () => {
  const frame = useCurrentFrame();
  return {
    cardOpacity: interpolate(frame, [CARD_ENTER_START, CARD_ENTER_END], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    cardY: interpolate(frame, [CARD_ENTER_START, CARD_ENTER_END], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};

// Returns opacity + translateY for a device frame entering from below.
export const useDeviceAnimation = () => {
  const frame = useCurrentFrame();
  return {
    deviceY: interpolate(frame, [0, DEVICE_ENTER_FRAMES], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    deviceOpacity: interpolate(frame, [0, DEVICE_ENTER_FRAMES - 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};

// Spring scale-in + fade-in, used for badges, callouts, and inline annotations.
export const usePopIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return {
    scale: spring({ fps, frame: frame - delay, config: { damping: 70, mass: 0.6 } }),
    opacity: interpolate(frame, [delay, delay + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};
