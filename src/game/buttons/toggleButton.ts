export function createToggleButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  type: "SOUND" | "FULL",
  handleToggle: () => void,
  getState: () => boolean
) {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x383808, 1);
  graphics.fillRoundedRect(x - 26, y - 7, 49, 14, 3);

  const btnInnerOff = scene.add.rectangle(x + 10, y, 20, 9, 0x999999);

  const btnInnerOn = scene.add.rectangle(x - 10, y, 20, 9, 0xa2c2d0);

  btnInnerOn.visible = getState();
  btnInnerOff.visible = !getState();

  const text = scene.add.bitmapText(x - 1, y + 16, "oldschool-black", type, 10);
  text.setOrigin(0.5);

  graphics.setDepth(9999);
  btnInnerOff.setDepth(9999);
  btnInnerOn.setDepth(9999);
  text.setDepth(9999);

  const rect = scene.add.rectangle(x, y, 55, 25);
  rect.setInteractive({ useHandCursor: true });
  rect.on("pointerdown", () => {
    handleToggle();
    btnInnerOn.visible = getState();
    btnInnerOff.visible = !getState();
  });
}
