import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

export const Outreach: React.FC = () => {
  const frame = useCurrentFrame();
  const screenshotOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg, flexDirection: "row" }}>
      {/* Left: screenshot */}
      <div style={{ flex: 1, opacity: screenshotOpacity, overflow: "hidden" }}>
        <KenBurns
          src="scoutside/screenshots/04-outreach.png"
          durationInFrames={150}
          startScale={1}
          endScale={1.05}
          startY={0}
          endY={-15}
        />
      </div>

      {/* Right: text panel */}
      <div
        style={{
          width: 620,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          paddingRight: 100,
          paddingLeft: 60,
          backgroundColor: theme.colors.bg,
          zIndex: 1,
        }}
      >
        <div>
          <SceneTitle
            title="Connect With Coaches"
            subtitle="AI-powered outreach that helps you draft emails, improve your tone, and follow up at the right time."
          />
          <Callout label="AI-powered · Your data stays private" delay={30} bg={theme.colors.bgDark} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
