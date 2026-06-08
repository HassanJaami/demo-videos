# Demo Videos

Agency demo videos built with [Remotion](https://www.remotion.dev/).

## Projects

| Composition | Description |
|---|---|
| `Scoutside` | Web app demo |

## Getting Started

```bash
npm install
npm start        # Open Remotion Studio at localhost:3000
```

## Rendering

```bash
# Render a specific composition
npx remotion render src/index.ts Scoutside out/scoutside.mp4

# Render all
npm run build
```

## Structure

```
src/
├── Root.tsx                  # Registers all compositions
├── lib/
│   ├── theme.ts              # Shared brand colors & fonts
│   └── animations.ts        # Reusable animation helpers
├── transitions/              # Shared transition components
└── compositions/
    └── Scoutside/
        ├── index.tsx         # Main composition
        ├── assets/           # Project-specific assets
        └── scenes/           # Individual scenes
```

## Adding a New Project

1. Create `src/compositions/ProjectName/` with `index.tsx` and `scenes/`
2. Drop static assets in `public/projectname/`
3. Register the composition in `src/Root.tsx`
