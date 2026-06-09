import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { DEFAULT_FEATURE_FRAMES, INTRO_FRAMES, OUTRO_FRAMES } from "../../lib/constants";
import { ProjectConfig } from "../../types/project";
import { FeatureScene } from "./scenes/FeatureScene";
import { ProjectIntro } from "./scenes/Intro";
import { ProjectOutro } from "./scenes/Outro";

export const ProjectShowcase: React.FC<ProjectConfig> = (props) => {
  const { name, tagline, cta, colors, features } = props;

  return (
    <AbsoluteFill>
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
