/**
 * Sends sub-screenshots to Claude Vision to identify page sections,
 * generate captions, and score importance.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... tsx scripts/analyze.ts <project-id>
 *
 * Reads:  public/<id>/capture-manifest.json
 * Writes: public/<id>/analyzed-manifest.json  ← review & edit this before build-config
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { loadEnv } from "./lib/load-env";

loadEnv();

const [, , projectId] = process.argv;

if (!projectId) {
  console.error("Usage: tsx scripts/analyze.ts <project-id>");
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY is not set. Add it to local.env or export it in your shell.");
  process.exit(1);
}

const MAX_SUB_IMAGES = 12; // Claude limit buffer — subsample if more

const client = new Anthropic();

interface SubShot {
  index: number;
  filename: string;
  scrollY: number;
  atProgress: number;
}

interface CaptureScene {
  url: string;
  index: number;
  pageTitle: string;
  urlSlug: string;
  pageHeight: number;
  viewportHeight: number;
  maxScrollY: number;
  fullScreenshot: string;
  subScreenshots: SubShot[];
}

interface CaptureManifest {
  id: string;
  projectMeta: {
    name: string;
    tagline: string;
    cta: string;
    colors: Record<string, string>;
  };
  capturedAt: string;
  viewportWidth: number;
  viewportHeight: number;
  scenes: CaptureScene[];
}

interface ClaudeSection {
  caption: string;
  subScreenshotIndex: number;
}

interface ClaudeResult {
  title: string;
  subtitle: string;
  callout: string;
  cardAlign: "left" | "right";
  importance: number;
  sections: ClaudeSection[];
}

function subSample<T>(arr: T[], maxCount: number): { items: T[]; indexMap: number[] } {
  if (arr.length <= maxCount) return { items: arr, indexMap: arr.map((_, i) => i) };
  const step = arr.length / maxCount;
  const indexMap: number[] = [];
  for (let i = 0; i < maxCount; i++) {
    indexMap.push(Math.min(Math.round(i * step), arr.length - 1));
  }
  return { items: indexMap.map((i) => arr[i]), indexMap };
}

function parseClaudeJSON(text: string): ClaudeResult {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  return JSON.parse(cleaned);
}

async function analyzeScene(
  scene: CaptureScene,
  cardAlign: "left" | "right",
  publicDir: string
): Promise<object> {
  const { subScreenshots, url, pageHeight, maxScrollY, viewportHeight } = scene;

  if (subScreenshots.length === 0) {
    console.log(`  ⚠ No sub-screenshots, skipping AI analysis`);
    return {
      url,
      include: true,
      fullScreenshot: scene.fullScreenshot,
      pageHeight,
      title: scene.pageTitle,
      subtitle: "",
      callout: "",
      cardAlign,
      importance: 0.7,
      captions: [],
      analyzeError: "No sub-screenshots available",
    };
  }

  // Subsample if too many images
  const { items: sampledShots, indexMap } = subSample(subScreenshots, MAX_SUB_IMAGES);
  const imageCount = sampledShots.length;

  console.log(`  Sending ${imageCount} sub-screenshot(s) to Claude...`);

  // Build image content blocks
  const imageBlocks: Anthropic.ImageBlockParam[] = sampledShots.map((shot) => {
    const fullPath = path.join(publicDir, shot.filename);
    const data = fs.readFileSync(fullPath).toString("base64");
    return {
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data },
    };
  });

  const prompt = `You are analyzing ${imageCount} sequential viewport screenshots of a web page.
URL: ${url}
Page height: ${pageHeight}px | Viewport height: ${viewportHeight}px | Scrollable: ${maxScrollY}px

Screenshot 0 = top of page. Screenshot ${imageCount - 1} = bottom (or near bottom).
Each screenshot overlaps ~20% with the next.

Your task:
1. Identify 3–8 distinct sections of this page
2. For each section, pick the screenshot index (0–${imageCount - 1}) where that section appears MOST COMPLETELY visible — not cut off at top or bottom
3. Write a punchy 4–7 word caption for each section (social-media style, present tense)

Also produce:
- title: 3–5 words summarizing this page's main focus
- subtitle: 1 sentence describing what this page offers visitors
- callout: 2–5 word badge text (leave empty string "" if nothing fits naturally)
- cardAlign: "${cardAlign}" (use this value exactly)
- importance: 0.1–1.0 score:
    0.8–1.0 = hero, core features, pricing pages
    0.5–0.7 = supporting pages (support, docs, integrations)
    0.1–0.4 = mostly duplicate or low-value content

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "...",
  "subtitle": "...",
  "callout": "...",
  "cardAlign": "${cardAlign}",
  "importance": 0.0,
  "sections": [
    { "caption": "...", "subScreenshotIndex": 0 },
    { "caption": "...", "subScreenshotIndex": 2 }
  ]
}`;

  let result: ClaudeResult;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const rawText = response.content.find((b) => b.type === "text")?.text ?? "";
    result = parseClaudeJSON(rawText);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.log(`  ✗ Claude error: ${errMsg}`);
    return {
      url,
      include: true,
      fullScreenshot: scene.fullScreenshot,
      pageHeight,
      title: scene.pageTitle,
      subtitle: "",
      callout: "",
      cardAlign,
      importance: 0.7,
      captions: [],
      analyzeError: errMsg,
    };
  }

  // Map section subScreenshotIndex back to original sub-screenshot (account for subsampling)
  const captions = result.sections.map((sec) => {
    const sampledIdx = Math.min(Math.max(sec.subScreenshotIndex, 0), imageCount - 1);
    const originalIdx = indexMap[sampledIdx];
    const shot = subScreenshots[originalIdx];
    return {
      text: sec.caption,
      atProgress: shot.atProgress,
      subScreenshot: shot.filename,
    };
  });

  return {
    url,
    include: true,
    fullScreenshot: scene.fullScreenshot,
    pageHeight,
    title: result.title,
    subtitle: result.subtitle,
    callout: result.callout,
    cardAlign: result.cardAlign,
    importance: result.importance,
    captions,
  };
}

async function main() {
  const publicDir = path.resolve(`./public/${projectId}`);
  const manifestPath = path.join(publicDir, "capture-manifest.json");
  const outputPath = path.join(publicDir, "analyzed-manifest.json");

  if (!fs.existsSync(manifestPath)) {
    console.error(`Capture manifest not found: ${manifestPath}`);
    console.error(`Run: tsx scripts/capture-pages.ts <input-file.json> first`);
    process.exit(1);
  }

  const manifest: CaptureManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const { scenes, projectMeta } = manifest;

  console.log(`\nAnalyzing ${scenes.length} scene(s) for project "${projectId}"\n`);

  const analyzedScenes: object[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const cardAlign = i % 2 === 0 ? "left" : "right";
    console.log(`[${i + 1}/${scenes.length}] ${scene.url}`);
    const analyzed = await analyzeScene(scene, cardAlign as "left" | "right", publicDir);
    analyzedScenes.push(analyzed);
    console.log(`  ✓ Done`);
  }

  const output = {
    id: projectId,
    projectMeta,
    analyzedAt: new Date().toISOString(),
    scenes: analyzedScenes,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✓ Analyzed manifest written → public/${projectId}/analyzed-manifest.json`);
  console.log(`\nNEXT STEPS:`);
  console.log(`  1. Open public/${projectId}/analyzed-manifest.json`);
  console.log(`  2. Review each scene: edit titles, captions, set include: false to skip scenes`);
  console.log(`  3. Run: tsx scripts/build-config.ts ${projectId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
