// Bootstrap: load the deck, build the map, wire input, run the loop.

import { config } from './config.js';
import { loadSlides } from './slides/loader.js';
import { buildGalleryMap } from './world/map.js';
import { createDecals } from './world/decals.js';
import { createPlayer, updatePlayer } from './engine/player.js';
import { createInput } from './engine/input.js';
import { castRays } from './engine/raycaster.js';
import { renderSprites } from './engine/sprites.js';
import { makeBrickTexture, makeDecalTexture } from './engine/textures.js';
import { startLoop } from './engine/loop.js';
import {
  createWeapon,
  fireWeapon,
  updateWeapon,
  renderWeapon,
} from './weapon.js';

async function main() {
  const canvas = document.getElementById('screen');
  canvas.width = config.internalWidth;
  canvas.height = config.internalHeight;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const deck = await loadSlides(config.slideTextureSize);
  document.title = `${deck.title} — DoomPoint`;

  const slides = deck.slides;
  const map = buildGalleryMap(slides.length);
  const player = createPlayer(map.start);
  const input = createInput(canvas);
  const weapon = createWeapon();
  const brick = makeBrickTexture(128);
  const decalTex = makeDecalTexture(64);
  const decals = createDecals();
  const zBuffer = new Float32Array(canvas.width);

  function update(dt) {
    updatePlayer(player, input, map, dt, config);
    updateWeapon(weapon, dt);
    if (input.fire) {
      input.fire = false;
      fireWeapon(weapon, player, map, slides, decals, decalTex);
    }
  }

  function render() {
    // Ceiling + floor as flat bands.
    ctx.fillStyle = config.colors.ceiling;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = config.colors.floor;
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    castRays(ctx, player, map, slides, brick, zBuffer);
    renderSprites(ctx, player, decals, zBuffer);
    renderWeapon(ctx, weapon, input);
  }

  startLoop(update, render);
}

main();
