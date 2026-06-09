/**
 * Usage:
 *   tsx scripts/capture.ts <url> <project-id>                                        # section-based screenshots
 *   tsx scripts/capture.ts <url> <project-id> --full-page                            # one tall scrollable screenshot
 *   tsx scripts/capture.ts <url> <project-id> --nav                                  # full-page screenshot per nav link
 *   tsx scripts/capture.ts <url> <project-id> --selectors=".hero,.features,#pricing" # screenshot by selector list
 *   tsx scripts/capture.ts <url> <project-id> --class=fullSection                    # all matching elements, all pages
 */
import { chromium, Page } from "playwright";
import fs from "fs";
import path from "path";
import { goto, preScroll, slug, VIEWPORT_H, VIEWPORT_W } from "./lib/capture-utils";

const args = process.argv.slice(2);
const url = args[0];
const projectId = args[1];
const flagArg = args.find((a) => a.startsWith("--"));
const selectorsArg = args.find((a) => a.startsWith("--selectors="));
const classArg = args.find((a) => a.startsWith("--class="));

const FULL_PAGE = flagArg === "--full-page";
const NAV = flagArg === "--nav";
const CLASS_NAME: string = classArg ? classArg.replace("--class=", "").trim() : "";
const SELECTORS: string[] = selectorsArg
  ? selectorsArg.replace("--selectors=", "").split(",").map((s) => s.trim()).filter(Boolean)
  : [];

if (!url || !projectId) {
  console.error('Usage: tsx scripts/capture.ts <url> <project-id> [--full-page|--nav|--selectors=".hero"|--class=fullSection]');
  process.exit(1);
}
const SCREENSHOTS_DIR = path.resolve(`./public/${projectId}/screenshots`);
const CONFIG_PATH = path.resolve(`./public/${projectId}/config.json`);

async function openPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: VIEWPORT_W, height: VIEWPORT_H });
  return { browser, page };
}

async function fullPageShot(page: Page, filepath: string) {
  await preScroll(page);
  await page.screenshot({ path: filepath, fullPage: true });
  const { size } = fs.statSync(filepath);
  console.log(`  ✓ ${path.basename(filepath)}  (${(size / 1024).toFixed(0)} KB)`);
}

function baseConfig(pageTitle: string, metaDesc: string) {
  return {
    name: projectId,
    tagline: metaDesc || pageTitle,
    cta: "Try it free",
    colors: {
      bg: "#ffffff",
      bgDark: "#111111",
      accent: "#0066ff",
      text: "#111111",
      textMuted: "#666666",
    },
  };
}

// ─── --nav mode ───────────────────────────────────────────────────────────────
async function captureNav() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { browser, page } = await openPage();

  console.log(`Launching browser → ${url}  (nav mode)\n`);
  await goto(page, url);

  const pageTitle = await page.title();
  const metaDesc = await page.evaluate(
    () =>
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      ""
  );

  // Extract nav links — position-based (top 120px) so it works even without <nav>/<header> tags
  const baseDomain = new URL(url).hostname.split(".").slice(-2).join(".");
  const CTA_WORDS = /^(sign in|sign up|log in|login|try|get started|request|contact|book|demo)/i;

  const navLinks = await page.evaluate((opts) => {
    const seen = new Set<string>();
    return Array.from(document.querySelectorAll("a[href]"))
      .filter((a) => {
        const rect = a.getBoundingClientRect();
        return rect.top >= 0 && rect.top < 120;
      })
      .map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: (a as HTMLElement).innerText.trim(),
      }))
      .filter(({ href, text }) => {
        if (!text || text.length > 40) return false;
        // Same base domain (covers subdomains)
        try { if (!new URL(href).hostname.endsWith(opts.baseDomain)) return false; } catch { return false; }
        // Skip app/accounts subdomains (login, signup)
        if (new URL(href).hostname.startsWith("app.")) return false;
        // Skip CTA buttons
        if (new RegExp(opts.ctaPattern, "i").test(text)) return false;
        if (seen.has(href)) return false;
        seen.add(href);
        return true;
      });
  }, { baseDomain, ctaPattern: CTA_WORDS.source });

  console.log(`Found ${navLinks.length} nav link(s):\n`);
  navLinks.forEach((l) => console.log(`  ${l.text}  →  ${l.href}`));
  console.log();

  // Always capture home page first
  const pages: { href: string; text: string }[] = [
    { href: url, text: "Home" },
    ...navLinks.filter((l) => l.href !== url && l.href !== url + "/"),
  ];

  const captured: { filename: string; text: string; href: string }[] = [];

  for (let i = 0; i < pages.length; i++) {
    const { href, text } = pages[i];
    const filename = `${String(i + 1).padStart(2, "0")}-${slug(text)}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    console.log(`[${i + 1}/${pages.length}] ${text}`);
    if (i > 0) await goto(page, href);
    await fullPageShot(page, filepath);
    captured.push({ filename, text, href });
  }

  await browser.close();

  if (!fs.existsSync(CONFIG_PATH)) {
    const config = {
      ...baseConfig(pageTitle, metaDesc),
      features: captured.map(({ text }, i) => ({
        title: text,
        subtitle: "Describe this page.",
        callout: "",
        cardAlign: i % 2 === 0 ? "left" : "right",
        device: "laptop",
        scroll: true,
      })),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\nCreated public/${projectId}/config.json  (scroll: true on all pages)`);
  } else {
    console.log(`\nScreenshots saved. Update config.json features to match.`);
  }
  console.log("→ Run: npm run render:all");
}

