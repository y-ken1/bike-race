import { Scene } from "phaser";
import {
  compressToBase64,
  decompressFromBase64,
  loadFromHighScoreLocalStorage,
  loadHistoryDataGhost,
  playSound,
  saveHistoryData,
  saveToHighScoreLocalStorage,
  stopSound,
  Vec2,
} from "../../../utils/util";

import {
  createAttackButtons as createActionButtons,
  createClockGameButtons,
  createFullScreenButton,
  createSoundButton,
} from "../../buttons";
import { createGameWrapper } from "../../gameWrapper";

import Phaser from "phaser";
import { HandleButton } from "../../buttons/handleButton";
import { SpeedMeter } from "../../GameObjects/speedMeter";
import type {
  Car,
  ClockGameButtonHandlers,
  GameLevel,
  RoadData,
  RoadObject,
  RoadPosData,
  SoundType,
} from "../../../types";
import { createKeyEvent } from "./keyEvent";
import { createBg1, createGrassLand, createTower } from "./backObject";
import { createCarCurveEmitter, createCarEmitter } from "./carEmitter";
import {
  COLOR_ROAD,
  COLOR_ROAD_LINE_INNER,
  COLOR_ROAD_LINE_OUTER,
  COLOR_ROAD_START_LINE,
  MAX_SPEED,
  PlayerY,
  ROAD_DATA_LR_UD,
} from "../../../utils/const";
import { createCars } from "./car";
import { createRoadObjects } from "./roadObject";
import { formatTimeText, isWithinTwoMinutes, LapTimer } from "./lapTimer";
import { isAvailableSound } from "../../main";
import { MyGamepad } from "../../gamePad";

// 線形補間
function leapBoard(a: number, b: number, j: number, board: number) {
  return (a * (board - j) + b * j) / board;
}

function getRoadData(level: GameLevel): RoadData {
  const dataLR = ROAD_DATA_LR_UD[level].DATA_LR;
  const dataUD = ROAD_DATA_LR_UD[level].DATA_UD;
  const cLen = dataLR.length;
  const board = 120;
  const cMax = board * cLen;
  const enemyNum = ROAD_DATA_LR_UD[level].ENEMY_NUM;

  return {
    dataLR,
    dataUD,
    cLen,
    board,
    cMax,
    enemyNum,
  };
}

export class MainScene extends Scene {
  isCountdownStart: boolean;
  isGameReady: boolean;
  isGameover: boolean;

  CX!: number;
  CY!: number;
  roadGraphics!: Phaser.GameObjects.Graphics;
  dataBoardW!: number[];
  dataBoardH!: number[];
  dataBoardUD!: number[];
  curve!: number[];
  updown!: number[];
  objectRight!: number[];
  objectLeft!: number[];
  bg1!: Phaser.GameObjects.Image;
  tower!: Phaser.GameObjects.Image;
  grassLand!: Phaser.GameObjects.Image;
  carContainer!: Phaser.GameObjects.Container;
  roadContainer!: Phaser.GameObjects.Container;
  roadObjects!: RoadObject[];

  cars!: Car[];
  steer!: number;
  speedMeter!: SpeedMeter;
  carEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  carCurveEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  // school!: Phaser.GameObjects.Image;
  updateElapseAfterStart!: number;
  updateElapseBeforeStart!: number;
  isPlayerOutRoad!: boolean;
  txtTotalTimer!: Phaser.GameObjects.BitmapText;
  txtPrevHighTimer!: Phaser.GameObjects.BitmapText;
  lapTimeObj!: LapTimer;
  startTime!: number;
  txtLapTimerList!: Phaser.GameObjects.BitmapText[];
  txtGameOver!: Phaser.GameObjects.BitmapText;
  sdCountdown!: SoundType;
  sdBikeStart!: SoundType;
  sdReady!: SoundType;
  sdGo!: SoundType;
  sdBikeRun!: SoundType;
  sdBikeBreak!: SoundType;
  sdLap2!: SoundType;
  sdLapFinal!: SoundType;
  sdGoal!: SoundType;
  sdGoalNewRecord!: SoundType;
  sdContact!: SoundType;

  isBreakSoundOn!: boolean;
  isContactSoundOn!: boolean;
  isStartSoundBikeRun!: boolean;
  roadData!: RoadData;
  gameLevel!: GameLevel;
  mapContainer!: Phaser.GameObjects.Container;
  mapPoints!: { x: number; y: number; angle: number }[];
  gMapPlayer!: Phaser.GameObjects.Graphics;
  mapImage!: Phaser.GameObjects.Image | null;
  timerGamepadSpeeedChange!: number;
  gamepad!: MyGamepad;

  playerCurRecord!: {
    x: number;
    y: number;
    r: number;
  }[];

  playerTopHistory!: {
    x: number;
    y: number;
    r: number;
  }[];
  isGhostMode!: boolean;
  lapLimit!: number;
  txtGhostNote!: Phaser.GameObjects.Text;
  emitterConfetti!: Phaser.GameObjects.Particles.ParticleEmitter;

  // pad!: Phaser.Input.Gamepad.Gamepad | undefined;
  // fpsText!: Phaser.GameObjects.Text;

  constructor() {
    super("MainScene");

    this.isCountdownStart = false;
    this.isGameReady = true;
    this.isGameover = false;
    this.timerGamepadSpeeedChange = 0;
  }

