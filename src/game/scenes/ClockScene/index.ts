import { Scene } from "phaser";

import type { ClockGameButtonHandlers } from "../../../types";

import {
  createAttackButtons,
  createSoundButton,
  createFullScreenButton,
  createClockGameButtons,
} from "../../buttons";
import { createGameWrapper } from "../../gameWrapper";
import { formatTimeText } from "../MainScene/lapTimer";
import {
  loadFromHighScoreLocalStorage,
  removeAllLoaclStrage,
} from "../../../utils/util";
import { HandleButton } from "../../buttons/handleButton";

export class ClockScene extends Scene {
  bg!: Phaser.GameObjects.Rectangle;

  textDate!: Phaser.GameObjects.BitmapText;
  textTime!: Phaser.GameObjects.BitmapText;
  txtResetComplete!: Phaser.GameObjects.Text;
  msgContainer!: Phaser.GameObjects.Container;
  listLapText!: Phaser.GameObjects.BitmapText[];

  constructor() {
    super("ClockScene");
  }

  initialize() {
    this.listLapText = [];
    createGameWrapper(this);
    this.add.rectangle(300, 155, 900, 900, 0x888833);
    this.add.image(300, 155, "clock-bg").setScale(1.2).setAlpha(0.8);
    this.createButton();
    this.textDate = this.add
      .bitmapText(this.cameras.main.centerX - 10, 75, "oldschool-white", "", 18)
      .setOrigin(0.5)
      .setScale(1, 1.02)
      .setTint(0xfdfdfd)
      .setAlpha(0.9);

    this.textTime = this.add
      .bitmapText(
        this.cameras.main.centerX - 20,
        125,
        "oldschool-white",
        "",
        29
      )
      .setOrigin(0.5)
      .setAlpha(0.9);

    this.add
      .rectangle(388, 159, 114, 153, 0x443333)
      .setOrigin(0, 0)
      .setAlpha(0.15);

    const textX = 445;
    this.add
      .bitmapText(textX, 145, "oldschool-white", "Record", 14)
      .setTint(0xffcccc)
      .setOrigin(0.5);

    const textData: string[] = ["Race 1", "Race 2", "Ghost 1", "Ghost 2"];
    let i = 0;
    let rowRange = 37;
    for (let d of textData) {
      this.add
        .bitmapText(textX, 170 + rowRange * i, "oldschool-white", d, 12)
        .setTint(0xddddff)
        .setOrigin(0.5);

      const txt = this.add
        .bitmapText(textX, 185 + rowRange * i, "oldschool-white", "", 15)
        .setOrigin(0.5);

      i++;
      this.listLapText.push(txt);
    }
    this.setTextLapTime();

    this.msgContainer = this.add.container(300, 162).setVisible(false);
    const rectResetNote = this.add.rectangle(15, 20, 345, 220, 0xffffff, 0.81);
    const txtResetNote = this.add
      .text(
        -80,
        -60,
        "　　記録データの削除\n\n記録データを削除する場合は\n Aボタン を押してください",
        {
          fontSize: 17,
          lineSpacing: 7,
          color: "#000",
        }
      )
      .setOrigin(0);
    const txtResetNote2 = this.add
      .text(-27, 105, "Bボタンでメッセージを閉じます", {
        fontSize: 12.8,
        lineSpacing: 2,
        color: "#000",
      })
      .setOrigin(0);
    this.txtResetComplete = this.add
      .text(-35, 50, "削除しました", {
        fontSize: 17,
        lineSpacing: 7,
        color: "#f00",
      })
      .setOrigin(0)
      .setVisible(false);
    this.msgContainer.add([
      rectResetNote,
      txtResetNote,
      txtResetNote2,
      this.txtResetComplete,
    ]);
  }
  setTextLapTime() {
    const recordR1 = loadFromHighScoreLocalStorage("easy") || null;
    const recordR2 = loadFromHighScoreLocalStorage("hard") || null;
    const recordG1 = loadFromHighScoreLocalStorage("ghost_1") || null;
    const recordG2 = loadFromHighScoreLocalStorage("ghost_2") || null;

    const timeData = [recordR1, recordR2, recordG1, recordG2];
    for (let i = 0; i < this.listLapText.length; i++) {
      this.listLapText[i].text = formatTimeText(timeData[i]);
    }
  }

  create() {
    this.input.addPointer(1);
    this.initialize();
    this.time.addEvent({
      delay: 60,
      loop: true,
      callback: () => {
        this.updateDatetime();
      },
    });

    // Aボタン押下
    this.events.on("downA", () => {
      if (this.msgContainer.visible) {
        removeAllLoaclStrage();
        this.txtResetComplete.setVisible(true);
        setTimeout(() => {
          this.setTextLapTime();
        }, 100);
      }
    });

    // Bボタン押下
    this.events.on("downB", () => {
      if (this.msgContainer.visible) {
        this.msgContainer.setVisible(false);
      }
    });
    // this.add
    //   .bitmapText(20, 50, "oldschool", "123'45.67", 20)
    //   .setDepth(99999999);
  }

  createButton() {
    new HandleButton(this, 58, 290, 33);
    createAttackButtons(this);

    const handleClockGameButton: ClockGameButtonHandlers = {
      TIME: () => {},
      easy: () => this.scene.start("MainScene", { gameLevel: "easy" }),
      hard: () => this.scene.start("MainScene", { gameLevel: "hard" }),
      ghost_1: () => this.scene.start("MainScene", { gameLevel: "ghost_1" }),
      ghost_2: () => this.scene.start("MainScene", { gameLevel: "ghost_2" }),
      free: () => this.scene.start("MainScene", { gameLevel: "free" }),
      reset: () => {
        if (this.msgContainer.visible) return;
        this.txtResetComplete.setVisible(false);
        this.msgContainer.setVisible(true);
      },
    };
    createClockGameButtons(this, handleClockGameButton);
    createFullScreenButton(this);
    createSoundButton(this);
  }

  createDate() {
    const text = this.add.text(184, 72, "2025-01-01", {
      fontSize: 30,
      fontFamily: "'Share Tech Mono', monospace",
      color: "rgb(255,255,255)",
      // stroke: "rgb(200,170,200)",
      // strokeThickness: 3,
    });

    return text;
  }

  createTime() {
    const text = this.add.text(205, 100, "00:00", {
      fontSize: 45,
      fontFamily: "'Share Tech Mono', monospace",
      color: "rgb(255,255,255)",
      stroke: "rgb(170,210,250)",
      strokeThickness: 5,
      letterSpacing: 0.5,
    });
    text.setScale(1.15, 1);
    return text;
  }
  updateDatetime() {
    const now = new Date();

    //  YYY.MM.DD
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(now.getDate()).padStart(2, "0")}`;

    //  HH:MM:SS
    const timeStr =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");

    this.textDate.text = dateStr;
    this.textTime.text = timeStr;
  }
}
