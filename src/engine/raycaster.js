// DDA raycaster: one ray per framebuffer column. Renders textured wall columns
// and fills a per-column depth buffer (zBuffer) consumed by the sprite pass.
//
// Texture sampling uses drawImage of a 1px-wide source slice — never
// getImageData. Slide textures are rasterized from SVG/foreignObject and may be
// canvas-"tainted"; drawImage never reads pixels back, so tainting can't break
// rendering (getImageData would throw SecurityError).

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// Core DDA. Returns the hit cell, which side/face was struck, the perpendicular
// distance, the exact world hit point, and the texture U coordinate (0..1).
function castDDA(player, map, rayDirX, rayDirY) {
  let mapX = Math.floor(player.posX);
  let mapY = Math.floor(player.posY);
  const deltaDistX = Math.abs(1 / rayDirX);
  const deltaDistY = Math.abs(1 / rayDirY);

  let stepX, stepY, sideDistX, sideDistY;
  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (player.posX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1 - player.posX) * deltaDistX;
  }
  if (rayDirY < 0) {
    stepY = -1;
    sideDistY = (player.posY - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1 - player.posY) * deltaDistY;
  }

  let side = 0;
  let guard = 0;
  while (guard++ < 256) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }
    if (map.isSolid(mapX, mapY)) break;
  }

  const perpWallDist =
    side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;

  // Which face of the cell we are looking at.
  let face;
  if (side === 0) face = rayDirX > 0 ? 'W' : 'E';
  else face = rayDirY > 0 ? 'N' : 'S';

  // Texture U: fractional part of the wall hit along its run.
  let wallX =
    side === 0
      ? player.posY + perpWallDist * rayDirY
      : player.posX + perpWallDist * rayDirX;
  wallX -= Math.floor(wallX);

  return {
    mapX,
    mapY,
    side,
    face,
    dist: perpWallDist,
    wallX,
    hitX: player.posX + perpWallDist * rayDirX,
    hitY: player.posY + perpWallDist * rayDirY,
  };
}

// Single center ray (used by the weapon for hit resolution).
export function singleRay(player, map) {
  return castDDA(player, map, player.dirX, player.dirY);
}

// Full screen wall pass.
export function castRays(ctx, player, map, slides, defaultTex, zBuffer) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  for (let x = 0; x < w; x++) {
    const cameraX = (2 * x) / w - 1;
    const rayDirX = player.dirX + player.planeX * cameraX;
    const rayDirY = player.dirY + player.planeY * cameraX;

    const hit = castDDA(player, map, rayDirX, rayDirY);
    const dist = Math.max(hit.dist, 0.0001);
    zBuffer[x] = dist;

    const lineHeight = h / dist;
    const drawStart = -lineHeight / 2 + h / 2;

    // Resolve which texture this face shows.
    const tile = map.get(hit.mapX, hit.mapY);
    const ref = tile.faces ? tile.faces[hit.face] : null;
    let tex = defaultTex;
    let highlight = null;
    if (ref && ref.kind === 'slide') {
      const s = slides[ref.index];
      tex = s.canvas;
      if (s.highlighted) highlight = s.highlightColor;
    }

    let texX = Math.floor(hit.wallX * tex.width);
    // Mirror so texture orientation is consistent across the two opposing faces.
    if (hit.side === 0 && rayDirX > 0) texX = tex.width - texX - 1;
    if (hit.side === 1 && rayDirY < 0) texX = tex.width - texX - 1;

    // Draw the full (possibly off-screen) column; the canvas clips for us.
    ctx.drawImage(tex, texX, 0, 1, tex.height, x, drawStart, 1, lineHeight);

    // Cheap directional shading: darken y-faces.
    if (hit.side === 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(x, drawStart, 1, lineHeight);
    }
    if (highlight) {
      ctx.fillStyle = hexToRgba(highlight, 0.25);
      ctx.fillRect(x, drawStart, 1, lineHeight);
    }
  }
}
