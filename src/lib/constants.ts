import { ProjectConfig } from "../types/project";

// ── Composition timing (frames) ───────────────────────────────────────────────
export const INTRO_FRAMES = 60;
export const OUTRO_FRAMES = 90;
export const DEFAULT_FEATURE_FRAMES = 150;

// ── Scroll timing ─────────────────────────────────────────────────────────────
export const SCROLL_PAUSE_FRAMES = 30;   // hold at top/bottom before/after scrolling
export const CAPTION_PAUSE_FRAMES = 45;  // hold at each caption's scroll position

// ── Card / device entrance animation (frames) ─────────────────────────────────
export const CARD_ENTER_START = 10;
export const CARD_ENTER_END = 30;
export const DEVICE_ENTER_FRAMES = 25;

export const calculateTotalFrames = (project: ProjectConfig): number =>
  INTRO_FRAMES +
  project.features.reduce(
    (sum, f) => sum + (f.durationInFrames ?? DEFAULT_FEATURE_FRAMES),
    0
  ) +
  OUTRO_FRAMES;
