export function createCarEmitter(
  scene: Phaser.Scene,
  x: number,
  y: number,
  container: Phaser.GameObjects.Container
) {
  const emitter = scene.add
    .particles(x, y, "smoke", {
      speed: 63,
      lifespan: 1050,

      quantity: 2,
      gravityY: 1800,
      gravityX: 0,
      tint: [0xffff88, 0xffaacc, 0xfffcaa],
      alpha: { start: 0.4, end: 0.3 },
      scale: { start: 1, end: 0 },
      emitting: false,
      frequency: 100,
    })
    .setDepth(999999);

  container.add(emitter);
  return emitter;
}

export function createCarCurveEmitter(
  scene: Phaser.Scene,
  x: number,
  y: number,
  container: Phaser.GameObjects.Container
) {
  const emitter = scene.add
    .particles(x, y, "flare", {
      speed: { min: 100, max: 200 },
      lifespan: { min: 150, max: 400 },
      gravityY: 100,
      quantity: 5,
      blendMode: "ADD",
      tint: [0xff0000, 0xff3300, 0xdf4500],
      alpha: { start: 0.8, end: 0.3 },
      scale: { start: 0.5, end: 0 },
    })
    .setDepth(999999);

  container.add(emitter);
  container.add(emitter);
  return emitter;
}
