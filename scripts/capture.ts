/**
 * Usage:
 *   tsx scripts/capture.ts <url> <project-id>             # section-based screenshots
 *   tsx scripts/capture.ts <url> <project-id> --full-page # one tall scrollable screenshot
 *   tsx scripts/capture.ts <url> <project-id> --nav       # full-page screenshot per nav link
 */
import { chromium, Page } from "playwright";
import fs from "fs";
import path from "path";

const [, , url, projectId, flag] = process.argv;
const FULL_PAGE = flag === "--full-page";
const NAV = flag === "--nav";

if (!url || !projectId) {
  console.error("Usage: tsx scripts/capture.ts <url> <project-id> [--full-page|--nav]");
  process.exit(1);
}

const VIEWPORT_W = 1920;
const VIEWPORT_H = 1080;
const SCREENSHOTS_DIR = path.resolve(`./public/${projectId}/screenshots`);
const CONFIG_PATH = path.resolve(`./public/${projectId}/config.json`);

const slug = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function openPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: VIEWPORT_W, height: VIEWPORT_H });
  return { browser, page };
}

async function goto(page: Page, target: string) {
  await page.goto(target, { waitUntil: "load", timeout: 30_000 });
  await page.waitForTimeout(2000);

  for (const sel of [
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("Got it")',
    '[aria-label="Accept cookies"]',
  ]) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
  }
}

async function preScroll(page: Page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += VIEWPORT_H) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
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

// ─── Entry ────────────────────────────────────────────────────────────────────
const run = NAV ? captureNav : FULL_PAGE ? captureFullPage : captureSections;
run().catch((err) => { console.error(err); process.exit(1); });