  async loadPlayerTopHistoryData() {
    if (
      this.gameLevel === "easy" ||
      this.gameLevel === "hard" ||
      this.gameLevel === "free"
    ) {
      return;
    }

    const historyData = loadHistoryDataGhost(this.gameLevel);
    if (historyData) {
      this.playerTopHistory = JSON.parse(
        await decompressFromBase64(historyData)
      );
    }
  }
  initialize() {
    this.playerCurRecord = [];
    this.playerTopHistory = [];

    this.sound.stopAll();
    this.roadData = getRoadData(this.gameLevel);

    this.updateElapseAfterStart = 0;
    this.updateElapseBeforeStart = 0;
    this.isCountdownStart = false;
    this.isGameReady = true;
    this.isGameover = false;
    this.isBreakSoundOn = false;
    this.isContactSoundOn = false;
    this.isStartSoundBikeRun = false;

    this.CX = this.cameras.main.centerX;
    this.CY = this.cameras.main.centerY;
    this.steer = 0;
  }
  init(data: any) {
    this.gameLevel = data.gameLevel as GameLevel;
    if (this.gameLevel === "ghost_1" || this.gameLevel === "ghost_2") {
      this.isGhostMode = true;
    } else {
      this.isGhostMode = false;
    }
  }
  createConfetti() {
    // 小さな矩形テクスチャを生成（カラーは tint で変える）
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 6, 10); // 幅6px, 高さ10px の紙吹雪ピース
    g.generateTexture("confetti", 6, 10);
    const emitter = this.add
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
    this.carContainer.add(emitter);
    emitter.stop();
    return emitter;
  }
  create() {
    createGameWrapper(this);
    this.createButton();
    this.gamepad = new MyGamepad(this);

    createKeyEvent(
      this,
      () => {
        if (this.steer > -2) this.steer -= 1;
      },
      () => {
        if (this.steer < 2) this.steer += 1;
      }
    );

    this.isPlayerOutRoad = false;
    // this.fpsText = this.add
    //   .text(140, 60, "123", { font: "16px Arial", color: "#000" })
    //   .setDepth(99999);

    this.roadGraphics = this.add.graphics();

    this.input.addPointer(1);
    this.initialize();

    if (this.isGhostMode) {
      this.loadPlayerTopHistoryData();
    }

    this.roadContainer = this.add.container(130, 26);
    this.roadContainer.setSize(800, 600).setScale(0.47);

    this.carContainer = this.add.container(130, 26);
    this.carContainer.setSize(800, 600).setScale(0.47);

    this.bg1 = createBg1(this, this.roadContainer, this.gameLevel);
    this.tower = createTower(this, this.roadContainer);
    if (this.gameLevel === "free") {
      this.tower.setVisible(false);
    }

    this.tower.setAlpha(0.1);

    this.grassLand = createGrassLand(this, this.roadContainer, this.gameLevel);
    if (this.gameLevel === "ghost_2" || this.gameLevel === "free") {
      this.roadObjects = [];
    } else {
      this.roadObjects = createRoadObjects(this, this.roadContainer);
    }

    this.roadContainer.add(this.roadGraphics);

    // this.speedMeter = new SpeedMeter(this, 474, 75, 18);
    this.speedMeter = new SpeedMeter(this, 211, 84, 21);
    this.speedMeter.setSpeed(0, MAX_SPEED, this.isGameover);
    this.cars = createCars(
      this,
      this.CX + 67,
      580,
      this.carContainer,
      this.roadData.cMax,
      this.roadData.enemyNum,
      this.gameLevel
    );
    const playerCar = this.cars[0];
    this.createEmitter(playerCar);
    this.createBoardData();
    this.makeCourse();

    this.createTouchEvent(playerCar);

    playerCar.y = 0;

    let courseName = "Race 1";
    if (this.gameLevel === "hard") {
      courseName = "Race 2";
    } else if (this.gameLevel === "free") {
      courseName = "Free";
    } else if (this.gameLevel === "ghost_1") {
      courseName = "Ghost 1";
    } else if (this.gameLevel === "ghost_2") {
      courseName = "Ghost 2";
    }

    const rectTotalTime = this.add.rectangle(
      this.CX + 3,
      88,
      122,
      29,
      0x000000,
      0.06
    );
    this.txtTotalTimer = this.add
      .bitmapText(this.CX - 23, 112, "oldschool-black", "00'00.00", 36)
      .setAlpha(0.78)
      .setDepth(999999);

    this.roadContainer.add(this.txtTotalTimer);
    const prevHigh = loadFromHighScoreLocalStorage(this.gameLevel) || null;
    this.txtPrevHighTimer = this.add
      .bitmapText(
        this.CX - 5,
        65,
        "oldschool-black",
        "Rec: " + formatTimeText(prevHigh),
        21
      )
      .setAlpha(0.7)
      .setDepth(999999);

    this.roadContainer.add(this.txtPrevHighTimer);

    this.initLapTimeData();
    this.initLapTimerText();
    // this.setLapTimeText();

    if (this.gameLevel === "free") {
      this.txtTotalTimer.setVisible(false);
      rectTotalTime.setVisible(false);
      this.txtPrevHighTimer.setVisible(false);
    }
    this.sdCountdown = this.sound.add("321");
    this.sdBikeStart = this.sound.add("bikeStart");
    this.sdBikeRun = this.sound.add("bikeRun");
    this.sdBikeBreak = this.sound.add("bikeBreak");
    this.sdReady = this.sound.add("ready");
    this.sdGo = this.sound.add("go");

    this.sdLap2 = this.sound.add("lap2");
    this.sdLapFinal = this.sound.add("lapFinal");
    this.sdGoal = this.sound.add("goal");
    this.sdGoalNewRecord = this.sound.add("goal-new-record");
    this.sdContact = this.sound.add("contact");

    const txtStartNum = this.createTxtStartNum(courseName);

    this.tweens.add({
      targets: txtStartNum,
      scaleY: [1.0, 0.8],
      duration: 1100,
      delay:
        this.gameLevel === "ghost_1" || this.gameLevel === "ghost_2"
          ? 5000
          : 3000,
      // duration: 1,
      // delay: 1,
      repeat: 1,
      yoyo: true,
      ease: "Sine.easeInOut",
      onStart: () => {
        txtStartNum.text = "Ready";
        playSound(this.sdReady, 0.3);
      },
      onComplete: () => {
        if (this.txtGhostNote) {
          this.txtGhostNote.setVisible(false);
        }
        stopSound(this.sdReady);
        playSound(this.sdCountdown, 0.3);
        playSound(this.sdBikeStart, 0.3);
        txtStartNum.setScale(1);
        this.isCountdownStart = true;
        txtStartNum.text = "3";
        this.startCountdown(txtStartNum);
      },
    });

    this.txtGameOver = this.createtxtGameOver();

    this.mapContainer = this.add
      .container()
      .setDepth(9999999)
      // .setPosition(225, 115)
      // .setAlpha(0.5)
      .setPosition(485, 55)
      .setScale(1 * 0.95, 1.28 * 0.95)
      .setAngle(90);
    if (this.gameLevel === "ghost_2") {
      this.mapContainer.x += 3;
      this.mapContainer.y -= 3;
    } else if (this.gameLevel !== "easy") {
      this.mapContainer.x -= 11;
    }
    this.mapImage = this.createMapImage();
    this.mapContainer.add(this.mapImage);

    this.gMapPlayer = this.add.graphics();
    this.mapContainer.add(this.gMapPlayer);
    if (this.gameLevel === "free") {
      this.mapContainer.setVisible(false);
      this.speedMeter.hide();
    }

    // --------------
    this.lapLimit = 3;
    if (this.isGhostMode) {
      this.lapLimit = 1;
      this.cars[1].x = this.cars[0].x;
      this.cars[1].y = this.cars[0].y;
      this.cars[1].image.setOrigin(
        this.cars[0].image.originX,
        this.cars[0].image.originY
      );
      this.cars[1].image.setScale(
        this.cars[0].image.scaleX * 0.98,
        this.cars[0].image.scaleY * 0.98
      );
      this.cars[1].image.setPosition(
        this.cars[0].image.x,
        this.cars[0].image.y
      );
      this.cars[1].image.setTint(0xddffff);
      this.cars[1].image.setAlpha(0.7);

      this.txtGhostNote = this.add
        .text(
          this.CX - 2,
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

      if (this.playerTopHistory.length === 0) {
        this.cars[1].image.setVisible(false);
      }
    }

    this.emitterConfetti = this.createConfetti();
  }

  startCountdown(txtStartNum: Phaser.GameObjects.BitmapText) {
    let startTextNum = 3;

    this.tweens.add({
      targets: txtStartNum,
      repeat: 2,
      y: "-=20",
      duration: 845,
      onUpdate: (tween, _) => {
        const progress = tween.progress;
        if (progress < 0.85) {
          if (this.cars[0].speed > MAX_SPEED * 0.6) {
            this.cars[0].speed *= 0.25;
          }
        }
        this.sdBikeStart.volume = (0.5 * this.cars[0].speed) / MAX_SPEED;
      },
      onRepeat: () => {
        startTextNum--;
        txtStartNum.text = `${startTextNum}`;
      },
      onComplete: () => {
        txtStartNum.y += 20;
        this.lapTimeObj.start(this.time.now);
        stopSound(this.sdCountdown);
        txtStartNum.text = "";
        setTimeout(() => {
          playSound(this.sdGo);
          stopSound(this.sdBikeStart);
          txtStartNum.text = "GO!!!!";
          this.isGameReady = false;
        }, 380);
        this.tweens.add({
          targets: txtStartNum,
          duration: 800,
          scale: 2,
          alpha: 0,
          onComplete: () => {
            txtStartNum.visible = false;
            txtStartNum.setScale(1);
          },
        });
      },
    });
  }

  createTxtStartNum(curseName: string) {
    const txt = this.add
      .bitmapText(this.CX, 130, "oldschool-white", `${curseName}`, 25)
      .setTint(0xcc5656)
      .setOrigin(0.5);

    return txt;
  }

  createtxtGameOver() {
    const txt = this.add
      .bitmapText(this.CX + 10, 153, "oldschool-white", "Goal!!", 28)
      .setTint(0xcc5656)
      .setOrigin(0.5)
      .setVisible(false);

    return txt;
  }

  initLapTimerText() {
    this.txtLapTimerList = [];
    for (let i = 0; i < 3; i++) {
      const lapText = this.add
        .bitmapText(12, 330 + 35 * i, "oldschool-white", "", 25)
        .setDepth(999999)
        .setAlpha(0.7);

      this.roadContainer.add(lapText);
      this.txtLapTimerList.push(lapText);
      if (this.isGhostMode || this.gameLevel === "free") {
        lapText.visible = false;
      }
    }
    for (let i = 0; i < 3; i++) {
      this.lapTimeObj.setTxtLapTime(i, this.txtLapTimerList);
    }
  }

  async savaHistoryRecordData() {
    const _rec = this.playerCurRecord.map((d) => {
      return {
        x: Math.trunc(d.x),
        y: Math.trunc(d.y),
        r: Math.trunc(d.r),
      };
    });
    const comp = await compressToBase64(JSON.stringify(_rec));

    if (this.gameLevel === "ghost_1" || this.gameLevel === "ghost_2") {
      saveHistoryData(comp, this.gameLevel);
    }
  }

  update(time: number, delta: number) {
    // this.fpsText.setText("FPS: " + this.game.loop.actualFps.toFixed(2));

    const playerCar = this.cars[0];

    this.roadData.dataLR[Math.trunc(playerCar.y / this.roadData.board)] + "";

    if (this.isGameover) {
      // this.sound.stopAll();
      this.tweens.add({
        targets: playerCar.image,
        scale: 0,
        alpha: 0,
        angle: 15,
        y: 190,
        duration: 400,
      });

      return;
    }

    this.gamepad.update(time, delta);

    if (!this.isGameReady) {
      // this.playerHistory.push([playerCar.x, playerCar.y, playerCar.lr]);
      // const hisData = Math.trunc((100 * playerCar.speed) / MAX_SPEED);

      if (this.isGhostMode && isWithinTwoMinutes(this.lapTimeObj.totalTime)) {
        this.playerCurRecord.push({
          x: playerCar.x,
          y: playerCar.y,
          r: playerCar.image.angle,
        });
      }

      this.lapTimeObj.update(
        playerCar.mileage,
        this.txtTotalTimer,
        this.txtLapTimerList,
        (_lapNum) => {
          if (this.isGhostMode) return;
          if (_lapNum === 1) {
            playSound(this.sdLap2, 0.3);
          } else if (_lapNum === 2) {
            playSound(this.sdLapFinal, 0.3);
          }
        },
        this.gameLevel === "free"
      );
    }
    if (this.gameLevel !== "free" && this.lapTimeObj.lapNum >= this.lapLimit) {
      stopSound(this.sdBikeRun);
      stopSound(this.sdBikeBreak);
      this.isGameover = true;
      this.emitterConfetti.start();

      this.time.delayedCall(6000, () => {
        this.emitterConfetti.stop();
      });
      const prevHigh = loadFromHighScoreLocalStorage(this.gameLevel) || null;
      let isNewRecord = false;
      if (!prevHigh || this.lapTimeObj.totalTime < prevHigh) {
        saveToHighScoreLocalStorage(this.gameLevel, this.lapTimeObj.totalTime);

        // 記録が2分以内の場合のみ履歴を記録する
        if (this.isGhostMode && isWithinTwoMinutes(this.lapTimeObj.totalTime)) {
          this.savaHistoryRecordData();
        }

        if (prevHigh) {
          isNewRecord = true;
        }
      }

      if (isNewRecord) {
        playSound(this.sdGoalNewRecord, 0.3);
        this.txtGameOver.text = "New Record!!";
      } else {
        playSound(this.sdGoal, 0.3);
      }

      this.carEmitter.stop();
      this.carCurveEmitter.stop();
      this.txtGameOver.visible = true;
      return;
    }

    if (this.isGameReady) {
      this.updateElapseBeforeStart++;
    } else {
      this.updateElapseAfterStart++;
      if (this.gameLevel === "free") {
        if (this.updateElapseAfterStart > 120000) {
          this.updateElapseAfterStart = 0;
        }
      }
    }

    this.isPlayerOutRoad = Math.abs(playerCar.x - 400) > 355;
    if (
      (this.isGameReady && this.updateElapseBeforeStart % 70 === 0) ||
      (!this.isGameReady && this.updateElapseAfterStart % 50 === 0)
    ) {
      this.applyNaturalSlowdown(playerCar);
      let color = 0xffffff;
      if (playerCar.speed > 50) {
        const t = playerCar.speed / (MAX_SPEED * 2);
        const r = 255; //
        const g = 255 * (1 - t * 0.5);
        const b = 255 * (1 - t * 0.7);
        color = (r << 16) | (g << 8) | b;
      }

      playerCar.image.setTint(color);
    }
    this.speedMeter.setSpeed(playerCar.speed, MAX_SPEED, this.isGameReady);

    this.applyEmmiterWithCarSpeed(playerCar);
    this.applyCurveEmmiterWithCarSpeed(playerCar);

    if (!this.isGameReady) {
      playerCar.lr = calcPlayerLR(this.steer);
      playerCar.x = getNextPlayerX(
        playerCar,
        this.curve,
        this.roadData.cMax,
        this.gameLevel
      );
      // const turnPower = this.calcTurnPower(playerCar.speed);
      // playerCar.x = playerCar.x + playerCar.lr * turnPower * 0.1;
      // if (playerCar.x < -190) {
      //   playerCar.x = -190;
      // } else if (playerCar.x > 990) {
      //   playerCar.x = 990;
      // }
      playerCar.image.setRotation(playerCar.lr * 0.025);
      // playerCar.x -=
      //   (playerCar.speed *
      //     this.curve[Math.trunc(playerCar.y + PlayerY) % this.roadData.cMax]) /
      //   350;
    }

    for (let car of this.cars) {
      if (this.isGameReady) {
        break;
      }
      if (
        !car.isPlayer &&
        this.isGhostMode &&
        this.playerTopHistory.length === 0
      ) {
        car.image.visible = false;
      }

      if (car.isPlayer || !this.isGhostMode) {
        const diffY = car.speed / 100;
        car.y += diffY;
        car.mileage += diffY;
        if (car.y > this.roadData.cMax - 1) {
          car.y -= this.roadData.cMax;
        }
      } else if (
        !car.isPlayer &&
        this.isGhostMode &&
        this.playerTopHistory.length > 0
      ) {
        if (this.updateElapseAfterStart < this.playerTopHistory.length) {
          car.x = this.playerTopHistory[this.updateElapseAfterStart].x;
          car.y = this.playerTopHistory[this.updateElapseAfterStart].y;
          car.image.setAngle(
            this.playerTopHistory[this.updateElapseAfterStart].r
          );
        }
      }

      if (!car.isPlayer && !this.isGhostMode) {
        // 敵カーの制御
        if (this.updateElapseAfterStart % 1000 === 0) {
          this.applyNaturalSlowdown(car);
        }
        // 接触時の処理
        const cx = car.x - playerCar.x;
        const cy = car.y - ((playerCar.y + PlayerY) % this.roadData.cMax);
        if (
          this.gameLevel !== "free" &&
          -98 <= cx &&
          cx <= 98 &&
          -40 <= cy &&
          cy <= 40
        ) {
          // playerCar.x -= cx / 10;
          // car.x += cx / 10;
          if (cy > 5) {
            if (!this.isContactSoundOn) {
              const volume = 0.05 + (0.3 * playerCar.speed) / MAX_SPEED;
              this.isContactSoundOn = true;
              playSound(this.sdContact, volume);
              setTimeout(() => {
                this.isContactSoundOn = false;
              }, 1000);
            }
            playerCar.speed = car.speed * 0.7;
          } else {
            car.speed = playerCar.speed * 0.3;
          }
        }

        // プレイヤーと離れすぎていたらスピードを調整する
        const diffRate =
          ((playerCar.y % this.roadData.cMax) - (car.y % this.roadData.cMax)) /
          this.roadData.cMax;

        let aveSp = 140;
        if (this.gameLevel === "free") {
          if (car.y - playerCar.y > 220) {
            aveSp = 100 + car.id * 15;
          } else {
            aveSp += (Math.floor(playerCar.y) % 40) * 0.6 + car.id * 0.5;
          }
          if (aveSp > MAX_SPEED * 0.45) {
            aveSp = 78 + Math.floor(Math.random() * 60);
          }
        } else {
          aveSp = car.averageSpeed[this.lapTimeObj.lapNum];
        }

        let limitSpeed = aveSp;

        if (0.065 < diffRate && diffRate < 0.35) {
          limitSpeed *= 1.97;
        } else if (-0.4 < diffRate && diffRate < -0.65) {
          limitSpeed *= 0.43;
        }

        if (car.speed < limitSpeed) {
          if (this.gameLevel === "free") {
            const ns = car.speed + 2;
            if (ns < MAX_SPEED * 0.88 - car.id * 4) {
              car.speed = ns;
            }
            if ((car.id === 2 || car.id === 7) && Math.random() < 0.6) {
              car.speed = playerCar.speed * 1.02;
            }
          } else {
            car.speed += 3;
          }
        }

        if (
          (this.updateElapseAfterStart % 600 === car.curveTiming &&
            car.lr === 0) ||
          (car.curveTiming && car.lr !== 0 && Math.random() < 0.045)
        ) {
          if (car.x < playerCar.x) {
            car.lr += Phaser.Math.Between(-1, 3);
          } else {
            car.lr += Phaser.Math.Between(-3, 1);
          }

          if (car.lr < -3) {
            car.lr = -3;
          } else if (car.lr > 3) {
            car.lr = 3;
          }
        }
        car.x = car.x + (car.lr * car.speed) / 50;
        if (car.x < 50) {
          car.x = 50;
          car.lr = Math.trunc(car.lr * 0.9);
        } else if (car.x > 750) {
          car.x = 750;
          car.lr = Math.trunc(car.lr * 0.9);
        }
        car.image.setRotation(car.lr * 0.29);
      }
    }

    this.roadGraphics.clear();
    const roadBasePosData = this.createRoadBasePosData(playerCar);
    this.draw(playerCar, roadBasePosData);

    if (!this.isGameReady) {
      if (!this.isStartSoundBikeRun && isAvailableSound()) {
        this.isStartSoundBikeRun = true;
        playSound(this.sdBikeRun, 0, true);
      }

      // ---- エンジン音の変化 ----
      const accel = playerCar.speed - playerCar.prevSpeed;
      playerCar.prevSpeed = playerCar.speed;

      // 基本ピッチ（速度に応じて上がる）
      const baseRate =
        0.1 +
        (playerCar.speed / MAX_SPEED) * 0.86 -
        (Math.abs(playerCar.lr) / 8) * 0.02 +
        Math.sin(this.updateElapseAfterStart / 600) * 0.12;

      // 加速時の短期的な上昇（ブオン感）
      const accelEffect = Phaser.Math.Clamp(accel * 3.4, -0.1, 0.1);
      // const accelEffect = 0.3;

      // 実際の再生レート設定
      this.sdBikeRun.setRate(baseRate + accelEffect);

      // 音量も少し速度で変える（お好み）
      const ss = this.updateElapseAfterStart % 300 < 150 ? 0.67 : 1;
      this.sdBikeRun.setVolume(
        ss *
          (0.08 +
            (0.5 * playerCar.speed) / MAX_SPEED +
            Math.sin(this.updateElapseAfterStart / 6000) * 0.1321)
      );

      // const volume = 0.1 + (playerCar.speed / MAX_SPEED) * 0.45;
      // if (Math.abs(this.steer) < 2) {
      //   this.sdBikeRun.volume = volume;

      //   this.breakSoundOn = false;
      if (Math.abs(this.steer) >= 2) {
        if (!this.isBreakSoundOn && playerCar.speed > MAX_SPEED * 0.4) {
          this.isBreakSoundOn = true;
          const baseRate = 0.8 + (playerCar.speed / 200) * 0.8;

          this.sdBikeBreak.setRate(baseRate);
          playSound(
            this.sdBikeBreak,
            (0.3 * playerCar.speed) / MAX_SPEED,
            false
          );
        }
      } else {
        this.isBreakSoundOn = false;
      }
    }
    if (
      this.isGhostMode ||
      (!this.isGhostMode && this.updateElapseAfterStart % 3)
    ) {
      this.drawCarMarkOnMap();
    }
  }

  draw(
    playerCar: Car,
    roadBasePosData: { horizon: number; boardX: number[]; boardUd: number[] }
  ) {
    this.moveBgObjects(playerCar, roadBasePosData.horizon);

    const sy = { val: roadBasePosData.horizon };

    const enemyCars = this.cars.filter((c) => !c.isPlayer);

    // ループ内で処理済みの敵の車
    const drawnEnemyCarIds: number[] = [];
    // 道路の水平エリア分割ごとの処理（道路の上側（画面奥）から処理するので逆ループ
    for (let i = this.roadData.board - 1; i > 0; i--) {
      const roadPosData = this.calcRoadPosData(i, sy, roadBasePosData);

      this.drawRoad(playerCar, i, roadPosData);
      this.moveRoadObjects(playerCar, i, roadPosData);

      this.appleyPositionEnemyCars(
        i,
        roadPosData,
        playerCar,
        enemyCars,
        drawnEnemyCarIds
      );
    }

    const roadPosData = this.calcRoadPosData(0, sy, roadBasePosData);
    this.hideEnemyCarsOutsideView(enemyCars, drawnEnemyCarIds, roadPosData);
  }

  appleyPositionEnemyCars(
    index: number,
    p: RoadPosData,
    playerCar: Car,
    enemyCars: Car[],
    drawnEnemyCarIds: number[]
  ) {
    for (let car of enemyCars) {
      if (drawnEnemyCarIds.includes(car.id)) {
        continue;
      }
      if (
        Math.trunc(car.y) % this.roadData.cMax ===
        Math.trunc(playerCar.y + index) % this.roadData.cMax
      ) {
        drawnEnemyCarIds.push(car.id);
        if (this.isGhostMode) {
          car.image.y = p.uy;
          car.image.x = p.ux + (car.x * this.dataBoardW[index]) / 800;
          const scale =
            0.01 + (this.dataBoardW[index] / this.dataBoardW[0]) * 0.86;
          car.image.setScale(Math.max(0.01, scale * 0.64));
        } else {
          car.image.y = p.uy + car.image.getBounds().height * 2;
          car.image.x = p.ux + (car.x * this.dataBoardW[index]) / 800;
          const scale = 0.05 + this.dataBoardW[index] / this.dataBoardW[0];
          car.image.setScale(Math.max(0.01, scale * 0.84));
        }
        // car.image.y = p.uy + car.image.getBounds().height * 2;
        // car.image.x = p.ux + (car.x * this.dataBoardW[index]) / 800;
        // const scale = 0.05 + this.dataBoardW[index] / this.dataBoardW[0];
        // car.image.setScale(Math.max(0.01, scale * 0.84));
        setTimeout(() => {
          car.image.visible = true;
        }, 1);
      }
      if (car.image.y > playerCar.image.y) {
        this.carContainer.bringToTop(car.image);
      } else {
        this.carContainer.sendToBack(car.image);
      }
    }
  }

  hideEnemyCarsOutsideView(
    enemyCars: Car[],
    drawnEnemyCarIds: number[],
    p: RoadPosData
  ) {
    // 描画範囲外の車
    for (let car of enemyCars) {
      if (!drawnEnemyCarIds.includes(car.id)) {
        if (this.isGhostMode) {
          if (Math.abs(this.cars[0].y - car.y) > 240) {
            car.image.visible = false;
          } else {
            car.image.x = p.ux + (car.x * this.dataBoardW[0]) / 800;
          }
        } else {
          car.image.visible = false;
        }
      }
    }
  }
  moveObject(
    obj: RoadObject,
    scale: { x: number; y: number },
    rate: number,
    ux: number,
    uy: number,
    uw: number,
    alpha: number
  ) {
    obj.image.visible = true;
    const scaleRateX = rate * scale.x;
    const scaleRateY = rate * scale.y;

    // const scaleRateX = 1 * obj.scale.x;
    // const scaleRateY = 1 * obj.scale.y;

    // obj.sprite.x = ux + uw + 60 * obj.side * rate;
    // obj.sprite.x = ux + 100 * (obj.side + 2) * rate;
    // obj.sprite.x = ux+ (uw / 4) * obj.side * rate;
    // obj.x = ux + (uw / 4) * (obj.side + 2);
    obj.image.x = obj.side === "left" ? ux - uw * 0.1 : ux + uw * 1.1;
    obj.image.setScale(scaleRateX, scaleRateY);

    obj.image.y = uy;
    obj.image.setAlpha(alpha);
  }

  drawRoadField(p: RoadPosData, alpha: number) {
    const roadPoints: Vec2[] = [
      new Vec2(p.ux, p.uy),
      new Vec2(p.ux + p.uw, p.uy),
      new Vec2(p.bx + p.bw, p.by),
      new Vec2(p.bx, p.by),
    ];
    this.drawPolygon(roadPoints, COLOR_ROAD, alpha);
  }

  drawRoad(playerCar: Car, index: number, roadPosData: RoadPosData) {
    const alpha = Math.min(
      0.4,
      Math.max(0.13, 1 - (index / this.roadData.board) * 0.9)
    );
    this.drawRoadField(roadPosData, alpha);
    if (this.gameLevel !== "free") {
      this.drawStartLine(playerCar, index, roadPosData, alpha);
    }
    this.drawLineOuter(playerCar, index, roadPosData, alpha);
    this.drawLineInner(playerCar, index, roadPosData, alpha);
  }

  drawStartLine(playerCar: Car, index: number, p: RoadPosData, alpha: number) {
    const point = Math.trunc(playerCar.y + index) % this.roadData.cMax;
    if (point === 20 || point === 21 || point === 22) {
      const lineLRPoints: Vec2[] = [
        new Vec2(p.ux + p.uw * 0, p.uy),
        new Vec2(p.ux + p.uw * 1, p.uy),
        new Vec2(p.bx + p.bw * 1, p.by),
        new Vec2(p.bx + p.uw * 0, p.by),
      ];
      this.drawPolygon(
        lineLRPoints,
        COLOR_ROAD_START_LINE,
        Math.min(1, alpha * 1.2)
      );
    }
  }
  drawLineOuter(playerCar: Car, index: number, p: RoadPosData, alpha: number) {
    let al = alpha * 0.6;
    if (this.gameLevel === "free") {
      al = 0.6;
      if (Math.trunc(playerCar.y + index) % 200 <= 90) {
        al = 0.85;
      }
    } else if (this.gameLevel === "ghost_2") {
      al = alpha;
      if (Math.trunc(playerCar.y + index) % 100 <= 50) {
        al = alpha * 0.9;
      }
    } else {
      if (Math.trunc(playerCar.y + index) % 60 <= 8) {
        al = alpha * 0.7;
      }
    }

    let data = [
      [0, 0.1, 0.1, 0],
      [0.9, 1, 1, 0.9],
    ];

    if (this.gameLevel === "free") {
      data = [
        [0, 0.02, 0.02, 0],
        [0.98, 1, 1, 0.98],
      ];
    }

    data.forEach((d) => {
      const lineLRPoints: Vec2[] = [
        new Vec2(p.ux + p.uw * d[0], p.uy),
        new Vec2(p.ux + p.uw * d[1], p.uy),
        new Vec2(p.bx + p.bw * d[2], p.by),
        new Vec2(p.bx + p.uw * d[3], p.by),
      ];
      if (this.gameLevel === "free") {
        this.drawPolygon(lineLRPoints, 0xaadaff, al);
      } else {
        this.drawPolygon(lineLRPoints, COLOR_ROAD_LINE_OUTER, al);
      }
    });
  }

  drawLineInner(playerCar: Car, index: number, p: RoadPosData, alpha: number) {
    if (Math.trunc(playerCar.y + index) % 120 <= 60) {
      // 道路内のライン
      [
        // [0.249, 0.26, 0.26, 0.24],
        [0.499, 0.51, 0.51, 0.49],
        // [0.749, 0.76, 0.76, 0.74],
      ].forEach((d) => {
        const lineLRPoints: Vec2[] = [
          new Vec2(p.ux + p.uw * d[0], p.uy),
          new Vec2(p.ux + p.uw * d[1], p.uy),
          new Vec2(p.bx + p.bw * d[2], p.by),
          new Vec2(p.bx + p.uw * d[3], p.by),
        ];
        this.drawPolygon(lineLRPoints, COLOR_ROAD_LINE_INNER, alpha * 0.95);
      });
    }
  }

  makeCourse() {
    const cLen = this.roadData.cLen;
    const cMax = this.roadData.cMax;
    const dataLR = this.roadData.dataLR;
    const dataUD = this.roadData.dataUD;
    const boad = this.roadData.board;

    this.curve = [];
    this.updown = [];
    this.objectLeft = [];
    this.objectRight = [];

    for (let i = 0; i < cMax; i++) {
      this.curve.push(0);
      this.updown.push(0);
      this.objectLeft.push(0);
      this.objectRight.push(0);
    }
    for (let i = 0; i < cLen; i++) {
      const lr1 = dataLR[i];
      const lr2 = dataLR[(i + 1) % cLen];
      const ud1 = dataUD[i];
      const ud2 = dataUD[(i + 1) % cLen];
      for (let j = 0; j < boad; j++) {
        const pos = j + boad * i;
        this.curve[pos] = leapBoard(lr1, lr2, j, boad);
        this.updown[pos] = leapBoard(ud1, ud2, j, boad);

        if (j === 60) {
          this.objectRight[pos] = 1;
        }
        if (j % 12 === 0) {
          this.objectLeft[pos] = 2;
        }
        if (j % 20 === 0) {
          this.objectLeft[pos] = 3;
        }
        if (j % 12 === 6) {
          this.objectLeft[pos] = 9;
        }
      }
    }
  }
  drawPolygon(points: Phaser.Math.Vector2[], color: number, alpha: number) {
    this.roadGraphics.fillStyle(color, alpha);
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(points[0].x, points[0].y);

    for (let j = 1; j < points.length; j++) {
      this.roadGraphics.lineTo(points[j].x, points[j].y);
    }
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();
    this.roadGraphics.setDepth(999);
  }

  createButton() {
    // ハンドル
    new HandleButton(this, 58, 290, 33);
    // アクセル、ブレーキ
    createActionButtons(this);

    const handleClockGameButton: ClockGameButtonHandlers = {
      TIME: () => {
        this.scene.start("ClockScene");
      },
      howto: () => {},
      easy: () => {
        // if (!this.isGameover) return;
        // muteFunc();
        this.scene.start("MainScene", { gameLevel: "easy" });
      },
      hard: () => {
        this.scene.start("MainScene", { gameLevel: "hard" });
      },
      ghost_1: () => {
        this.scene.start("MainScene", { gameLevel: "ghost_1" });
      },
      ghost_2: () => {
        this.scene.start("MainScene", { gameLevel: "ghost_2" });
      },
      free: () => {
        this.scene.start("MainScene", { gameLevel: "free" });
      },
    };

    createClockGameButtons(this, handleClockGameButton);
    createFullScreenButton(this);

    // const isGuardBgm = () => this.isGameover || this.isGameReady;
    createSoundButton(this);
  }
  createEmitter(playerCar: Car) {
    this.carEmitter = createCarEmitter(
      this,
      playerCar.image.x + 20,
      playerCar.image.y - 3,
      this.carContainer
    );

    this.carEmitter.start();

    this.carCurveEmitter = createCarCurveEmitter(
      this,
      playerCar.image.x - 90,
      playerCar.image.y + 20,
      this.carContainer
    );
    this.carCurveEmitter.start();
  }
  createBoardData() {
    const board = this.roadData.board;
    this.dataBoardW = [];
    this.dataBoardH = [];
    this.dataBoardUD = [];
    for (let i = 0; i < board; i++) {
      this.dataBoardW.push(20 + ((board - i) * (board - i)) / 12);
      this.dataBoardH.push((3.6 * (board - i)) / board);
      const rad = (i * 1.5 * Math.PI) / 180;
      this.dataBoardUD.push(2 * Math.sin(rad));
    }
  }

  createTouchEvent(playerCar: Car) {
    this.events.on("steerChanged", (steer: number) => {
      this.steer = steer;
    });

    this.events.on("speedChanged", (sp: number) => {
      if (!this.isCountdownStart) return;
      let rateReady = 1;
      if (this.isGameReady) {
        rateReady = 0.9;
      }

      const maxSpeed = this.isPlayerOutRoad ? MAX_SPEED * 0.7 : MAX_SPEED;
      const rate = this.isPlayerOutRoad ? 0.7 : 1;

      const nextSpeed = Math.max(
        0,
        Math.min(maxSpeed, playerCar.speed + sp * rate * rateReady)
      );
      playerCar.speed = nextSpeed;
    });
  }

  applyNaturalSlowdown(car: Car) {
    let slowRate = 0.982 - Math.abs(car.lr * 0.0004);
    if (this.isGameReady) {
      slowRate = 0.9;
    } else if (this.isPlayerOutRoad && car.isPlayer) {
      slowRate = 0.4;
    }
    car.speed = Math.max(0, car.speed * slowRate);
    if (car.speed < 30) {
      car.speed = 0;
    }
  }

  applyEmmiterWithCarSpeed(playerCar: Car) {
    if (playerCar.speed < 30) {
      this.carEmitter.visible = false;
    } else {
      this.carEmitter.visible = true;

      if (this.steer === 0) {
        this.carEmitter.x = playerCar.image.x + 25;
        this.carEmitter.y = playerCar.image.y - 17;
      } else {
        const r = 21;
        const rad = playerCar.image.rotation;
        this.carEmitter.x =
          playerCar.image.x + Math.cos(rad) * r + (this.steer > 0 ? 25 : -8);
        this.carEmitter.y = playerCar.image.y + Math.sin(rad) * r - 17;
      }

      this.carEmitter.setScale((1.32 * playerCar.speed) / MAX_SPEED);
      this.carEmitter.setAlpha((3 * playerCar.speed) / MAX_SPEED);
      this.carEmitter.setAngle(playerCar.image.angle * 0.8);
      // this.carEmitter.setParticleGravity(
      //   playerCar.image.angle * 1.3,
      //   170 - Math.abs(playerCar.image.angle) * 4
      // );
    }
  }

  applyCurveEmmiterWithCarSpeed(playerCar: Car) {
    if (
      this.isPlayerOutRoad ||
      playerCar.speed < 30 ||
      Math.abs(this.steer) < 2
    ) {
      this.carCurveEmitter.visible = false;
    } else {
      const _x = playerCar.image.x + (playerCar.lr > 0 ? 50 : -50);
      const _y = playerCar.image.y + (playerCar.lr > 0 ? 16 : 6);
      const _gx = 10000 * Math.sign(playerCar.lr);
      this.carCurveEmitter.x = _x;
      this.carCurveEmitter.y = _y;
      this.carCurveEmitter.setParticleGravity(_gx, 10);
      this.carCurveEmitter.setAlpha(
        Math.max(0, (playerCar.speed - 130) / MAX_SPEED)
      );
      this.carCurveEmitter.visible = true;
    }
  }

  moveRoadObjects(playerCar: Car, index: number, p: RoadPosData) {
    const board = this.roadData.board;

    for (let obj of this.roadObjects) {
      if (obj.boardIndex - playerCar.y > 0) {
        if (index === (obj.boardIndex - Math.trunc(playerCar.y)) % board) {
          const diff = obj.boardIndex - playerCar.y;
          if (diff < 0 || board < diff) {
            obj.image.visible = false;
            continue;
          }
          const rate = 1 - diff / board;

          this.moveObject(obj, obj.scale, rate, p.ux, p.uy, p.uw, 1);
        }
      } else {
        obj.image.visible = false;
      }
    }
  }

  createRoadBasePosData(playerCar: Car) {
    const board = this.roadData.board;
    const cMax = this.roadData.cMax;

    let di = 0;
    let ud = 0;
    const boardX: number[] = [];
    const boardUd: number[] = [];

    for (let i = 0; i < board; i++) {
      di += this.curve[Math.trunc(playerCar.y + i) % cMax];
      ud += this.updown[Math.trunc(playerCar.y + i) % cMax];
      boardX.push(400 - (this.dataBoardW[i] * playerCar.x) / 800 + di / 2);
      boardUd.push(ud / 30);
    }

    let horizon = 230 + Math.trunc(ud / 18);

    return { horizon, boardX, boardUd };
  }

  calcRoadPosData(
    index: number,
    sy: { val: number },
    roadBasePosData: {
      horizon: number;
      boardX: number[];
      boardUd: number[];
    }
  ): RoadPosData {
    const horizon = roadBasePosData.horizon;
    const boardX = roadBasePosData.boardX;
    const boardUd = roadBasePosData.boardUd;

    let ux = boardX[index];
    let uy = sy.val - this.dataBoardUD[index] * boardUd[index];
    let uw = this.dataBoardW[index];

    sy.val = sy.val + (this.dataBoardH[index] * (600 - horizon)) / 190;
    let bx = boardX[index - 1];
    let by = sy.val - this.dataBoardUD[index - 1] * boardUd[index - 1];
    let bw = this.dataBoardW[index - 1];

    return { ux, uy, uw, bx, by, bw };
  }

  moveBgObjects(playerCar: Car, horizon: number) {
    this.grassLand.y = horizon;
    // let bgpos = 800 - playerCar.x;
    const pPos = this.getRoadPosData(playerCar.y);
    const fov = Phaser.Math.DegToRad(65);
    const horizonOffset = (horizon - 400) * 0.45;
    const objData: {
      image: Phaser.GameObjects.Image;
      x: number;
      y: number;
      z: number;
    }[] = [{ image: this.tower, x: -550, y: horizonOffset + 330, z: 2500 }];

    for (let obj of objData) {
      if (this.gameLevel === "free") {
        obj.image.visible = false;
        continue;
      }
      let projectionData: { visible: boolean; screenX?: number | null } = {
        visible: false,
        screenX: 0,
      };
      const _x = obj.x;
      projectionData = projectXOnly(_x, obj.z, 0, 0, pPos.angle, fov, 900);

      // const pointAngle = Math.atan2(-1000 - pPos.y, 500 - pPos.x);
      if (projectionData.screenX) {
        obj.image.setPosition(projectionData.screenX, obj.y);
        obj.image.visible = true;
      } else {
        obj.image.visible = false;
      }
    }
  }

  initLapTimeData() {
    const endPoints: number[] = [];
    for (let i = 0; i < 3; i++) {
      endPoints.push((i + 1) * this.roadData.cMax + 25);
    }
    this.lapTimeObj = new LapTimer(this, endPoints);
  }

  getRoadPosData(carY: number) {
    return this.mapPoints[Math.trunc(carY) % this.roadData.cMax];
  }

  drawCarMarkOnMap() {
    this.gMapPlayer.clear();
    for (let i = 0; i < this.cars.length; i++) {
      const curPosData = this.getRoadPosData(this.cars[i].y);

      const offset = (3 * (this.cars[i].x - 400)) / 400;
      const x = curPosData.x - Math.sin(curPosData.angle) * offset;
      const y = curPosData.y - Math.cos(curPosData.angle) * offset;

      if (i === 0) {
        this.gMapPlayer.fillStyle(0xdd5544, 0.8);
        this.gMapPlayer.fillCircle(x, y, 2.5);
      } else {
        if (this.isGhostMode) {
          if (this.playerTopHistory.length > 0) {
            this.gMapPlayer.lineStyle(1, 0x0000ff, 0.8);
            this.gMapPlayer.strokeRect(x, y, 3, 3);
          }
        } else {
          this.gMapPlayer.fillStyle(0x229955, 1);
          this.gMapPlayer.fillPoint(x, y, 1.18);
        }
      }
    }
  }

  createMapImage() {
    const _mapPoints = [];

    const data = ROAD_DATA_LR_UD[this.gameLevel].DATA_LR;
    // Graphicsを作成

    const g = this.add.graphics();

    g.lineStyle(5, 0xffffff, 0.9); // 線の太さ, 色, 透明度

    // const baseX = 50;
    // const baseY = 50;
    let baseX = 60;
    let baseY = 60;
    let rangeX = 6 * 1.15;
    let rangeY = 5 * 1.15;
    if (this.gameLevel === "ghost_2") {
      baseX = 58;
      baseY = 58;
      rangeX = 6 * 0.85;
      rangeY = 5 * 0.85;
    } else if (this.gameLevel !== "easy") {
      baseX = 50;
      baseY = 50;
      rangeX = 6 * 0.8;
      rangeY = 5 * 0.8;
    }

    g.moveTo(baseX, baseY);
    _mapPoints.push({ x: baseY, y: baseY, angle: 0 });
    const prevPoint = { x: baseX, y: baseY };
    let degree = 0;
    for (let i = 0; i < data.length; i++) {
      const nextData = data[i];

      degree -= nextData * 5;
      const _angle = Phaser.Math.DegToRad(degree);
      const TWO_PI = Math.PI * 2;
      const angle = ((_angle % TWO_PI) + TWO_PI) % TWO_PI; // 結果は [0, 2π)

      const x2 = prevPoint.x - Math.cos(angle) * rangeX;
      const y2 = prevPoint.y + Math.sin(angle) * rangeY;

      prevPoint.x = x2;
      prevPoint.y = y2;

      g.lineTo(x2, y2);

      _mapPoints.push({ x: x2, y: y2, angle: angle });
    }
    // g.lineTo(baseX, baseY);
    g.strokePath();
    // goal line
    if (this.gameLevel !== "free") {
      g.lineStyle(2, 0x878787, 1);
      g.strokeRect(baseX, baseY - 7, 2, 14);
    }

    const maxXObj = _mapPoints.reduce((v, obj) => (obj.x > v.x ? obj : v));
    const maxYObj = _mapPoints.reduce((v, obj) => (obj.y > v.y ? obj : v));
    const minXObj = _mapPoints.reduce((v, obj) => (obj.x < v.x ? obj : v));
    const minYObj = _mapPoints.reduce((v, obj) => (obj.y < v.y ? obj : v));

    // console.log(minXObj.x);
    // console.log(minYObj.y);

    // console.log(maxXObj.x);
    // console.log(maxYObj.y);

    if (this.gameLevel === "easy") {
      const width = maxXObj.x - minXObj.x + 20;
      const height = maxYObj.y - minXObj.y + 33;
      g.fillStyle(0x000000, 0.1);
      g.fillRect(minXObj.x - 10, minYObj.y - 12, width, height);
    } else if (this.gameLevel === "free") {
      const width = maxXObj.x - minXObj.x + 20;
      const height = maxYObj.y - minXObj.y + 48;
      g.fillStyle(0x000000, 0.1);
      g.fillRect(minXObj.x - 10, minYObj.y - 9, width, height);
    } else if (this.gameLevel === "ghost_2") {
      const width = maxXObj.x - minXObj.x + 20;
      const height = maxYObj.y - minXObj.y + 70;
      g.fillStyle(0x000000, 0.1);
      g.fillRect(minXObj.x - 10, minYObj.y - 9, width, height);
    } else {
      const width = maxXObj.x - minXObj.x + 40;
      const height = maxYObj.y - minXObj.y + 50;
      g.fillStyle(0x000000, 0.1);
      g.fillRect(minXObj.x - 35, minYObj.y - 35, width - 1, height);
    }

    // 描いた線をテクスチャ化
    if (this.textures.exists("grid")) {
      this.textures.remove("grid");
    }
    g.generateTexture("grid", 100, 100);

    // Graphicsはもう不要
    g.destroy();

    // Imageとして1ドローで表示
    const map = this.add
      .image(0, 0, "grid")
      .setScale(1)
      .setOrigin(0)
      .setDepth(999999999);

    _mapPoints[_mapPoints.length - 1] = {
      x: Math.abs(_mapPoints[0].x + _mapPoints[_mapPoints.length - 2].x) / 2,
      y: Math.abs(_mapPoints[0].y + _mapPoints[_mapPoints.length - 2].y) / 2,
      angle:
        Math.abs(
          _mapPoints[0].angle + _mapPoints[_mapPoints.length - 2].angle
        ) / 2,
    };

    this.mapPoints = interpolateArray(_mapPoints);

    return map;
  }
}
function lerpAngle(start: number, end: number, t: number) {
  let delta = end - start;

  // -π ~ π の範囲に変換
  delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

  return start + delta * t;
}

