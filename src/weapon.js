// Gun HUD + firing. Firing casts a center ray: it always leaves a decal on the
// hit wall, and if that wall face is a slide it toggles the slide's highlight.

import { singleRay } from './engine/raycaster.js';
import { addDecal } from './world/decals.js';

export function createWeapon() {
  return { flash: 0, recoil: 0 };
}

export function fireWeapon(weapon, player, map, slides, decals, decalTex) {
  weapon.flash = 0.07;
  weapon.recoil = 0.13;

  const hit = singleRay(player, map);
  if (!hit) return;

  // Nudge the decal slightly off the wall toward the player to avoid z-fighting.
  addDecal(decals, {
    x: hit.hitX - player.dirX * 0.02,
    y: hit.hitY - player.dirY * 0.02,
    size: 0.16,
    texture: decalTex,
  });

  const tile = map.get(hit.mapX, hit.mapY);
  const ref = tile.faces && tile.faces[hit.face];
  if (ref && ref.kind === 'slide') {
    const s = slides[ref.index];
    s.highlighted = !s.highlighted;
  }
}

export function updateWeapon(weapon, dt) {
  if (weapon.flash > 0) weapon.flash -= dt;
  if (weapon.recoil > 0) weapon.recoil -= dt;
}

export function renderWeapon(ctx, weapon, input) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;

  // Crosshair.
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 5, h / 2);
  ctx.lineTo(cx + 5, h / 2);
  ctx.moveTo(cx, h / 2 - 5);
  ctx.lineTo(cx, h / 2 + 5);
  ctx.stroke();

  // Gun: a simple procedural pistol at bottom-center, with recoil bob.
  const recoil = Math.max(0, weapon.recoil) * 60;
  const gunW = 46;
  const gunH = 60;
  const gx = cx - gunW / 2;
  const gy = h - gunH + recoil;

  ctx.fillStyle = '#2a2a2e';
  ctx.fillRect(gx, gy + 22, gunW, gunH); // body
  ctx.fillStyle = '#3c3c42';
  ctx.fillRect(cx - 7, gy, 14, 34); // barrel
  ctx.fillStyle = '#141416';
  ctx.fillRect(cx - 3, gy - 2, 6, 8); // muzzle

  // Muzzle flash.
  if (weapon.flash > 0) {
    const r = 7 + weapon.flash * 120;
    const g = ctx.createRadialGradient(cx, gy - 2, 1, cx, gy - 2, r);
    g.addColorStop(0, 'rgba(255,240,180,0.95)');
    g.addColorStop(0.5, 'rgba(255,170,40,0.7)');
    g.addColorStop(1, 'rgba(255,120,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, gy - 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
