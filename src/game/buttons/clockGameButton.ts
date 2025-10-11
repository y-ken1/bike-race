import type { GameLevel } from "../../types";

export function createClockGameButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  type: "TIME" | "reset" | "help" | GameLevel,
  handleClick: () => void
) {
  // outer

  const outerColor = 0x383808;
  const outerAlpha = 0.5;
  const innerColor = 0xccdccf;

  const graphics = scene.add.graphics();
  graphics.fillStyle(outerColor, outerAlpha);
  graphics.fillRoundedRect(x - 29, y - 8, 58, 16, 5);
  graphics.setDepth(9999);

  // scene.add.rectangle(x, y, 44, 18, 0x383808, 0.95);

  const btnInner = scene.add.rectangle(x, y, 50, 12, innerColor);

  let btnLabel = "TIME";
  if (type === "reset") {
    btnLabel = "RESET";
  } else if (type === "help") {
    btnLabel = "HELP";
  } else if (type === "easy") {
    btnLabel = "Race 1";
  } else if (type === "hard") {
    btnLabel = "Race 2";
  } else if (type === "free") {
    btnLabel = "Free";
  } else if (type === "ghost_1") {
    btnLabel = "Ghost1";
  } else if (type === "ghost_2") {
    btnLabel = "Ghost2";
  }
  const text = scene.add.bitmapText(x, y - 1, "oldschool-white", btnLabel, 14);
  text.setScale(0.7, 0.72);
  text.setTint(0x201000);
  text.setOrigin(0.5);
  if (
    (type === "reset" || type === "help") &&
    scene.scene.key !== "ClockScene"
  ) {
    text.setAlpha(0.35);
  }

  btnInner.setDepth(9999);
  text.setDepth(9999);

  const rect = scene.add.rectangle(x, y, 57, 30);
  // rect.setDepth(999999);
  rect.setInteractive({ useHandCursor: true });
  rect.on("pointerdown", () => {
    btnInner.setAlpha(0.5);
    handleClick();
  });
  rect.on("pointerup", () => {
    btnInner.setAlpha(1);
  });

  rect.on("pointerout", () => {
    btnInner.setAlpha(1);
  });
}
