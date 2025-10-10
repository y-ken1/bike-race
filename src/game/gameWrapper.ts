export function createGameWrapper(scene: Phaser.Scene) {
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

  scene.add
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
}
