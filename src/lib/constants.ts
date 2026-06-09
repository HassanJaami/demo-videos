import { ProjectConfig } from "../types/project";

export const INTRO_FRAMES = 60;
export const OUTRO_FRAMES = 90;
export const DEFAULT_FEATURE_FRAMES = 150;

export const calculateTotalFrames = (project: ProjectConfig): number =>
  INTRO_FRAMES +
  project.features.reduce(
    (sum, f) => sum + (f.durationInFrames ?? DEFAULT_FEATURE_FRAMES),
    0
  ) +
  OUTRO_FRAMES;
