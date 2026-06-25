// Player state + movement with simple per-axis circle-vs-tile collision so the
// player slides along walls instead of sticking.

export function createPlayer(start) {
  return {
    posX: start.x,
    posY: start.y,
    dirX: start.dirX,
    dirY: start.dirY,
    planeX: start.planeX,
    planeY: start.planeY,
  };
}

export function rotate(p, a) {
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const odx = p.dirX;
  p.dirX = p.dirX * cos - p.dirY * sin;
  p.dirY = odx * sin + p.dirY * cos;
  const opx = p.planeX;
  p.planeX = p.planeX * cos - p.planeY * sin;
  p.planeY = opx * sin + p.planeY * cos;
}

function blocked(map, x, y, r) {
  for (let cx = Math.floor(x - r); cx <= Math.floor(x + r); cx++) {
    for (let cy = Math.floor(y - r); cy <= Math.floor(y + r); cy++) {
      if (!map.isSolid(cx, cy)) continue;
      // closest point on the cell to the player center
      const nx = Math.max(cx, Math.min(x, cx + 1));
      const ny = Math.max(cy, Math.min(y, cy + 1));
      const dx = x - nx;
      const dy = y - ny;
      if (dx * dx + dy * dy < r * r) return true;
    }
  }
  return false;
}

export function updatePlayer(p, input, map, dt, cfg) {
  // Look.
  if (input.yaw) {
    rotate(p, input.yaw * cfg.mouseSensitivity);
    input.yaw = 0;
  }
  if (input.turnLeft) rotate(p, -cfg.rotSpeed * dt);
  if (input.turnRight) rotate(p, cfg.rotSpeed * dt);

  // Move.
  const fwd = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
  const str = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  // "right" is dir rotated -90°.
  const rightX = p.dirY;
  const rightY = -p.dirX;
  let vx = p.dirX * fwd + rightX * str;
  let vy = p.dirY * fwd + rightY * str;
  const len = Math.hypot(vx, vy);
  if (len === 0) return;
  vx = (vx / len) * cfg.moveSpeed * dt;
  vy = (vy / len) * cfg.moveSpeed * dt;

  const r = cfg.playerRadius;
  const nx = p.posX + vx;
  if (!blocked(map, nx, p.posY, r)) p.posX = nx;
  const ny = p.posY + vy;
  if (!blocked(map, p.posX, ny, r)) p.posY = ny;
}
