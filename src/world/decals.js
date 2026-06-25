// Decal store. A decal is a billboard sprite stuck to a wall surface at a world
// point: { x, y, zOff, size, texture } (zOff = height above eye level, set from
// the vertical aim). Kept as a plain growable list the sprite pass renders directly.

const MAX_DECALS = 64; // cap so long sessions don't grow unbounded

export function createDecals() {
  return [];
}

export function addDecal(decals, decal) {
  decals.push(decal);
  if (decals.length > MAX_DECALS) decals.shift();
}
