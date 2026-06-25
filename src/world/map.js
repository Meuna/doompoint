// Tile grid + gallery generator.
//
// A tile is { solid: bool, faces?: { N|S|E|W: { kind:'slide', index } } }.
// "A slide on a wall" is just a solid tile whose approached face resolves to a
// slide texture. The generator is isolated so a hand-authored map can replace
// it later without touching the engine.

const SOLID_OOB = { solid: true }; // returned for out-of-bounds queries

class GameMap {
  constructor(grid, start) {
    this.grid = grid; // grid[y][x]
    this.height = grid.length;
    this.width = grid[0].length;
    this.start = start;
  }

  get(x, y) {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) return SOLID_OOB;
    return this.grid[y][x];
  }

  isSolid(x, y) {
    return this.get(x, y).solid;
  }
}

// Build a straight gallery corridor (3 tiles wide along x) whose length scales
// with the slide count. Slides alternate onto the west and east walls in order;
// the player walks +y down the hall to present them.
export function buildGalleryMap(slideCount) {
  const rows = Math.max(1, Math.ceil(slideCount / 2)); // slide rows per wall pair
  const spacing = 4; // tiles between successive slides on a wall
  const firstY = 3; // y of the first slide row
  const width = 5; // x: 0 and 4 are walls, 1..3 interior
  const height = firstY + rows * spacing; // leave a wall cap past the last slide

  // Fill: border solid, interior empty.
  const grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      row.push(isBorder ? { solid: true } : { solid: false });
    }
    grid.push(row);
  }

  // Place slides on the side walls.
  for (let i = 0; i < slideCount; i++) {
    const row = Math.floor(i / 2);
    const onWest = i % 2 === 0;
    const y = firstY + row * spacing;
    const x = onWest ? 0 : width - 1;
    const face = onWest ? 'E' : 'W'; // interior-facing face
    const tile = grid[y][x];
    tile.faces = tile.faces || {};
    tile.faces[face] = { kind: 'slide', index: i };
  }

  const start = {
    x: 2.5, // center of the corridor
    y: 1.5,
    dirX: 0, // facing +y (down the corridor)
    dirY: 1,
    planeX: 0.66, // FOV plane, perpendicular to dir
    planeY: 0,
  };

  return new GameMap(grid, start);
}
