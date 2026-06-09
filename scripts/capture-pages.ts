/**
 * Captures screenshots for each URL in an input file.
 *
 * Usage:
 *   tsx scripts/capture-pages.ts input/my-project.json            # full capture
 *   tsx scripts/capture-pages.ts input/my-project.json --sub-only # sub-screenshots only
 *
 * --sub-only: skips full-page capture and uses existing screenshots already on disk
 *   (matched by index order). Use this when screenshots already exist and you only
 *   need sub-shots for AI analysis — e.g. a project captured manually.
 *
 * Output:
 *   public/<id>/screenshots/<i>-<slug>.png         (full-page tall, used in video)
 *   public/<id>/screenshots/sub/<i>-<slug>-<j>.jpg (viewport sub-shots, AI analysis only)
 *   public/<id>/capture-manifest.json
 */
import { chromium, Page } from "playwright";
import fs from "fs";
import path from "path";
import { goto, preScroll, slug, SUB_STEP, VIEWPORT_H, VIEWPORT_W } from "./lib/capture-utils";

const args = process.argv.slice(2);
const inputFile = args.find((a) => !a.startsWith("--"));
const SUB_ONLY = args.includes("--sub-only");

if (!inputFile) {
  console.error("Usage: tsx scripts/capture-pages.ts <input-file.json> [--sub-only]");
  process.exit(1);
}

const IMAGE_EXTS = /\.(png|jpg|jpeg|webp)$/i;

async function captureSubShots(
  page: Page,
  pageHeight: number,
  maxScrollY: number,
  pageNum: string,
  pageSlug: string,
  subDir: string
): Promise<{ index: number; filename: string; scrollY: number; atProgress: number }[]> {
  const scrollPositions: number[] = [];
  for (let y = 0; y < pageHeight; y += SUB_STEP) {
    scrollPositions.push(y);
  }
  if (scrollPositions[scrollPositions.length - 1] < maxScrollY) {
    scrollPositions.push(maxScrollY);
  }

  const subShots = [];
  for (let j = 0; j < scrollPositions.length; j++) {
    const scrollY = scrollPositions[j];
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
    await page.waitForTimeout(200);

    const subFilename = `${pageNum}-${pageSlug}-${String(j).padStart(2, "0")}.jpg`;
    await page.screenshot({
      path: path.join(subDir, subFilename),
      fullPage: false,
      type: "jpeg",
      quality: 80,
    });

    subShots.push({
      index: j,
      filename: `screenshots/sub/${subFilename}`,
      scrollY,
      atProgress: maxScrollY > 0 ? scrollY / maxScrollY : 0,
    });
  }
  return subShots;
}

async function main() {
  const inputPath = path.resolve(inputFile!);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputPath, "utf-8")) as {
    id: string;
    name: string;
    tagline: string;
    cta: string;
    colors: Record<string, string>;
    urls: string[];
  };

  const { id, urls } = input;
  const publicDir = path.resolve(`./public/${id}`);
  const screenshotsDir = path.join(publicDir, "screenshots");
  const subDir = path.join(screenshotsDir, "sub");
  const manifestPath = path.join(publicDir, "capture-manifest.json");

  fs.mkdirSync(subDir, { recursive: true });

  // In --sub-only mode, read existing full-page screenshots from disk (sorted, index-matched)
  let existingScreenshots: string[] = [];
  if (SUB_ONLY) {
    if (!fs.existsSync(screenshotsDir)) {
      console.error(`No screenshots directory found at ${screenshotsDir}`);
      console.error(`Run without --sub-only to capture from scratch.`);
      process.exit(1);
    }
    existingScreenshots = fs
      .readdirSync(screenshotsDir)
      .filter((f) => IMAGE_EXTS.test(f) && !f.startsWith("."))
      .sort();

    if (existingScreenshots.length === 0) {
      console.error(`No screenshots found in ${screenshotsDir}`);
      process.exit(1);
    }
    if (existingScreenshots.length < urls.length) {
      console.warn(
        `⚠ Warning: ${urls.length} URLs but only ${existingScreenshots.length} screenshots on disk.`
      );
      console.warn(`  Unmatched URLs will have no full screenshot in the manifest.`);
    }
    console.log(`\n--sub-only mode: reusing ${existingScreenshots.length} existing screenshot(s)\n`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: VIEWPORT_W, height: VIEWPORT_H });

  const mode = SUB_ONLY ? "sub-only" : "full";
  console.log(`Capturing ${urls.length} page(s) for project "${id}"  [${mode}]\n`);

  const scenes: object[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const pageNum = String(i + 1).padStart(2, "0");

    console.log(`[${i + 1}/${urls.length}] ${url}`);
    await goto(page, url);
    await preScroll(page);

    const pageTitle = await page.title();
    const pageSlug = slug(pageTitle || `page-${i + 1}`);
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const maxScrollY = Math.max(0, pageHeight - VIEWPORT_H);

    let fullScreenshotPath: string;

    if (SUB_ONLY) {
      // Use the existing screenshot matched by index
      const existing = existingScreenshots[i];
      if (existing) {
        fullScreenshotPath = `screenshots/${existing}`;
        console.log(`  ↩ full  ${existing}  (existing)`);
      } else {
        fullScreenshotPath = "";
        console.log(`  ⚠ full  no existing screenshot for index ${i + 1}`);
      }
    } else {
      // Capture full-page screenshot
      const fullFilename = `${pageNum}-${pageSlug}.png`;
      const fullPath = path.join(screenshotsDir, fullFilename);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await page.screenshot({ path: fullPath, fullPage: true });
      const fullSize = fs.statSync(fullPath).size;
      console.log(`  ✓ full  ${fullFilename}  (${Math.round(fullSize / 1024)} KB, ${pageHeight}px tall)`);
      fullScreenshotPath = `screenshots/${fullFilename}`;
    }

    // Sub-screenshots (always captured)
    const subShots = await captureSubShots(page, pageHeight, maxScrollY, pageNum, pageSlug, subDir);
    console.log(`  ✓ sub   ${subShots.length} viewport shots`);

    scenes.push({
      url,
      index: i + 1,
      pageTitle,
      urlSlug: pageSlug,
      pageHeight,
      viewportHeight: VIEWPORT_H,
      maxScrollY,
      fullScreenshot: fullScreenshotPath,
      subScreenshots: subShots,
    });
  }

  await browser.close();

  const manifest = {
    id,
    projectMeta: {
      name: input.name,
      tagline: input.tagline,
      cta: input.cta,
      colors: input.colors,
    },
    capturedAt: new Date().toISOString(),
    viewportWidth: VIEWPORT_W,
    viewportHeight: VIEWPORT_H,
    scenes,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written → public/${id}/capture-manifest.json`);
  console.log(`→ Next: tsx scripts/analyze.ts ${id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
