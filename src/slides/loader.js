// Slide loading: fetch the manifest, build one texture per slide entry, and
// substitute a visible "missing slide" texture on ANY failure (bad entry, fetch
// error, or markdown rasterization onerror) rather than failing the whole load.

import { renderMarkdownTexture } from './markdown.js';
import { renderImageTexture } from './image.js';
import { makeMissingTexture } from '../engine/textures.js';

export async function loadSlides(size) {
  let manifest;
  try {
    manifest = await (await fetch('slides/manifest.json')).json();
  } catch (e) {
    console.error('Failed to load slides/manifest.json', e);
    return { title: 'DoomPoint (no manifest)', slides: [] };
  }

  const entries = Array.isArray(manifest.slides) ? manifest.slides : [];
  const slides = await Promise.all(
    entries.map((entry, idx) => buildSlide(entry, idx, size))
  );
  return { title: manifest.title || 'DoomPoint', slides };
}

async function buildSlide(entry, idx, size) {
  try {
    let canvas;
    if (entry.type === 'markdown') {
      const md =
        entry.content != null
          ? entry.content
          : await (await fetch('slides/' + entry.src)).text();
      canvas = await renderMarkdownTexture(md, size);
    } else if (entry.type === 'image') {
      canvas = await renderImageTexture('slides/' + entry.src, size, entry.fit);
    } else {
      throw new Error('unknown slide type: ' + entry.type);
    }
    return { canvas, index: idx };
  } catch (e) {
    console.warn(`Slide #${idx + 1} failed; using placeholder.`, e);
    return { canvas: makeMissingTexture(size, idx), index: idx };
  }
}
