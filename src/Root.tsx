import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { ProjectShowcase } from "./compositions/ProjectShowcase";
import { calculateTotalFrames } from "./lib/constants";
import { projects } from "./projects.config";
import { ProjectConfig } from "./types/project";

type Props = Record<string, unknown>;

const getMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: calculateTotalFrames(props as unknown as ProjectConfig),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {projects.map((project) => (
        <Composition
          key={project.id}
          id={project.id}
          component={ProjectShowcase as unknown as React.ComponentType<Props>}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={project as unknown as Props}
          calculateMetadata={getMetadata}
        />
      ))}
    </>
  );
};
