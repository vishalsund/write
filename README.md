# write_

A minimal WYSIWYG writing app. Markdown is stored under the hood; you edit like a simple word processor.

**Live site:** [https://vishalsund.github.io/write/](https://vishalsund.github.io/write/)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/ (local dev uses `/` as base; production uses `/write/`).

## Features

- WYSIWYG editing with markdown export
- Headings H1–H6, bold, italic, lists, links, images (drag-drop, paste, or toolbar)
- **Code**: inline `` `code` `` and fenced blocks (type ` ```lang ` then Enter, or toolbar)
- **Math**: LaTeX via KaTeX — inline `$…$`, block `$$…$$`, or the math dialog (click to edit)
- Customizable keyboard shortcuts (`?` or ⌘/)
- Open / save / export `.md` and `.txt` (one file at a time)
- Selection and document word/character counts
- Dark/light theme and editor UI font controls
- Draft autosave in the browser

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages setup

This repo is configured for a **project site** at `/write/` (repo name `write`).

### One-time GitHub settings

1. Open the repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”)
3. Push to `main` — the workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds Vite output and deploys `dist/`

### Why the unstyled page happened

Default “deploy from branch” often publishes raw source files. The app needs a **built** `dist/` folder, and asset URLs must use the `/write/` base path (see [`vite.config.ts`](vite.config.ts)). Without that, CSS/JS load from `/assets/...` instead of `/write/assets/...` and the UI breaks.

### After you push

- Wait for the **Deploy to GitHub Pages** workflow to finish (Actions tab)
- Visit https://vishalsund.github.io/write/

### Custom domain (optional)

If you point a domain at the repo root, change `base` in `vite.config.ts` from `'/write/'` to `'/'` and redeploy.
