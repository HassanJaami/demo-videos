// Shape of public/<id>/config.json — no screenshot paths needed
export interface FeatureSceneJSON {
  title: string;
  subtitle: string;
  callout?: string;
  cardAlign?: "left" | "right";
  durationInFrames?: number;
  kenBurns?: {
    startScale?: number;
    endScale?: number;
    endX?: number;
    endY?: number;
  };
}

export interface ProjectConfigJSON {
  name: string;
  tagline: string;
  cta: string;
  colors: ProjectColors;
  features: FeatureSceneJSON[];
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
}