// ─── --full-page mode ─────────────────────────────────────────────────────────
async function captureFullPage() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { browser, page } = await openPage();

  console.log(`Launching browser → ${url}  (full-page mode)\n`);
  await goto(page, url);

  const pageTitle = await page.title();
  const metaDesc = await page.evaluate(
    () =>
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      ""
  );

  const filename = "01-full-page.png";
  await fullPageShot(page, path.join(SCREENSHOTS_DIR, filename));
  await browser.close();

  if (!fs.existsSync(CONFIG_PATH)) {
    const config = {
      ...baseConfig(pageTitle, metaDesc),
      features: [
        {
          title: pageTitle,
          subtitle: metaDesc || "Describe this product.",
          callout: "",
          cardAlign: "left",
          device: "laptop",
          scroll: true,
        },
      ],
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\nCreated public/${projectId}/config.json  (scroll mode enabled)`);
  } else {
    console.log(`\nScreenshot saved. Set "scroll": true on the feature in config.json.`);
  }
  console.log("→ Run: npm run render:all");
}

// ─── section mode ─────────────────────────────────────────────────────────────
async function captureSections() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { browser, page } = await openPage();

  console.log(`Launching browser → ${url}  (section mode)\n`);
  await goto(page, url);
  await preScroll(page);

  const pageTitle = await page.title();
  const metaDesc = await page.evaluate(
    () =>
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      ""
  );

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);

  const sectionTops = await page.evaluate((vh) => {
    const selectors = [
      "section", "article",
      "[class*='section']", "[id*='section']",
      "[class*='hero']", "[class*='feature']",
      "[class*='pricing']", "[class*='testimonial']",
      "[class*='cta']", "[class*='banner']",
      "main > div", "body > div > div",
    ];
    const seen = new Set<number>();
    const tops: number[] = [];
    for (const selector of selectors) {
      for (const el of Array.from(document.querySelectorAll(selector))) {
        const rect = el.getBoundingClientRect();
        const absTop = Math.round(rect.top + window.scrollY);
        const h = rect.height;
        if (h < vh * 0.35 || h > vh * 5) continue;
        if (rect.width < window.innerWidth * 0.5) continue;
        if ([...seen].some((t) => Math.abs(t - absTop) < 150)) continue;
        seen.add(absTop);
        tops.push(absTop);
      }
      if (tops.length >= 3) break;
    }
    return tops.sort((a, b) => a - b);
  }, VIEWPORT_H);

  const scrollPositions =
    sectionTops.length >= 2
      ? sectionTops
      : Array.from({ length: Math.ceil(totalHeight / VIEWPORT_H) }, (_, i) => i * VIEWPORT_H);

  console.log(
    sectionTops.length >= 2
      ? `Detected ${scrollPositions.length} sections from HTML\n`
      : `No sections detected — using fixed intervals (${scrollPositions.length} captures)\n`
  );

  const captured: string[] = [];
  for (let i = 0; i < scrollPositions.length; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollPositions[i]);
    await page.waitForTimeout(400);
    const filename = `${String(i + 1).padStart(2, "0")}-section.png`;
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename) });
    captured.push(filename);
    console.log(`  ✓ ${filename}  (scroll: ${scrollPositions[i]}px)`);
  }

  await browser.close();

  if (!fs.existsSync(CONFIG_PATH)) {
    const config = {
      ...baseConfig(pageTitle, metaDesc),
      features: captured.map((_, i) => ({
        title: `Section ${i + 1}`,
        subtitle: "Describe this section.",
        callout: "",
        cardAlign: i % 2 === 0 ? "left" : "right",
        device: "laptop",
      })),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\nCreated public/${projectId}/config.json`);
    console.log("→ Edit titles/subtitles, then run: npm run render:all");
  } else {
    console.log(`\nScreenshots saved.`);
    console.log("→ Run: npm run render:all");
  }
}

