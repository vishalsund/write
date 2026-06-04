# Write

A minimal WYSIWYG writing app. Markdown is stored under the hood; you edit like a simple word processor.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

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
