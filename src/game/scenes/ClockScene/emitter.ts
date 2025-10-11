export function createClockEmitter(scene: Phaser.Scene, x: number, y: number) {
  const emitter = scene.add
    .particles(x, y, "smoke", {
      speed: 63,
      lifespan: 350,

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

  return emitter;
}
