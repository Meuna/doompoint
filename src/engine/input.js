// Keyboard + pointer-lock mouse input. Returns a mutable state object the game
// loop reads each frame. Mouse yaw accumulates between frames; `fire` is a
// one-shot the loop consumes.

export function createInput(canvas) {
  const state = {
    forward: false,
    back: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
    yaw: 0,
    fire: false,
    locked: false,
  };

  const keymap = {
    KeyW: 'forward',
    KeyS: 'back',
    KeyA: 'left',
    KeyD: 'right',
    ArrowUp: 'forward',
    ArrowDown: 'back',
    ArrowLeft: 'turnLeft',
    ArrowRight: 'turnRight',
  };

  window.addEventListener('keydown', (e) => {
    const action = keymap[e.code];
    if (action) {
      state[action] = true;
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    const action = keymap[e.code];
    if (action) state[action] = false;
  });

  canvas.addEventListener('mousedown', () => {
    if (!state.locked) canvas.requestPointerLock();
    else state.fire = true;
  });

  document.addEventListener('pointerlockchange', () => {
    state.locked = document.pointerLockElement === canvas;
    document.body.classList.toggle('locked', state.locked);
  });

  document.addEventListener('mousemove', (e) => {
    if (state.locked) state.yaw += e.movementX;
  });

  return state;
}
