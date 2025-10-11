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
import { createClockEmitter } from "./emitter";

export class ClockScene extends Scene {
  bg!: Phaser.GameObjects.Rectangle;
  textDate!: Phaser.GameObjects.BitmapText;
  textTime!: Phaser.GameObjects.BitmapText;
  txtResetComplete!: Phaser.GameObjects.Text;
  resetMsgContainer!: Phaser.GameObjects.Container;
  helpContainer!: Phaser.GameObjects.Container;
  listLapText!: Phaser.GameObjects.BitmapText[];
  playerCar!: Phaser.GameObjects.Image;
  clockEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  isClockEmitterON!: boolean;

  constructor() {
    super("ClockScene");
  }

  initialize() {
    this.listLapText = [];
    createGameWrapper(this);
    this.add.rectangle(300, 155, 900, 900, 0x888833);

    this.clockEmitter = createClockEmitter(this, 100, 200);
    this.clockEmitter.setScale(0.5);
    this.isClockEmitterON = false;

    this.add.image(300, 155, "clock-bg").setScale(1.2).setAlpha(0.8);
    this.playerCar = this.add
      .image(300, 275, "car03")
      .setScale(0.2)
      .setAlpha(0.8)
      .setOrigin(0.5, 1);

    this.createButton();
    this.createTextDateTime();
    this.createLapRecord();

    this.resetMsgContainer = this.add
      .container(this.cameras.main.centerX, this.cameras.main.centerY)
      .setVisible(false);
    this.createResetNote();

    this.helpContainer = this.add
      .container(this.cameras.main.centerX, this.cameras.main.centerY)
      .setVisible(false);
    this.createHelp();
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
      if (this.helpContainer.visible) {
        return;
      } else if (this.resetMsgContainer.visible) {
        removeAllLoaclStrage();
        this.txtResetComplete.setVisible(true);
        setTimeout(() => {
          this.setTextLapTime();
        }, 100);
      } else {
        if (!this.isClockEmitterON) {
          const baseX = 15;
          const baseY = -5;

          const r = this.playerCar.rotation;
          const x = baseX * Math.cos(r) - baseY * Math.sin(r);
          const y = baseX * Math.sin(r) + baseY * Math.cos(r);
          this.clockEmitter.setPosition(
            this.playerCar.x + x,
            this.playerCar.y + y
          );

          this.isClockEmitterON = true;
          this.clockEmitter.start();
          setTimeout(() => {
            this.clockEmitter.stop();
            this.isClockEmitterON = false;
          }, 500);
        }
      }
    });

    // Bボタン押下
    this.events.on("downB", () => {
      if (this.resetMsgContainer.visible) {
        this.resetMsgContainer.setVisible(false);
      }
      if (this.helpContainer.visible) {
        this.helpContainer.setVisible(false);
      }
    });

    this.events.on("steerChanged", (steer: number) => {
      const angle = steer * 30;
      this.playerCar.setAngle(angle);
    });
  }

  createButton() {
    new HandleButton(this, 58, 290, 33);
    createAttackButtons(this);

    const handleClockGameButton: ClockGameButtonHandlers = {
      TIME: () => {
        this.scene.start("ClockScene");
      },
      easy: () => this.scene.start("MainScene", { gameLevel: "easy" }),
      hard: () => this.scene.start("MainScene", { gameLevel: "hard" }),
      ghost_1: () => this.scene.start("MainScene", { gameLevel: "ghost_1" }),
      ghost_2: () => this.scene.start("MainScene", { gameLevel: "ghost_2" }),
      free: () => this.scene.start("MainScene", { gameLevel: "free" }),
      reset: () => {
        if (this.resetMsgContainer.visible) return;
        if (this.helpContainer.visible) return;

        // this.txtResetComplete.setVisible(false);
        this.resetMsgContainer.setVisible(true);
      },
      help: () => {
        if (this.resetMsgContainer.visible) return;
        if (this.helpContainer.visible) return;
        this.helpContainer.setVisible(true);
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

  createResetNote() {
    const msg = this.add.image(0, 0, "reset").setScale(0.83).setTint(0xf0dddd);
    // const rectResetNote = this.add.rectangle(0, 0, 345, 220, 0xffffff, 1);
    // const txtResetNote = this.add
    //   .text(
    //     0,
    //     -48,
    //     "　　記録データの削除\n\n記録データを削除する場合は\n Aボタン を押してください",
    //     {
    //       fontSize: 17,
    //       lineSpacing: 7,
    //       color: "#000",
    //     }
    //   )
    //   .setOrigin(0.5);
    // const txtClose = this.add
    //   .text(-15, 90, "Bボタンでメッセージを閉じます", {
    //     fontSize: 11,
    //     lineSpacing: 2,
    //     color: "#000",
    //   })
    //   .setOrigin(0);

    this.txtResetComplete = this.add
      .text(0, 30, "削除しました", {
        fontSize: 17,
        color: "#f00",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.resetMsgContainer.add([msg, this.txtResetComplete]);
  }
  createHelp() {
    const msg = this.add.image(0, 0, "help").setScale(0.61).setTint(0xdffdfd);
    //     const rectHelp = this.add.rectangle(0, 0, 345, 220, 0xffffff, 1);

    //     const helpText = `
    // 【タッチ操作】
    // 　　　ハンドル（左下）: ハンドル操作
    // 　　　Aボタン（右下）: アクセル
    // 　　　Bボタン（右下）: ブレーキ

    // 【キーボード操作】
    // 　　　← → : ハンドル操作
    // 　　　↑ : アクセル
    // 　　　↓ : ブレーキ

    // 【ゲームパッド操作】
    // 　　　左スティック : ハンドル操作
    // 　　　Aボタン: アクセル
    // 　　　Bボタン: ブレーキ
    // `;
    //     const note = this.add
    //       .text(-50, -118, helpText, {
    //         fontSize: 11,
    //         lineSpacing: 1,
    //         color: "#000",
    //       })
    //       .setOrigin(0.5, 0);

    //     const txtClose = this.add
    //       .text(-15, 90, "Bボタンでメッセージを閉じます", {
    //         fontSize: 11,
    //         lineSpacing: 2,
    //         color: "#000",
    //       })
    //       .setOrigin(0);

    this.helpContainer.add(msg);
  }

  createLapRecord() {
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

  createTextDateTime() {
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
}
