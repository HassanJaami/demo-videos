import fs from "fs";
import path from "path";
import { ProjectConfig, ProjectConfigJSON, FeatureSceneJSON } from "../src/types/project";

const PUBLIC_DIR = path.resolve("./public");
const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|avif)$/i;
const AUDIO_EXTS = /\.(mp3|aac|wav|ogg|m4a)$/i;

// Recursively collect all images under `dir`, sorted, returning paths like
// `<projectId>/screenshots/home/01.png` ready for staticFile().
function collectImages(dir: string, projectId: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  function walk(current: string, relPrefix: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      const rel  = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(full, rel);
      else if (IMAGE_EXTS.test(entry.name)) results.push(`${projectId}/screenshots/${rel}`);
    }
  }
  walk(dir, "");
  return results;
}

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
      const screenshots = collectImages(screenshotsDir, id);

      const features = json.features.map((scene: FeatureSceneJSON & { screenshot?: string }, i) => ({
        ...scene,
        // Honour explicit path in config.json; fall back to positional auto-discovery
        screenshot: scene.screenshot || screenshots[i] || "",
      }));

      // Auto-detect a music file: first audio file found in the project root
      const projectDir = path.join(PUBLIC_DIR, id);
      const musicFile = fs
        .readdirSync(projectDir)
        .find((f) => AUDIO_EXTS.test(f) && !f.startsWith("."));
      const music = musicFile ? `${id}/${musicFile}` : undefined;

      return [{ id, ...json, features, music }];
    });
}
