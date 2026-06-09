---
name: pipeline-architecture
description: Automated URL-list → screenshot → Claude Vision analysis → config.json → video pipeline
metadata:
  type: project
---

Built June 2026. Full pipeline: give it a URL list, get a rendered product tour video.

**Why:** User wanted automation so they don't manually screenshot pages or write captions. AI handles section detection and caption writing; user reviews before render.

**How to apply:** When user asks about adding a new project or automating video creation, point them to this pipeline.

## Flow
1. `input/<id>.json` — user provides URL list + project colors/metadata
2. `tsx scripts/pipeline.ts input/<id>.json` — runs everything, pauses for review
3. Review `public/<id>/analyzed-manifest.json` — edit titles, captions, set `include: false` to skip scenes
4. Pipeline continues → `config.json` + sync + render

## Key decisions
- One URL = one scene with ScrollPan (full-page tall screenshot)
- Sub-screenshots taken every 80% of viewport height (1920x1080 → every 864px)
- Sub-screenshots are JPEG/80% quality, kept in `screenshots/sub/`, NOT used in video (analysis only)
- Claude Haiku picks which sub-screenshot shows each section MOST COMPLETELY → sets `atProgress`
- `atProgress` = scrollY / maxScrollY for the chosen sub-screenshot
- ScrollPan pauses at each `atProgress` value so section is fully visible when caption shows
- Duration auto-calculated: 2.5 frames per 100px of scroll + 45 frames per caption pause

## Scripts
- `scripts/capture-pages.ts` — Playwright capture
- `scripts/analyze.ts` — Claude Vision analysis
- `scripts/build-config.ts` — manifest → config.json
- `scripts/pipeline.ts` — orchestrator (supports --skip-capture, --skip-analyze, --no-review)

## npm scripts added
- `npm run pipeline` — full run
- `npm run analyze` — re-run analysis only
- `npm run build-config` — re-run config build only
