// Billboard sprite pass with depth testing against the wall zBuffer.
// Currently renders decals; enemies will reuse this exact path (an array of
// {x, y, size, texture} entries with per-frame update logic).

export function renderSprites(ctx, player, sprites, zBuffer) {
  if (sprites.length === 0) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Sort far -> near so nearer sprites overdraw.
  const order = sprites
    .map((s) => {
      const dx = s.x - player.posX;
      const dy = s.y - player.posY;
      return { s, d2: dx * dx + dy * dy };
    })
    .sort((a, b) => b.d2 - a.d2);

  const invDet =
    1 / (player.planeX * player.dirY - player.dirX * player.planeY);

  for (const { s } of order) {
    const relX = s.x - player.posX;
    const relY = s.y - player.posY;

    // Transform into camera space. transformY is depth (distance along view).
    const transformX = invDet * (player.dirY * relX - player.dirX * relY);
    const transformY = invDet * (-player.planeY * relX + player.planeX * relY);
    if (transformY <= 0.05) continue; // behind camera

    const screenX = Math.floor((w / 2) * (1 + transformX / transformY));
    const dim = Math.abs(h / transformY) * (s.size || 0.3);
    const startX = Math.floor(screenX - dim / 2);
    const endX = Math.floor(screenX + dim / 2);
    const startY = Math.floor(h / 2 - dim / 2);
    const span = endX - startX;
    if (span <= 0) continue;

    for (let stripe = startX; stripe < endX; stripe++) {
      if (stripe < 0 || stripe >= w) continue;
      if (transformY >= zBuffer[stripe]) continue; // occluded by a nearer wall
      const texX = Math.floor(((stripe - startX) / span) * s.texture.width);
      ctx.drawImage(s.texture, texX, 0, 1, s.texture.height, stripe, startY, 1, dim);
    }
  }
}
