import React from "react";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Scoutside } from "./compositions/Scoutside";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: "Hello World",
          titleColor: "#ffffff",
        }}
      />
      <Composition
        id="Scoutside"
        component={Scoutside}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
