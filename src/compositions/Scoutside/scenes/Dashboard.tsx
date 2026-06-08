import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Callout } from "../../../components/Callout";
import { KenBurns } from "../../../components/KenBurns";
import { SceneTitle } from "../../../components/SceneTitle";
import { theme } from "../../../lib/theme";

export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();

  const overlayOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <KenBurns
        src="scoutside/screenshots/01-landing.png"
        durationInFrames={150}
        startScale={1.02}
        endScale={1.07}
        endY={-15}
      />

      {/* Gradient overlay on left for text readability */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to right, rgba(245,241,236,0.97) 38%, rgba(245,241,236,0.6) 60%, transparent 80%)`,
          opacity: overlayOpacity,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: 100,
          opacity: overlayOpacity,
        }}
      >
        <div>
          <SceneTitle
            title={"Your Recruiting\nDashboard"}
            subtitle="Personalized insights based on your profile, position, and graduation year."
          />
          <Callout label="428 matched programs" delay={30} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
