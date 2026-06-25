# DoomPoint

A toy, Doom-like slide presentation webapp. Slides are textures on the walls of
a simple map. Walk up to a slide, look at it, and **fire** to leave a mark and
highlight it. Built as a from-scratch vanilla-JS canvas raycaster — no build
step, no dependencies.

## Run

It's a static site; serve the folder with any static server:

```bash
git clone https://github.com/Meuna/doompoint.git
cd doompoint
python3 -m http.server 8000
# open http://localhost:8000/
```

(A server is required — ES modules and `fetch` don't work from `file://`.)

## Controls

- **Click** the canvas to capture the mouse (pointer lock).
- **WASD** / arrows — move & strafe.
- **Mouse** — look around (left/right turns, up/down tilts the view).
- **Click** — fire (leaves a bullet decal; highlights a slide if you hit one).
- **Esc** — release the mouse.

Note: vertical look is a **Y-shear** — the horizon slides up/down to reframe the
view, rather than a true 3D pitch (the map is a flat grid). One consequence:
shots always land at wall-center height, so firing toggles the whole slide's
highlight regardless of how far up or down you're looking.

## Authoring slides

Everything lives in `slides/`. Edit `slides/manifest.json` — the order of the
list is the order slides appear along the corridor (alternating left/right
walls).

```json
{
  "title": "My Deck",
  "slides": [
    { "type": "markdown", "src": "01-title.md" },
    { "type": "markdown", "src": "02-agenda.md", "highlightColor": "#ff5555" },
    { "type": "markdown", "content": "# Inline\nNo file needed." },
    { "type": "image", "src": "04-demo.png", "fit": "contain" }
  ]
}
```

Per-slide fields:

- `type`: `"markdown"` or `"image"`.
- `src`: path relative to `slides/`.
- `content`: (markdown only) inline markdown instead of a `src` file.
- `highlightColor`: tint applied when you shoot the slide (default amber).
- `fit`: (image only) `"contain"` (default) or `"cover"`.

A slide that fails to load shows a magenta "SLIDE #N MISSING" placeholder and a
console warning — the rest of the deck still loads.

### Markdown support

A small built-in subset: headings (`#`..`######`), `- `/`* ` and `1.` lists,
`**bold**`, `*italic*`, `` `code` ``, fenced ``` code blocks, `---` rules, and
paragraphs. Slide visuals are styled by `styles/slide.css`.

Markdown is rasterized to a wall texture via an SVG `<foreignObject>`. Because of
how browsers rasterize SVG, slide CSS must be self-contained (no web fonts, no
external images) — `styles/slide.css` already follows this.

## Project layout

```
index.html            entry point
styles/app.css        page + canvas (pixelated upscale)
styles/slide.css      styling inlined into markdown slide textures
vendor/markdown.js    tiny markdown -> strict-XHTML converter
src/config.js         tunables (FOV, speed, resolution)
src/engine/           loop, player, input, raycaster, sprites, textures
src/world/            map (gallery generator) + decals
src/slides/           manifest loader + markdown/image texture builders
src/weapon.js         gun HUD, firing, hit resolution
slides/               YOUR CONTENT (manifest + .md + images)
```

## Designed to grow

This first iteration leaves clean seams for the next ones:

- **Full textures** — `src/engine/textures.js` is the single source of wall
  pixels, and tiles already carry texture references. Swap the procedural brick
  for an image atlas and add floor/ceiling casting.
- **Enemies** — `src/engine/sprites.js` already renders depth-tested billboards.
  An `entities` array with per-frame AI reuses the exact render path; decals and
  enemies share the sprite system.
