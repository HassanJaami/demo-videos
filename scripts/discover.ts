import fs from "fs";
import path from "path";
import { ProjectConfig, ProjectConfigJSON } from "../src/types/project";

const PUBLIC_DIR = path.resolve("./public");
const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|avif)$/i;

export function discoverProjects(): ProjectConfig[] {
  if (!fs.existsSync(PUBLIC_DIR)) return [];

  return fs
    .readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const id = d.name;
      const configPath = path.join(PUBLIC_DIR, id, "config.json");
      if (!fs.existsSync(configPath)) return [];

      const json: ProjectConfigJSON = JSON.parse(
        fs.readFileSync(configPath, "utf-8")
      );

      const screenshotsDir = path.join(PUBLIC_DIR, id, "screenshots");
      const screenshots = fs.existsSync(screenshotsDir)
        ? fs
            .readdirSync(screenshotsDir)
            .filter((f) => IMAGE_EXTS.test(f) && !f.startsWith("."))
            .sort()
            .map((f) => `${id}/screenshots/${f}`)
        : [];

      const features = json.features.map((scene, i) => ({
        ...scene,
        screenshot: screenshots[i] ?? "",
      }));

      return [{ id, ...json, features }];
    });
}
