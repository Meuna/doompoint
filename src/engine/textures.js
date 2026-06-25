// Procedural textures. This is the single source of non-slide wall pixels — the
// "full texture" iteration plugs in here (swap procedural for an image atlas)
// without touching the raycaster.

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Default wall: simple brick with mortar.
export function makeBrickTexture(size = 128) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5a4036'; // mortar
  ctx.fillRect(0, 0, size, size);

  const rows = 8;
  const cols = 4;
  const bh = size / rows;
  const bw = size / cols;
  const gap = Math.max(1, size / 64);

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 ? bw / 2 : 0;
    for (let col = -1; col < cols + 1; col++) {
      const x = col * bw + offset + gap;
      const y = r * bh + gap;
      // slight per-brick shade variation
      const v = 150 + ((r * 31 + col * 17) % 40);
      ctx.fillStyle = `rgb(${v}, ${Math.floor(v * 0.45)}, ${Math.floor(v * 0.35)})`;
      ctx.fillRect(x, y, bw - gap * 2, bh - gap * 2);
    }
  }
  return c;
}

// Placeholder shown when a slide fails to load.
export function makeMissingTexture(size = 512, idx = 0) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const t = 32;
  for (let y = 0; y < size; y += t) {
    for (let x = 0; x < size; x += t) {
      ctx.fillStyle = (x / t + y / t) % 2 ? '#1a1a1a' : '#c000c0';
      ctx.fillRect(x, y, t, t);
    }
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size / 12}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SLIDE', size / 2, size / 2 - size / 14);
  ctx.fillText(`#${idx + 1} MISSING`, size / 2, size / 2 + size / 14);
  return c;
}

// Bullet-hole decal. Transparent outside so the billboard reads as a hole.
export function makeDecalTexture(size = 64) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, size * 0.42);
  g.addColorStop(0, 'rgba(0,0,0,0.95)');
  g.addColorStop(0.6, 'rgba(20,15,10,0.8)');
  g.addColorStop(0.85, 'rgba(60,50,40,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // a few cracks
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = Math.max(1, size / 48);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * size * 0.45, cy + Math.sin(a) * size * 0.45);
    ctx.stroke();
  }
  return c;
}
