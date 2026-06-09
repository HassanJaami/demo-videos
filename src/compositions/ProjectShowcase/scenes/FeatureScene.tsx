import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { LaptopFrame } from "../../../components/LaptopFrame";
import { MobileFrame } from "../../../components/MobileFrame";
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
  const deviceY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deviceOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isLeft = cardAlign === "left";

  // --- Full-bleed mode (no device frame) ---
  if (device === "none") {
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
  const frameContent = (
    <KenBurns
      src={screenshot}
      durationInFrames={durationInFrames}
      startScale={kenBurns.startScale ?? 1}
      endScale={kenBurns.endScale ?? 1.02}
      endX={kenBurns.endX ?? 0}
      endY={kenBurns.endY ?? 0}
    />
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Device frame — slides up on entry */}
      <div
        style={{
          transform: `translateY(${deviceY}px)`,
          opacity: deviceOpacity,
        }}
      >
        {device === "laptop" ? (
          <LaptopFrame>{frameContent}</LaptopFrame>
        ) : (
          <MobileFrame>{frameContent}</MobileFrame>
        )}
      </div>

      {/* Text card — overlays at bottom corner */}
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

// --- Shared text card ---
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
