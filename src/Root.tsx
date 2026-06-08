import React from "react";
import { Composition } from "remotion";
import { Scoutside } from "./compositions/Scoutside";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Scoutside"
        component={Scoutside}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
