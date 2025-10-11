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

export function createConfettiEmitter(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
) {
  // 小さな矩形テクスチャを生成（カラーは tint で変える）
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 6, 10); // 幅6px, 高さ10px の紙吹雪ピース
  g.generateTexture("confetti", 6, 10);
  const emitter = scene.add
    .particles(0, 0, "confetti", {
      x: { min: -100, max: 500 },
      y: -10,
      speed: { min: 200, max: 400 },
      blendMode: "ADD",
      alpha: { start: 0.8, end: 0.83, random: true },
      speedY: { min: 10, max: 10 },
      lifespan: { min: 2000, max: 4000 },
      gravityY: 5,
      quantity: 5,
      scale: { start: 2.05, end: 3.2, random: true },
      rotate: { start: -720, end: 720, random: true },
      tint: [0xff3b30, 0xffcc00, 0x4cd964, 0x007aff, 0xa52cff, 0xff3333],
      frequency: 550,
    })
    .setDepth(99999999999);

  container.add(emitter);
  emitter.stop();

  return emitter;
}
