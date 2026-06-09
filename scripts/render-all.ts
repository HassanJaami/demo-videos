import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs";
import path from "path";
import { discoverProjects } from "./discover";

const ENTRY = path.resolve("./src/index.ts");
const OUT_DIR = path.resolve("./out");

async function main() {
  const projects = discoverProjects();

  if (projects.length === 0) {
    console.error(
      "No projects found. Add a public/<id>/config.json and screenshots."
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Found ${projects.length} project(s): ${projects.map((p) => p.id).join(", ")}\n`);
  console.log("Bundling...");
  const bundleUrl = await bundle({ entryPoint: ENTRY });
  console.log("Bundle ready.\n");

  for (const project of projects) {
    const out = path.join(OUT_DIR, `${project.id}.mp4`);
    console.log(`Rendering [${project.id}]...`);

    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: project.id,
      inputProps: project,
    });

    await renderMedia({
      composition,
      serveUrl: bundleUrl,
      codec: "h264",
      outputLocation: out,
      inputProps: project,
      onProgress: ({ progress }) => {
        process.stdout.write(`  ${Math.round(progress * 100)}%\r`);
      },
    });

    console.log(`  Done → ${out}          `);
  }

  console.log("\nAll projects rendered.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
