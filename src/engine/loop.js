// Minimal variable-timestep loop with a dt clamp (so a backgrounded tab doesn't
// teleport the player on return).

export function startLoop(update, render) {
  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
