export interface SceneCaption {
  text: string;
  atProgress: number; // 0–1: fraction of the scroll at which this caption appears
}

export interface HighlightRegion {
  x: number;      // 0–1 fraction of video width
  y: number;      // 0–1 fraction of video height
  width: number;  // 0–1 fraction of video width
  height: number; // 0–1 fraction of video height
  color?: string;
}

// Shape of public/<id>/config.json
export interface FeatureSceneJSON {
  screenshot?: string;
  title: string;
  subtitle: string;
  callout?: string;
  cardAlign?: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  device?: "laptop" | "mobile" | "none";
  scroll?: boolean;
  durationInFrames?: number;
  kenBurns?: {
    startScale?: number;
    endScale?: number;
    endX?: number;
    endY?: number;
  };
  captions?: SceneCaption[];
  cropBottom?: number;
  highlight?: HighlightRegion;
}

export interface ProjectConfigJSON {
  name: string;
  tagline: string;
  cta: string;
  colors: ProjectColors;
  features: FeatureSceneJSON[];
  music?: string;
}

// Full runtime config — screenshot path is added by the discovery script
export interface FeatureSceneConfig extends FeatureSceneJSON {
  screenshot: string;
}

export interface ProjectColors {
  bg: string;
  bgDark: string;
  accent: string;
  text: string;
  textMuted: string;
}

export interface ProjectConfig extends ProjectConfigJSON {
  id: string;
  features: FeatureSceneConfig[];
  music?: string;
}