// ─── shared: discover nav pages ───────────────────────────────────────────────
async function discoverPages(page: Page, baseUrl: string): Promise<{ href: string; text: string }[]> {
  const baseDomain = new URL(baseUrl).hostname.split(".").slice(-2).join(".");
  const CTA_PATTERN = /^(sign in|sign up|log in|login|try|get started|request|contact|book|demo)/i;

  const navLinks = await page.evaluate((opts) => {
    const seen = new Set<string>();
    return Array.from(document.querySelectorAll("a[href]"))
      .filter((a) => {
        const rect = a.getBoundingClientRect();
        return rect.top >= 0 && rect.top < 120;
      })
      .map((a) => ({ href: (a as HTMLAnchorElement).href, text: (a as HTMLElement).innerText.trim() }))
      .filter(({ href, text }) => {
        if (!text || text.length > 40) return false;
        try { if (!new URL(href).hostname.endsWith(opts.baseDomain)) return false; } catch { return false; }
        if (new URL(href).hostname.startsWith("app.")) return false;
        if (new RegExp(opts.ctaPattern, "i").test(text)) return false;
        if (seen.has(href)) return false;
        seen.add(href);
        return true;
      });
  }, { baseDomain, ctaPattern: CTA_PATTERN.source });

  return [
    { href: baseUrl, text: "home" },
    ...navLinks.filter((l) => l.href !== baseUrl && l.href !== baseUrl + "/"),
  ];
}

// ─── --class mode ─────────────────────────────────────────────────────────────
const HTML_TAGS = new Set([
  "section","article","main","div","header","footer","aside","nav",
  "p","ul","ol","li","table","form","figure","blockquote","details",
]);
function toSelector(name: string): string {
  if (name.startsWith(".") || name.startsWith("#") || name.includes("[")) return name;
  if (HTML_TAGS.has(name.toLowerCase())) return name.toLowerCase();
  return `.${name}`;
}

