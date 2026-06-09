import { SceneCaption } from "../types/project";
import { CAPTION_PAUSE_FRAMES, SCROLL_PAUSE_FRAMES } from "./constants";

interface TimelineParams {
  durationInFrames: number;
  captions: SceneCaption[];
  holdFrames?: number;
  captionPauseFrames?: number;
}

/**
 * Builds multi-segment scroll keyframes for ScrollPan.
 * The scroll pauses at each caption's atProgress position so the section
 * is fully visible when the caption is shown.
 *
 * Returns parallel {frames, progresses} arrays (progresses are 0–1).
 * In ScrollPan: translateY = interpolate(frame, frames, progresses) * -maxScrollPx
 */
export function buildScrollKeyframes({
  durationInFrames,
  captions,
  holdFrames = SCROLL_PAUSE_FRAMES,
  captionPauseFrames = CAPTION_PAUSE_FRAMES,
}: TimelineParams): { frames: number[]; progresses: number[] } {
  // Unique pause positions (captions with atProgress > 0), sorted
  const pausePoints = [
    ...new Set(captions.map((c) => c.atProgress).filter((p) => p > 0)),
  ].sort((a, b) => a - b);

  const totalPauseTime = holdFrames * 2 + pausePoints.length * captionPauseFrames;
  const scrollFrames = Math.max(1, durationInFrames - totalPauseTime);

  const segments = [0, ...pausePoints, 1];
  const frames: number[] = [0];
  const progresses: number[] = [0];

  let t = holdFrames;
  frames.push(t);
  progresses.push(0);

  for (let i = 1; i < segments.length; i++) {
    const dist = segments[i] - segments[i - 1];
    const segF = Math.round(dist * scrollFrames);
    t += segF;
    frames.push(t);
    progresses.push(segments[i]);

    // Pause at this point (not after the final segment reaching 1.0)
    if (i < segments.length - 1) {
      t += captionPauseFrames;
      frames.push(t);
      progresses.push(segments[i]);
    }
  }

  // Final hold at bottom
  t += holdFrames;
  frames.push(t);
  progresses.push(1);

  return { frames, progresses };
}

/**
 * Returns the visible frame window for each caption, aligned with scroll pauses.
 * Caption at atProgress 0 → shown during the initial hold.
 * Others → shown during their pause window mid-scroll.
 */
export function buildCaptionWindows({
  durationInFrames,
  captions,
  holdFrames = SCROLL_PAUSE_FRAMES,
  captionPauseFrames = CAPTION_PAUSE_FRAMES,
}: TimelineParams): Array<{ startFrame: number; endFrame: number }> {
  const pausePoints = [
    ...new Set(captions.map((c) => c.atProgress).filter((p) => p > 0)),
  ].sort((a, b) => a - b);

  const totalPauseTime = holdFrames * 2 + pausePoints.length * captionPauseFrames;
  const scrollFrames = Math.max(1, durationInFrames - totalPauseTime);

  const segments = [0, ...pausePoints, 1];

  // Map atProgress → {startFrame, endFrame}
  const windowMap = new Map<number, { startFrame: number; endFrame: number }>();
  windowMap.set(0, { startFrame: 0, endFrame: holdFrames });

  let t = holdFrames;
  for (let i = 1; i < segments.length; i++) {
    const dist = segments[i] - segments[i - 1];
    t += Math.round(dist * scrollFrames);

    if (i < segments.length - 1) {
      windowMap.set(segments[i], { startFrame: t, endFrame: t + captionPauseFrames });
      t += captionPauseFrames;
    }
  }

  return captions.map((c) => {
    // Tolerance-based lookup in case of floating-point imprecision
    for (const [key, win] of windowMap) {
      if (Math.abs(key - c.atProgress) < 0.0001) return win;
    }
    return { startFrame: 0, endFrame: holdFrames };
  });
}
