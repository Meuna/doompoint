// Central tunables. Everything gameplay/visual lives here so the rest of the
// engine reads, never hard-codes.
export const config = {
  // Internal framebuffer resolution; CSS upscales it (pixelated) to the window.
  internalWidth: 480,
  internalHeight: 270,

  // Camera plane half-length ~ tan(fov/2). 0.66 ≈ 66° horizontal FOV.
  fov: 0.66,

  moveSpeed: 3.2, // world units / second
  rotSpeed: 2.6, // radians / second (keyboard arrow turning)
  mouseSensitivity: 0.001, // radians per pixel of mouse movement
  pitchSensitivity: 0.6, // framebuffer-px horizon shift per pixel of mouse-Y
  maxPitch: 0.5, // clamp as a fraction of internalHeight (keeps horizon in [0, h])
  playerRadius: 0.22, // collision radius

  // Slide textures are square canvases of this many pixels per side.
  slideTextureSize: 512,

  colors: {
    ceiling: '#1b2330',
    floor: '#33373d',
  },
};
