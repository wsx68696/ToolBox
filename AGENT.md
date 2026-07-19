# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Toolbox is a client-side React developer toolbox. It is a single-page application (SPA) with no backend: all processing happens in the browser so that user data never leaves the device. The app is built with React 19, TypeScript, Vite, Tailwind CSS v4, and React Router v7.

## Common commands

All commands run from the repository root.

```bash
# Install dependencies
npm install

# Start the Vite dev server
npm run dev

# Type-check with TypeScript and build the production bundle to dist/
npm run build

# Preview the production build locally
npm run preview
```

There is currently no test runner, linter, or formatter configured. If you add one, document its command here.

## Tool architecture

A "tool" is a self-contained utility page. To add a new tool you need to touch three places:

1. **Metadata** – add an entry to `src/data/tools.ts` (`ToolMeta`). The `id` becomes the URL slug.
2. **Route** – import the tool component in `src/App.tsx` and add a `<Route path={`/tool/${id}`} element={<...Tool />} />`.
3. **Component** – create `src/tools/{id}.tsx` as a default export. Wrap the UI in `<ToolLayout id={id} title description color>` so the header, back navigation, and recently-used tracking work consistently.

`App.tsx` also owns `RecentContext`, which tracks the three most recently visited tool IDs in `localStorage` under the key `toolbox:recent`. Any tool rendered inside `ToolLayout` automatically calls `markRecent(id)` on mount.

## UI conventions

- The glassmorphism style lives in `src/index.css` through Tailwind `@theme` and `@layer components` classes (`glass-card`, `glass-button`, `glass-input`, `mono-panel`, `aurora-orb`). Prefer these shared primitives over ad-hoc styles.
- Use the shared components in `src/components/`:
  - `GlassCard` – container with themed hover gradient when `interactive`.
  - `GlassButton` – standard action button.
  - `GlassInput` – supports both single-line and multiline (`multiline`) inputs.
  - `CopyButton` – copies a string to the clipboard using `useCopy`.
  - `ToolLayout` – every tool page wrapper.
- Tailwind CSS v4 is configured via `@import "tailwindcss"` in `src/index.css` and the `@tailwindcss/vite` plugin in `vite.config.ts`. There is no separate `tailwind.config.js`.
- Fonts are loaded from `@fontsource/geist-sans` and `@fontsource/geist-mono` in `src/main.tsx` and referenced as CSS custom properties `--font-sans` / `--font-mono`.

## File organization

```
src/
  App.tsx           # Routing, RecentContext provider, tool imports
  main.tsx          # React root, BrowserRouter, fonts, global CSS
  index.css         # Tailwind v4 theme and glassmorphism component styles
  data/tools.ts     # Tool registry (id, name, description, category, color, icon, keywords)
  components/       # Shared UI primitives
  hooks/            # useCopy, useLocalStorage
  tools/            # One file per tool page
```

## Important dependencies

- `react-router` v7 is used in "React Router" mode (`BrowserRouter`, `Routes`, `Route`, `Link`, `Navigate`). It is not the framework/full-stack mode.
- `qrcode` generates QR code data URLs in `src/tools/qrcode.tsx`.
- `lucide-react` provides all icons.
- `crypto.subtle` and `crypto.randomUUID` are used directly in the browser for hashing and UUID generation; no polyfills are provided for older environments.

## Notes

- The production build is emitted to `dist/`.
- `index.html` at the repo root is the Vite entry point; it loads `/src/main.tsx`.
- The app is strictly client-side: avoid adding server-side code, API routes, or build-time secrets.
