// Markdown -> wall texture, via SVG <foreignObject> rasterization.
//
// Hard constraints of SVG-as-Image rendering, all handled here:
//   1. CSS must be INLINED (an external <link> does nothing). We fetch
//      styles/slide.css and inject it inside a CDATA <style> block.
//   2. Markup must be well-formed XML in the XHTML namespace; our markdown
//      converter guarantees closed tags. Malformed markup fails the Image load
//      SILENTLY, so we reject on Image.onerror and let the loader fall back.
//   3. No external images inside the foreignObject.

import { markdownToXhtml } from '../../vendor/markdown.js';

let cssCache = null;
async function getSlideCss() {
  if (cssCache === null) {
    try {
      cssCache = await (await fetch('styles/slide.css')).text();
    } catch (e) {
      console.warn('Could not load styles/slide.css; slides will be unstyled.', e);
      cssCache = '';
    }
  }
  return cssCache;
}

export async function renderMarkdownTexture(md, size) {
  const css = await getSlideCss();
  const body = markdownToXhtml(md);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<foreignObject x="0" y="0" width="${size}" height="${size}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" class="slide">` +
    `<style><![CDATA[${css}]]></style>` +
    `<div class="slide-content">${body}</div>` +
    `</div>` +
    `</foreignObject></svg>`;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  await new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = '#0a0f14';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG/foreignObject rasterization failed'));
    };
    img.src = url;
  });

  return canvas;
}