function interpolateArray(
  arr: { x: number; y: number; angle: number }[],
  segments = 120
) {
  const result = [];

  for (let i = 0; i < arr.length - 1; i++) {
    const start = arr[i];
    const end = arr[i + 1];

    for (let j = 0; j < segments; j++) {
      const t = j / segments; // 0 から 1
      result.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        // angle: start.angle + (end.angle - start.angle) * t,
        angle: lerpAngle(start.angle, end.angle, t),
      });
    }
  }

  // 最後の値を追加
  result.push(arr[arr.length - 1]);

  return result;
}

function projectXOnly(
  x: number,
  z: number,
  camX: number,
  camZ: number,
  yaw: number,
  fov: number,
  screenWidth: number,
  near: number = 0.001
) {
  const dx = x - camX;
  const dz = z - camZ;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);

  const x_cam = dx * c + dz * s;
  const z_cam = -dx * s + dz * c;

  if (z_cam <= near) return { visible: false };

  const tanHalf = Math.tan(fov * 0.5);
  const proj = x_cam / z_cam;
  if (Math.abs(proj) > tanHalf) return { visible: false };

  const ndc_x = proj / tanHalf;
  const screenX = (ndc_x + 1) * 0.5 * screenWidth;

  return { visible: true, screenX };
}
function calcPlayerLR(steer: number) {
  return steer * 18;
}
function calcTurnPower(speed: number) {
  // 高速のときはカーブしづらくする
  if (speed > MAX_SPEED * 0.9) {
    if (Math.random() < 0.8) {
      return 0;
    }
  } else if (speed > MAX_SPEED * 0.7) {
    if (Math.random() < 0.65) {
      return 0;
    }
  }

  if (speed < 10) return 0;
  const max = MAX_SPEED;
  const minRate = 0.88;
  const t = Math.min(speed / max, 1);
  const eased = t * t; // ease-in
  return 1 - (1 - minRate) * eased;
}
function getNextPlayerX(
  car: Car,
  curve: number[],
  cMax: number,
  gamelevel: GameLevel
) {
  const turnPower = calcTurnPower(car.speed);
  let nextX = car.x;
  nextX = car.x + car.lr * turnPower * 0.1;

  nextX -= (car.speed * curve[Math.trunc(car.y + PlayerY) % cMax]) / 350;
  let minX = -190;
  let maxX = 990;
  if (gamelevel === "ghost_2" || gamelevel === "free") {
    minX = 40;
    maxX = 760;
  }
  if (nextX < minX) {
    nextX = minX;
  } else if (car.x > maxX) {
    nextX = maxX;
  }
  return nextX;
}
