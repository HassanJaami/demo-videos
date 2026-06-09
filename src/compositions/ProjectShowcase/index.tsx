import React from "react";
import { AbsoluteFill, Audio, interpolate, Series, staticFile, useVideoConfig } from "remotion";
import { calculateTotalFrames, DEFAULT_FEATURE_FRAMES, INTRO_FRAMES, OUTRO_FRAMES } from "../../lib/constants";
import { ProjectConfig } from "../../types/project";
import { FeatureScene } from "./scenes/FeatureScene";
import { ProjectIntro } from "./scenes/Intro";
import { ProjectOutro } from "./scenes/Outro";

export const ProjectShowcase: React.FC<ProjectConfig> = (props) => {
  const { name, tagline, cta, colors, features, music } = props;
  const { fps } = useVideoConfig();
  const totalFrames = calculateTotalFrames(props);
  const fadeOutStart = totalFrames - fps * 2;

  return (
    <AbsoluteFill>
      {music && (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) =>
            interpolate(f, [fadeOutStart, totalFrames], [0.35, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      )}
      <Series>
        <Series.Sequence durationInFrames={INTRO_FRAMES}>
          <ProjectIntro name={name} tagline={tagline} colors={colors} />
        </Series.Sequence>

        {features.map((feature, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={feature.durationInFrames ?? DEFAULT_FEATURE_FRAMES}
          >
            <FeatureScene {...feature} colors={colors} />
          </Series.Sequence>
        ))}

        <Series.Sequence durationInFrames={OUTRO_FRAMES}>
          <ProjectOutro name={name} cta={cta} colors={colors} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
