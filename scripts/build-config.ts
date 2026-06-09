/**
 * Converts analyzed-manifest.json into a Remotion-ready config.json.
 * Copies full-page screenshots to the indexed screenshots/ directory.
 *
 * Usage:
 *   tsx scripts/build-config.ts <project-id>
 *
 * Reads:  public/<id>/analyzed-manifest.json
 * Writes: public/<id>/config.json
 *         public/<id>/screenshots/<n>-<slug>.png  (renamed copies in order)
 */
import fs from "fs";
import path from "path";
import { CAPTION_PAUSE_FRAMES, SCROLL_PAUSE_FRAMES } from "../src/lib/constants";

const [, , projectId] = process.argv;

if (!projectId) {
  console.error("Usage: tsx scripts/build-config.ts <project-id>");
  process.exit(1);
}

const MIN_DURATION = 180;
const MAX_DURATION = 720;

interface CaptionEntry {
  text: string;
  atProgress: number;
  subScreenshot?: string;
}

interface AnalyzedScene {
  url: string;
  include?: boolean;
  fullScreenshot: string;
  pageHeight: number;
  title: string;
  subtitle: string;
  callout?: string;
  cardAlign?: "left" | "right";
  importance?: number;
  captions: CaptionEntry[];
  analyzeError?: string;
}

interface AnalyzedManifest {
  id: string;
  projectMeta: {
    name: string;
    tagline: string;
    cta: string;
    colors: Record<string, string>;
  };
  analyzedAt: string;
  scenes: AnalyzedScene[];
}

/**
 * Duration = hold at top/bottom + scroll time (proportional to page height) + pause per caption.
 * Clamped to [MIN_DURATION, MAX_DURATION] frames.
 */
function calculateDuration(pageHeight: number, viewportHeight: number, numCaptions: number): number {
  const maxScrollPx = Math.max(0, pageHeight - viewportHeight);
  // ~2.5 frames per 100px of scrollable content (gives ~7s for a 3000px-scroll page at 30fps)
  const scrollFrames = Math.round((maxScrollPx / 100) * 2.5);
  const pauseTotal = CAPTION_PAUSE_FRAMES * Math.max(0, numCaptions - 1); // first caption uses hold
  const holdTotal = SCROLL_PAUSE_FRAMES * 2;
  return Math.min(Math.max(holdTotal + scrollFrames + pauseTotal, MIN_DURATION), MAX_DURATION);
}

const VIEWPORT_H = 1080;

async function main() {
  const publicDir = path.resolve(`./public/${projectId}`);
  const manifestPath = path.join(publicDir, "analyzed-manifest.json");
  const configPath = path.join(publicDir, "config.json");
  const screenshotsDir = path.join(publicDir, "screenshots");

  if (!fs.existsSync(manifestPath)) {
    console.error(`Analyzed manifest not found: ${manifestPath}`);
    console.error(`Run: tsx scripts/analyze.ts ${projectId} first`);
    process.exit(1);
  }

  const manifest: AnalyzedManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const { projectMeta, scenes } = manifest;

  // Filter to included scenes only
  const included = scenes.filter((s) => s.include !== false);

  if (included.length === 0) {
    console.error("No scenes marked for inclusion. Set include: true on at least one scene.");
    process.exit(1);
  }

  console.log(`\nBuilding config for "${projectId}" — ${included.length} scene(s)\n`);

  // Remove old indexed screenshots so index mapping stays clean
  const existingShots = fs.existsSync(screenshotsDir)
    ? fs.readdirSync(screenshotsDir).filter((f) => /^\d{2}-/.test(f))
    : [];
  for (const f of existingShots) {
    fs.unlinkSync(path.join(screenshotsDir, f));
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const features: object[] = [];

  for (let i = 0; i < included.length; i++) {
    const scene = included[i];
    const pageNum = String(i + 1).padStart(2, "0");

    // Copy full-page screenshot with sequential index name
    const srcPath = path.join(publicDir, scene.fullScreenshot);
    const ext = path.extname(scene.fullScreenshot);
    const destFilename = `${pageNum}-${slugify(scene.title)}${ext}`;
    const destPath = path.join(screenshotsDir, destFilename);

    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠ Screenshot missing: ${scene.fullScreenshot} — skipping`);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ [${pageNum}] ${scene.title}`);
    console.log(`       ${destFilename}`);

    // Captions: strip the subScreenshot field (not needed in config)
    const captions = scene.captions.map(({ text, atProgress }) => ({ text, atProgress }));

    const duration = calculateDuration(scene.pageHeight, VIEWPORT_H, captions.length);

    features.push({
      title: scene.title,
      subtitle: scene.subtitle,
      ...(scene.callout ? { callout: scene.callout } : {}),
      cardAlign: scene.cardAlign ?? (i % 2 === 0 ? "left" : "right"),
      device: "laptop",
      scroll: true,
      durationInFrames: duration,
      ...(captions.length > 0 ? { captions } : {}),
    });

    console.log(`       ${duration} frames (${(duration / 30).toFixed(1)}s) | ${captions.length} captions`);
  }

  const config = {
    name: projectMeta.name,
    tagline: projectMeta.tagline,
    cta: projectMeta.cta,
    colors: projectMeta.colors,
    features,
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n✓ Config written → public/${projectId}/config.json`);
  console.log(`\nNEXT STEPS:`);
  console.log(`  npm run sync        (regenerate src/projects.config.ts)`);
  console.log(`  npm run render:all  (render video)`);
  console.log(`  npm start           (preview in Remotion Studio)`);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
