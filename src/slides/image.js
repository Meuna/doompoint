// Image file -> wall texture. Draws the image letterboxed (contain) or filled
// (cover) onto a square texture canvas.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed: ' + src));
    img.src = src;
  });
}

export async function renderImageTexture(src, size, fit = 'contain') {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a0f14';
  ctx.fillRect(0, 0, size, size);

  const ar = img.width / img.height;
  let dw, dh;
  if (fit === 'cover') {
    if (ar > 1) {
      dh = size;
      dw = size * ar;
    } else {
      dw = size;
      dh = size / ar;
    }
  } else {
    // contain
    if (ar > 1) {
      dw = size;
      dh = size / ar;
    } else {
      dh = size;
      dw = size * ar;
    }
  }
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
  return canvas;
}
