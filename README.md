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

### One-time GitHub setup (two steps — order matters)

**Step 1 — Create the `gh-pages` branch (do this first)**

You cannot select `gh-pages` in Pages settings until the branch exists. Leave Pages as-is for now (GitHub Actions or “Deploy from branch / main” is fine).

1. Push `main` with the latest code (includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
2. Open **Actions** → **Deploy to GitHub Pages** → **Run workflow** (or wait for the push to trigger it)
3. When it finishes, confirm branch `gh-pages` exists: **Code** → branch dropdown → you should see `gh-pages`

**Step 2 — Point Pages at that branch**

1. **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` · **Folder:** `/ (root)` → **Save**
4. Wait ~1 minute, then hard-refresh https://vishalsund.github.io/write/

### Why the unstyled page happened

GitHub was serving **raw source** from `main` (`<script src="/src/main.ts">`), not the built app. The UI needs the Vite build in `dist/` with base path `/write/` (see [`vite.config.ts`](vite.config.ts)).

If you previously used “Deploy from branch” with `main`, that causes this. The workflow now publishes only `dist/` to `gh-pages`.

### After you push

- Wait for **Deploy to GitHub Pages** to finish (Actions tab)
- Hard-refresh https://vishalsund.github.io/write/ (Cmd+Shift+R)
- In the page source you should see `/write/assets/...js`, not `/src/main.ts`

### Custom domain (optional)

If you point a domain at the repo root, change `base` in `vite.config.ts` from `'/write/'` to `'/'` and redeploy.
