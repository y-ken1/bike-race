export function createGameWrapper(
  scene: Phaser.Scene,
  isAuto: boolean = false
) {
  const gameWrapper = scene.add.sprite(
    scene.cameras.main.centerX,
    182,
    "game-wrapper"
  );
  gameWrapper.setDepth(9000);
  gameWrapper.setScale(0.48);

  const bx = scene.cameras.main.centerX - 1;
  const by = scene.cameras.main.centerY;
  const bw = scene.cameras.main.width - 275;
  const bh = scene.cameras.main.height - 110;
  scene.add.rectangle(bx, by, bw, bh, 0x000000);

  const g = scene.add.graphics();
  g.lineStyle(1, 0x443939);
  g.strokeRoundedRect(128, 50, 382, 265, 5);
  g.setDepth(9999);

  const title = scene.add
    .bitmapText(
      scene.cameras.main.width / 2,
      24,
      "oldschool-black",
      "Bike Race",
      14
    )
    .setAlpha(0.35)
    .setOrigin(0.5)
    .setDepth(99999999);

  if (isAuto) {
    gameWrapper.alpha = 0;
    g.alpha = 0;
    title.alpha = 0;
    scene.add
      .rectangle(0, 0, 259, 900, 0x0f0f0f)
      .setDepth(9999999999)
      .setAlpha(0.95);
    scene.add
      .rectangle(635, 0, 259, 900, 0x0f0f0f)
      .setDepth(9999999999)
      .setAlpha(0.95);
    scene.add
      .rectangle(100, 347, 900, 30, 0x0f0f0f)
      .setDepth(9999999999)
      .setAlpha(0.95);
  }
}
