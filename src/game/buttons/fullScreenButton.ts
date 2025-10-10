import { toggleFullscreen } from "../../utils/fullscreen";

export function createFullScreenButton(
  scene: Phaser.Scene,
  x: number,
  y: number
) {
  // scene.add.rectangle(x, y, 44, 15, 0x383808, 0.95);

  const graphics = scene.add.graphics();
  graphics.fillStyle(0x383808, 1);
  graphics.fillRoundedRect(x - 25, y - 7, 49, 14, 3);

  const btnInner = scene.add.rectangle(x - 0.5, y, 38, 8, 0xa2c2d0);

  const text = scene.add.bitmapText(
    x - 1,
    y + 14,
    "oldschool-black",
    "FULL",
    10
  );
  text.setOrigin(0.5);

  graphics.setDepth(9999);
  btnInner.setDepth(9999);
  text.setDepth(9999);

  const rect = scene.add.rectangle(x - 3, y, 55, 25).setDepth(99999);
  rect.setInteractive({ useHandCursor: true });
  rect.on("pointerdown", () => {
    btnInner.setAlpha(0.5);
    toggleFullscreen();
  });
  rect.on("pointerup", () => {
    btnInner.setAlpha(1);
  });

  rect.on("pointerout", () => {
    btnInner.setAlpha(1);
  });
}
