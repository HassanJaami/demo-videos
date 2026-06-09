import { Page } from "playwright";

export const VIEWPORT_W = 1920;
export const VIEWPORT_H = 1080;
export const SUB_STEP = Math.round(VIEWPORT_H * 0.8); // 864px — 20% overlap between shots

export const slug = (text: string, maxLength = 40) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength);

export async function goto(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "load", timeout: 30_000 });
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

// Triggers lazy-loaded images by scrolling through the full page, then resets to top.
export async function preScroll(page: Page): Promise<void> {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += VIEWPORT_H) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}
