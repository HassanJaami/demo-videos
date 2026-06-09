import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { CaptionOverlay } from "../../../components/CaptionOverlay";
import { HighlightBox } from "../../../components/HighlightBox";
import { KenBurns } from "../../../components/KenBurns";
import { LAPTOP_SCREEN, LaptopFrame } from "../../../components/LaptopFrame";
import { MOBILE_SCREEN, MobileFrame } from "../../../components/MobileFrame";
import { ScrollPan } from "../../../components/ScrollPan";
import { TextCard } from "../../../components/TextCard";
import { useCardAnimation, useDeviceAnimation } from "../../../lib/animations";
import { DEFAULT_FEATURE_FRAMES } from "../../../lib/constants";
import { FeatureSceneConfig, ProjectColors } from "../../../types/project";

interface Props extends FeatureSceneConfig {
  colors: ProjectColors;
}

function cardPosition(align: string): React.CSSProperties {
  const top   = align === "top-left" || align === "top-right";
  const right = align === "right" || align === "top-right" || align === "bottom-right";
  return {
    justifyContent: top ? "flex-start" : "flex-end",
    alignItems:     right ? "flex-end" : "flex-start",
  };
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
  captions,
  cropBottom,
  highlight,
  colors,
}) => {
  const { width: videoWidth, height: videoHeight } = useVideoConfig();
  const { cardOpacity, cardY } = useCardAnimation();
  const { deviceY, deviceOpacity } = useDeviceAnimation();

  const containerDims = resolveContainerDims(device, videoWidth, videoHeight);

  const screenshotContent = scroll ? (
    <ScrollPan
      src={screenshot}
      durationInFrames={durationInFrames}
      containerWidth={containerDims.width}
      containerHeight={containerDims.height}
      captions={captions}
      cropBottom={cropBottom}
    />
  ) : (
    <KenBurns
      src={screenshot}
      durationInFrames={durationInFrames}
      startScale={kenBurns.startScale ?? 1}
      endScale={kenBurns.endScale ?? (device === "none" ? 1.03 : 1.02)}
      endX={kenBurns.endX ?? 0}
      endY={kenBurns.endY ?? (device === "none" ? -10 : 0)}
    />
  );

  const cardOverlay = (
    <AbsoluteFill style={{ ...cardPosition(cardAlign), padding: 60, zIndex: 10 }}>
      <TextCard
        title={title}
        subtitle={subtitle}
        callout={callout}
        accentColor={colors.accent}
        opacity={cardOpacity}
        cardY={cardY}
      />
    </AbsoluteFill>
  );

  if (device === "none") {
    return (
      <AbsoluteFill style={{ backgroundColor: colors.bg }}>
        {screenshotContent}
        {highlight && (
          <HighlightBox
            {...highlight}
            color={highlight.color ?? colors.accent}
            durationInFrames={durationInFrames}
          />
        )}
        {cardOverlay}
        {captions && captions.length > 0 && (
          <CaptionOverlay captions={captions} durationInFrames={durationInFrames} />
        )}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ transform: `translateY(${deviceY}px)`, opacity: deviceOpacity }}>
        {device === "laptop" ? (
          <LaptopFrame>{screenshotContent}</LaptopFrame>
        ) : (
          <MobileFrame>{screenshotContent}</MobileFrame>
        )}
      </div>
      {highlight && (
        <HighlightBox
          {...highlight}
          color={highlight.color ?? colors.accent}
          durationInFrames={durationInFrames}
        />
      )}
      {cardOverlay}
      {captions && captions.length > 0 && (
        <CaptionOverlay captions={captions} durationInFrames={durationInFrames} />
      )}
    </AbsoluteFill>
  );
};

function resolveContainerDims(
  device: string,
  videoWidth: number,
  videoHeight: number
): { width: number; height: number } {
  if (device === "laptop") return LAPTOP_SCREEN;
  if (device === "mobile") return MOBILE_SCREEN;
  return { width: videoWidth, height: videoHeight };
}
