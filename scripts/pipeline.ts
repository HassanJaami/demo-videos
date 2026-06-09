/**
 * Full pipeline orchestrator: capture → analyze → pause for review → build-config → sync.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... tsx scripts/pipeline.ts input/my-project.json
 *
 * Flags:
 *   --skip-capture   Screenshots already exist on disk — only take sub-shots for AI analysis,
 *                    then re-run analyze. Matches existing screenshots by index order.
 *   --skip-analyze   Re-use existing analyzed-manifest.json — skip capture + analysis entirely,
 *                    jump straight to build-config. Requires analyzed-manifest.json to exist.
 *   --no-review      Do not pause for review — run full pipeline automatically.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";
import { loadEnv } from "./lib/load-env";

loadEnv();

const args = process.argv.slice(2);
const inputFile = args.find((a) => !a.startsWith("--"));
const SKIP_CAPTURE = args.includes("--skip-capture");
const SKIP_ANALYZE = args.includes("--skip-analyze");
const NO_REVIEW = args.includes("--no-review");

if (!inputFile) {
  console.error("Usage: tsx scripts/pipeline.ts <input-file.json> [--skip-capture] [--skip-analyze] [--no-review]");
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY && !SKIP_ANALYZE) {
  console.error("Error: ANTHROPIC_API_KEY is not set. Add it to local.env or export it in your shell.");
  process.exit(1);
}

function run(cmd: string) {
  console.log(`\n$ ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const inputPath = path.resolve(inputFile!);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputPath, "utf-8")) as { id: string };
  const { id } = input;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Product Tour Pipeline → project: ${id}`);
  console.log(`${"=".repeat(60)}\n`);

  // Phase 1: Capture
  if (SKIP_ANALYZE) {
    console.log("PHASE 1 — Capture skipped (--skip-analyze)\n");
  } else if (SKIP_CAPTURE) {
    // Screenshots already exist — only take sub-shots so AI has sections to analyze
    console.log("PHASE 1 — Sub-screenshots only (existing full screenshots will be reused)\n");
    run(`tsx scripts/capture-pages.ts ${inputPath} --sub-only`);
  } else {
    console.log("PHASE 1 — Capture screenshots\n");
    run(`tsx scripts/capture-pages.ts ${inputPath}`);
  }

  // Phase 2: Analyze
  if (!SKIP_ANALYZE) {
    console.log("\nPHASE 2 — AI analysis (Claude Vision)\n");
    run(`tsx scripts/analyze.ts ${id}`);
  } else {
    console.log("PHASE 2 — Analysis skipped (--skip-analyze)\n");
  }

  // Review pause
  if (!NO_REVIEW) {
    console.log("\n" + "─".repeat(60));
    console.log("REVIEW STEP");
    console.log("─".repeat(60));
    console.log(`\nOpen and edit: public/${id}/analyzed-manifest.json`);
    console.log("\nYou can:");
    console.log("  • Set  \"include\": false  on any scene to exclude it");
    console.log("  • Edit titles, subtitles, callouts");
    console.log("  • Edit caption text and atProgress values (0–1 scroll position)");
    console.log("  • Reorder scenes by moving objects in the scenes array");
    console.log("\nCaption atProgress guide:");
    console.log("  0.0 = shown at top (during initial hold)");
    console.log("  0.5 = shown when scroll is halfway down the page");
    console.log("  1.0 = shown near the bottom\n");

    const answer = await ask('Press Enter when ready to build config (or type "skip" to exit): ');
    if (answer.trim().toLowerCase() === "skip") {
      console.log(`\nExiting. Run when ready:\n  tsx scripts/build-config.ts ${id}\n  npm run sync\n`);
      process.exit(0);
    }
  }

  // Phase 3: Build config
  console.log("\nPHASE 3 — Build config.json\n");
  run(`tsx scripts/build-config.ts ${id}`);

  // Phase 4: Sync
  console.log("\nPHASE 4 — Sync projects.config.ts\n");
  run(`npm run sync`);

  console.log("\n" + "=".repeat(60));
  console.log(`  Pipeline complete for project: ${id}`);
  console.log("=".repeat(60));
  console.log("\nPreview: npm start");
  console.log("Render:  npm run render:all\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