async function captureByClass() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { browser, page } = await openPage();
  const selector = toSelector(CLASS_NAME);

  console.log(`Launching browser → ${url}  (class mode: "${selector}")\n`);
  await goto(page, url);

  const pageTitle = await page.title();
  const metaDesc = await page.evaluate(
    () =>
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      ""
  );

  const pages = await discoverPages(page, url);
  console.log(`Found ${pages.length} page(s): ${pages.map((p) => p.text).join(", ")}\n`);

  // filepath stored in config = path relative to public/ for staticFile()
  const captured: { configPath: string; pageLabel: string; index: number }[] = [];

  for (const { href, text: pageText } of pages) {
    if (href !== url && href !== url + "/") await goto(page, href);
    await preScroll(page);

    // Collect full bounds of every matching element, sorted top-to-bottom
    type ElBounds = { top: number; x: number; width: number; height: number };
    const elements: ElBounds[] = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll(sel))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            top:    Math.round(rect.top + window.scrollY),
            x:      Math.round(rect.left),
            width:  Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .sort((a, b) => a.top - b.top);
    }, selector);

    if (elements.length === 0) {
      console.log(`  [${pageText}]  no "${selector}" elements found — skipping\n`);
      continue;
    }

    const pageDir = path.join(SCREENSHOTS_DIR, slug(pageText));
    fs.mkdirSync(pageDir, { recursive: true });
    console.log(`  [${pageText}]  ${elements.length} section(s)  →  screenshots/${slug(pageText)}/`);

    let fileIdx = 1;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const chunks = Math.ceil(el.height / VIEWPORT_H);

      for (let p = 0; p < chunks; p++) {
        const scrollY = el.top + p * VIEWPORT_H;
        // Remaining height of the div from this scroll offset — never bleeds into next section
        const clipHeight = Math.min(VIEWPORT_H, el.height - p * VIEWPORT_H);

        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
        await page.waitForTimeout(300);

        const filename   = `${String(fileIdx).padStart(2, "0")}.png`;
        const absPath    = path.join(pageDir, filename);
        // Path relative to public/ — used by staticFile() in Remotion
        const configPath = `${projectId}/screenshots/${slug(pageText)}/${filename}`;

        // Clip exactly to the div: x/width from element bounds, y=0 (div top is at viewport top)
        await page.screenshot({ path: absPath, clip: { x: el.x, y: 0, width: el.width, height: clipHeight } });
        const { size } = fs.statSync(absPath);
        const chunkLabel = chunks > 1 ? `  part ${p + 1}/${chunks}` : "";
        console.log(`    ✓ ${slug(pageText)}/${filename}  [section ${i + 1}${chunkLabel}]  (${(size / 1024).toFixed(0)} KB)`);
        captured.push({ configPath, pageLabel: pageText, index: i });
        fileIdx++;
      }
    }
    console.log();
  }

  await browser.close();

  if (!fs.existsSync(CONFIG_PATH)) {
    const config = {
      ...baseConfig(pageTitle, metaDesc),
      features: captured.map(({ configPath, pageLabel, index }, i) => ({
        screenshot: configPath,
        title: `${pageLabel} — section ${index + 1}`,
        subtitle: "Describe this section.",
        callout: "",
        cardAlign: i % 2 === 0 ? "left" : "right",
        device: "none",
      })),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`Created public/${projectId}/config.json`);
    console.log("→ Edit titles/subtitles, then run: npm run render:all");
  } else {
    console.log(`Screenshots saved.`);
    console.log("→ Run: npm run render:all");
  }
}

// ─── --selectors mode ─────────────────────────────────────────────────────────
async function captureBySelectors() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { browser, page } = await openPage();

  console.log(`Launching browser → ${url}  (selectors mode)\n`);
  await goto(page, url);
  await preScroll(page);

  const pageTitle = await page.title();
  const metaDesc = await page.evaluate(
    () =>
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      ""
  );

  const captured: { filename: string; selector: string }[] = [];

  for (let i = 0; i < SELECTORS.length; i++) {
    const selector = SELECTORS[i];
    const el = page.locator(selector).first();

    if (!(await el.isVisible().catch(() => false))) {
      console.log(`  ✗ "${selector}"  — not found, skipping`);
      continue;
    }

    // Scroll so the element's top is at the top of the viewport
    const top = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return Math.round(rect.top + window.scrollY);
    });
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await page.waitForTimeout(300);

    const label = selector.replace(/[^a-z0-9]/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
    const filename = `${String(i + 1).padStart(2, "0")}-${label}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    // Fixed viewport screenshot — same size (VIEWPORT_W × VIEWPORT_H) for every section
    await page.screenshot({ path: filepath, clip: { x: 0, y: 0, width: VIEWPORT_W, height: VIEWPORT_H } });
    const { size } = fs.statSync(filepath);
    console.log(`  ✓ ${filename}  selector: "${selector}"  (${(size / 1024).toFixed(0)} KB)`);
    captured.push({ filename, selector });
  }

  await browser.close();

  if (!fs.existsSync(CONFIG_PATH)) {
    const config = {
      ...baseConfig(pageTitle, metaDesc),
      features: captured.map(({ selector }, i) => ({
        title: selector,
        subtitle: "Describe this section.",
        callout: "",
        cardAlign: i % 2 === 0 ? "left" : "right",
        device: "laptop",
      })),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\nCreated public/${projectId}/config.json`);
    console.log("→ Edit titles/subtitles, then run: npm run render:all");
  } else {
    console.log(`\nScreenshots saved.`);
    console.log("→ Run: npm run render:all");
  }
}

// ─── Entry ────────────────────────────────────────────────────────────────────
const run = NAV ? captureNav : FULL_PAGE ? captureFullPage : CLASS_NAME ? captureByClass : SELECTORS.length ? captureBySelectors : captureSections;
run().catch((err) => { console.error(err); process.exit(1); });
