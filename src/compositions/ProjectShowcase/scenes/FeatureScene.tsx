import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { FeatureSceneConfig, ProjectColors } from "../../../types/project";
import { DEFAULT_FEATURE_FRAMES } from "../../../lib/constants";

interface Props extends FeatureSceneConfig {
  colors: ProjectColors;
}

export const FeatureScene: React.FC<Props> = ({
  screenshot,
  title,
  subtitle,
  callout,
  cardAlign = "left",
  durationInFrames = DEFAULT_FEATURE_FRAMES,
  kenBurns = {},
  colors,
}) => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isLeft = cardAlign === "left";

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <KenBurns
        src={screenshot}
        durationInFrames={durationInFrames}
        startScale={kenBurns.startScale ?? 1}
        endScale={kenBurns.endScale ?? 1.04}
        endX={kenBurns.endX ?? 0}
        endY={kenBurns.endY ?? -15}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: isLeft ? "flex-start" : "flex-end",
          padding: 60,
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(28,28,26,0.88)",
            borderRadius: 20,
            padding: "36px 44px",
            maxWidth: 520,
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <SceneTitle
            title={title}
            subtitle={subtitle}
            color="#ffffff"
            subtitleColor="rgba(255,255,255,0.65)"
          />
          {callout && <Callout label={callout} delay={30} bg={colors.accent} />}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
