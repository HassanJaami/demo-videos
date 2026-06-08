import React from "react";
import { AbsoluteFill } from "remotion";
import { FadeIn } from "../../../transitions/FadeIn";

export const Intro: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <FadeIn duration={30}>
        <div style={{ color: "#ffffff", fontSize: 72, fontWeight: 700, textAlign: "center" }}>
          Scoutside
        </div>
      </FadeIn>
      <FadeIn delay={20} duration={30}>
        <div style={{ color: "#aaaaaa", fontSize: 28, marginTop: 16, textAlign: "center" }}>
          {/* tagline goes here once screenshots are shared */}
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};
