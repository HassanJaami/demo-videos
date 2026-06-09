import React from "react";
import { Callout } from "./Callout";
import { SceneTitle } from "./SceneTitle";

interface Props {
  title: string;
  subtitle: string;
  callout?: string;
  accentColor?: string;
  calloutDelay?: number;
  maxWidth?: number;
  opacity: number;
  cardY: number;
  children?: React.ReactNode;
}

// Glass card used across all feature scenes. Pass `children` for content
// that appears between the title and the callout badge.
export const TextCard: React.FC<Props> = ({
  title,
  subtitle,
  callout,
  accentColor,
  calloutDelay = 30,
  maxWidth = 520,
  opacity,
  cardY,
  children,
}) => (
  <div
    style={{
      backgroundColor: "rgba(28,28,26,0.88)",
      borderRadius: 20,
      padding: "36px 44px",
      maxWidth,
      opacity,
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
    {children}
    {callout && (
      <Callout label={callout} delay={calloutDelay} bg={accentColor} />
    )}
  </div>
);
