import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { LAPTOP_SCREEN, LaptopFrame } from "../../../components/LaptopFrame";
import { MOBILE_SCREEN, MobileFrame } from "../../../components/MobileFrame";
import { ScrollPan } from "../../../components/ScrollPan";
import { SceneTitle } from "../../../components/SceneTitle";
import { DEFAULT_FEATURE_FRAMES } from "../../../lib/constants";
import { FeatureSceneConfig, ProjectColors } from "../../../types/project";

interface Props extends FeatureSceneConfig {
  colors: ProjectColors;
}

export const FeatureScene: React.FC<Props> = ({
  screenshot,
  title,
  subtitle,
  callout,
  cardAlign = "left",
  device = "none",
  scroll = false,
  durationInFrames = DEFAULT_FEATURE_FRAMES,
  kenBurns = {},
  colors,
}) => {
  const frame = useCurrentFrame();
  const { width: videoWidth, height: videoHeight } = useVideoConfig();

  const cardOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deviceY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deviceOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isLeft = cardAlign === "left";

  // Resolve container dimensions for ScrollPan
  const containerDims =
    device === "laptop"
      ? LAPTOP_SCREEN
      : device === "mobile"
        ? MOBILE_SCREEN
        : { width: videoWidth, height: videoHeight };

  // Screenshot content — scroll pan or KenBurns
  const screenshotContent = scroll ? (
    <ScrollPan
      src={screenshot}
      durationInFrames={durationInFrames}
      containerWidth={containerDims.width}
      containerHeight={containerDims.height}
    />
  ) : (
    <KenBurns
      src={screenshot}
      durationInFrames={durationInFrames}
      startScale={kenBurns.startScale ?? 1}
      endScale={kenBurns.endScale ?? (device === "none" ? 1.04 : 1.02)}
      endX={kenBurns.endX ?? 0}
      endY={kenBurns.endY ?? (device === "none" ? -15 : 0)}
    />
  );

  // --- Full-bleed mode ---
  if (device === "none") {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.bg }}>
        {screenshotContent}
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: isLeft ? "flex-start" : "flex-end",
            padding: 60,
            zIndex: 10,
          }}
        >
          <TextCard
            title={title}
            subtitle={subtitle}
            callout={callout}
            accentColor={colors.accent}
            cardOpacity={cardOpacity}
            cardY={cardY}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // --- Device frame mode ---
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `translateY(${deviceY}px)`,
          opacity: deviceOpacity,
        }}
      >
        {device === "laptop" ? (
          <LaptopFrame>{screenshotContent}</LaptopFrame>
        ) : (
          <MobileFrame>{screenshotContent}</MobileFrame>
        )}
      </div>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: isLeft ? "flex-start" : "flex-end",
          padding: 60,
          zIndex: 10,
        }}
      >
        <TextCard
          title={title}
          subtitle={subtitle}
          callout={callout}
          accentColor={colors.accent}
          cardOpacity={cardOpacity}
          cardY={cardY}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TextCard: React.FC<{
  title: string;
  subtitle: string;
  callout?: string;
  accentColor: string;
  cardOpacity: number;
  cardY: number;
}> = ({ title, subtitle, callout, accentColor, cardOpacity, cardY }) => (
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
    {callout && <Callout label={callout} delay={30} bg={accentColor} />}
  </div>
);
