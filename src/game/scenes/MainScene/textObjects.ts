import type { GameLevelProps } from "../../../types";
import { formatTimeText, LapTimer } from "./lapTimer";

export function createTextTotalTimer(
  scene: Phaser.Scene,
  cx: number
): { text: Phaser.GameObjects.BitmapText; rect: Phaser.GameObjects.Rectangle } {
  const rectTotalTimer = scene.add.rectangle(
    cx + 3,
    88,
    122,
    29,
    0x000000,
    0.06
  );

  const txtTotalTimer = scene.add
    .bitmapText(cx - 23, 112, "oldschool-black", "00'00.00", 36)
    .setAlpha(0.78)
    .setDepth(999999);

  return { text: txtTotalTimer, rect: rectTotalTimer };
}

export function createTextPrevHighTimer(
  scene: Phaser.Scene,
  cx: number,
  prevHigh: number | null
): Phaser.GameObjects.BitmapText {
  const txtPrevHighTimer = scene.add
    .bitmapText(
      cx - 5,
      65,
      "oldschool-black",
      "Rec: " + formatTimeText(prevHigh),
      21
    )
    .setAlpha(0.7)
    .setDepth(999999);

  return txtPrevHighTimer;
}

export function createtxtGameOver(
  scene: Phaser.Scene,
  cx: number
): Phaser.GameObjects.BitmapText {
  const txt = scene.add
    .bitmapText(cx + 10, 153, "oldschool-white", "Goal!!", 28)
    .setTint(0xcc5656)
    .setOrigin(0.5)
    .setVisible(false);

  return txt;
}

export function initLapTimerText(
  scene: Phaser.Scene,
  gameLevel: GameLevelProps,
  lapTimeObj: LapTimer,
  roadContainer: Phaser.GameObjects.Container
): Phaser.GameObjects.BitmapText[] {
  const txtLapTimerList: Phaser.GameObjects.BitmapText[] = [];

  for (let i = 0; i < 3; i++) {
    const lapText = scene.add
      .bitmapText(12, 330 + 35 * i, "oldschool-white", "", 25)
      .setDepth(999999)
      .setAlpha(0.7);

    roadContainer.add(lapText);
    txtLapTimerList.push(lapText);
    if (gameLevel.mode === "ghost" || gameLevel.mode === "free") {
      lapText.visible = false;
    }
  }
  for (let i = 0; i < 3; i++) {
    lapTimeObj.setTxtLapTime(i, txtLapTimerList);
  }

  return txtLapTimerList;
}

export function createTextGhostNote(
  scene: Phaser.Scene,
  cx: number
): Phaser.GameObjects.Text {
  const txtGhostNote = scene.add
    .text(
      cx - 2,
      160,
      "自己ベスト走行をゴースト表示します\n- 初回は非表示\n- ２分以内に走り切った記録がない場合も非表示\n- このコースは１周のみ\n- 邪魔するバイクなし",
      {
        fontSize: 14,
        color: "#fff",
        lineSpacing: 5,
        stroke: "#333",
        strokeThickness: 4,
      }
    )
    .setOrigin(0.5, 0)
    .setVisible(true)
    .setDepth(999999999);

  return txtGhostNote;
}

export function createTxtStartNum(
  scene: Phaser.Scene,
  curseName: string,
  cx: number
) {
  const txt = scene.add
    .bitmapText(cx, 130, "oldschool-white", `${curseName}`, 25)
    .setTint(0xcc5656)
    .setOrigin(0.5);

  return txt;
}
