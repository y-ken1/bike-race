import { Scene } from "phaser";
import {
  compressToBase64,
  decompressFromBase64,
  getCourseName,
  loadFromHighScoreLocalStorage,
  loadHistoryDataGhost,
  playSound,
  projectXOnly,
  saveHistoryData,
  saveToHighScoreLocalStorage,
  stopSound,
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
  BikeSoundState,
  BoardData,
  Car,
  ClockGameButtonHandlers,
  CooldownActionKey,
  CourseData,
  GameContainer,
  GameLevelProps,
  GameState,
  LastCooldownActionTimes,
  RoadData,
  RoadObject,
  RoadPosData,
} from "../../../types";
import { createKeyEvent } from "./keyEvent";
import { createBg1, createGrassLand, createTower } from "./backObject";
import {
  applyCurveEmmiterWithCarSpeed,
  applyEmmiterWithCarSpeed,
  createCarEmitter,
  createConfettiEmitter,
  type GameEmitter,
} from "./emitter";
import { LAP_NUM, MAX_SPEED, PlayerY } from "../../../utils/const";
import {
  changeEnemyLR,
  createCars,
  execGameoverPlayerCarTweens,
  getEnemyCars,
  hideEnemyCarsOutsideView,
  initCarForAutoMode,
  initCarForGhostMode,
  isCarOutOfRoad,
} from "./car";
import {
  calcRoadPosData,
  createRoadBasePosData,
  createRoadObjects,
  drawRoadGraphics,
  getRoadData,
  makeCourseData,
  moveRoadObjects,
} from "./road";
import { isWithinTwoMinutes, LapTimer } from "./lapTimer";
import { MyGamepad } from "../../gamePad";
import { playSoundBikeRunBreak, setupSounds, type GameSounds } from "./sounds";
import {
  createTextGhostNote,
  createTextPrevHighTimer,
  createTextTotalTimer,
  createtxtGameOver,
  createTxtStartNum,
  initLapTimerText,
} from "./textObjects";
import { createMapImage, drawCarMarkOnMapGraphics } from "./map";
import { setUpLastCoolDownActionTimes, tryAction } from "./coolDown";
import { GameLevelConfig } from "../../config/gameLevelConfig";

const AUTO_MODE_CAR_ANGLE_RATE = 69;

export class MainScene extends Scene {
  isCountdownStart: boolean;
  gameState!: GameState;

  center!: { x: number; y: number };
  roadGraphics!: Phaser.GameObjects.Graphics;
  dataBoard!: BoardData;
  bg1!: Phaser.GameObjects.Image;
  tower!: Phaser.GameObjects.Image;
  grassLand!: Phaser.GameObjects.Image;

  gameContainer!: GameContainer;

  roadObjects!: RoadObject[];

  cars!: Car[];
  steer!: number;
  speedMeter!: SpeedMeter;
  gameEmitter!: GameEmitter;

  updateElapseForHistoryIndex!: number;

  lapTimeObj!: LapTimer;
  startTime!: number;

  playerSoundState!: BikeSoundState;

  roadData!: RoadData;
  gameLevel!: GameLevelProps;
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

  lapLimit!: number;
  timeScale: number;
  sounds!: GameSounds;

  txtTotalTimer!: Phaser.GameObjects.BitmapText;
  txtPrevHighTimer!: Phaser.GameObjects.BitmapText;
  txtGameOver!: Phaser.GameObjects.BitmapText;
  txtGhostNote!: Phaser.GameObjects.Text;
  txtLapTimerList!: Phaser.GameObjects.BitmapText[];
  courseMap!: {
    image: Phaser.GameObjects.Image;
    points: { x: number; y: number; r: number }[];
    playerPosGraphics: Phaser.GameObjects.Graphics;
  };

  lastCooldownActionTimes!: LastCooldownActionTimes;
  courseData!: CourseData;

  constructor() {
    super("MainScene");
    this.timeScale = 0;
    this.isCountdownStart = false;
    this.gameState = "ready";
  }

  async loadPlayerTopHistoryData() {
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
    this.lastCooldownActionTimes = setUpLastCoolDownActionTimes();
    this.sound.stopAll();
    this.roadData = getRoadData(this.gameLevel);

    this.updateElapseForHistoryIndex = 0;
    this.isCountdownStart = false;
    this.gameState = "ready";

    this.playerSoundState = {
      running: false,
      curving: false,
      contactEnemy: false,
    };

    this.center = {
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY,
    };
    this.steer = 0;
  }
  init(data: any) {
    this.gameLevel = data.gameLevel as GameLevelProps;
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

    this.roadGraphics = this.add.graphics();

    this.input.addPointer(1);
    this.initialize();

    if (this.gameLevel.mode === "ghost") {
      this.loadPlayerTopHistoryData();
    }

    const roadContainer = this.add.container(130, 26);
    roadContainer.setSize(800, 600).setScale(0.47);

    const carContainer = this.add.container(130, 26);
    carContainer.setSize(800, 600).setScale(0.47);

    this.bg1 = createBg1(this, roadContainer, this.gameLevel);
    this.tower = createTower(this, roadContainer);
    if (this.gameLevel.name === "free") {
      this.tower.setVisible(false);
    }

    this.tower.setAlpha(0.1);

    this.grassLand = createGrassLand(this, roadContainer, this.gameLevel);
    if (this.gameLevel.name === "ghost_2" || this.gameLevel.name === "free") {
      this.roadObjects = [];
    } else {
      this.roadObjects = createRoadObjects(this, roadContainer);
    }

    roadContainer.add(this.roadGraphics);

    this.speedMeter = new SpeedMeter(this, 211, 84, 21);
    this.speedMeter.setSpeed(0, MAX_SPEED, this.gameState);
    this.cars = createCars(
      this,
      this.center.x + 67,
      580,
      carContainer,
      this.roadData.cMax,
      this.roadData.enemyNum,
      this.gameLevel
    );

    const playerCar = this.cars[0];
    const carEmiter = createCarEmitter(this, playerCar, carContainer);

    this.createBoardData();
    this.courseData = makeCourseData(this.roadData);

    this.createTouchEvent(playerCar);

    playerCar.y = 0;

    const courseName = getCourseName(this.gameLevel.name);

    const totalTimer = createTextTotalTimer(this, this.center.x);
    this.txtTotalTimer = totalTimer.text;

    roadContainer.add(this.txtTotalTimer);
    const prevHigh = loadFromHighScoreLocalStorage(this.gameLevel.name) || null;

    this.txtPrevHighTimer = createTextPrevHighTimer(
      this,
      this.center.x,
      prevHigh
    );

    roadContainer.add(this.txtPrevHighTimer);

    this.initLapTimeData();
    this.txtLapTimerList = initLapTimerText(
      this,
      this.gameLevel,
      this.lapTimeObj,
      roadContainer
    );

    if (this.gameLevel.mode === "free") {
      this.txtTotalTimer.setVisible(false);
      totalTimer.rect.setVisible(false);
      this.txtPrevHighTimer.setVisible(false);
    }

    this.sounds = setupSounds(this);

    const txtStartNum = createTxtStartNum(this, courseName, this.center.x);
    this.setupTweensStartNum(txtStartNum);

    this.txtGameOver = createtxtGameOver(this, this.center.x);

    const mapContainer = this.createMapContainer();

    const _courseMap = createMapImage(this, this.gameLevel);
    this.courseMap = {
      image: _courseMap.image,
      points: _courseMap.points,
      playerPosGraphics: this.add.graphics(),
    };

    mapContainer.add(this.courseMap.image);
    mapContainer.add(this.courseMap.playerPosGraphics);

    if (this.gameLevel.mode === "free") {
      mapContainer.setVisible(false);
      this.speedMeter.hide();
    }

    this.lapLimit = LAP_NUM;

    if (this.gameLevel.mode === "ghost") {
      this.initGhostMode();
    } else if (this.gameLevel.isAuto) {
      initCarForAutoMode(this.cars);
    }

    this.gameEmitter = {
      carRunning: carEmiter.carRunning,
      carCurve: carEmiter.carCurve,
      confetti: createConfettiEmitter(this, carContainer),
    };

    this.gameContainer = {
      car: carContainer,
      road: roadContainer,
      map: mapContainer,
    };
  }

  async savaHistoryRecordData() {
    const _rec = this.playerCurRecord.map((d) => {
      return {
        x: Math.floor(d.x),
        y: d.y.toFixed(1),
        r: Math.floor(d.r),
      };
    });
    const comp = await compressToBase64(JSON.stringify(_rec));

    if (this.gameLevel.mode === "ghost") {
      saveHistoryData(comp, this.gameLevel);
    }
  }

  update(time: number, delta: number) {
    this.timeScale = delta / 16.666;
    // this.timeScale = (0.5 * delta) / 16.666;

    const playerCar = this.cars[0];

    this.roadData.dataLR[Math.trunc(playerCar.y / this.roadData.board)] + "";

    if (this.gameState === "gameover") {
      execGameoverPlayerCarTweens(this, playerCar);
      return;
    }

    this.gamepad.update(time, delta);

    this.pushPlayerCurDataToHistoryRecord(playerCar);
    this.updateRaceTime(playerCar);

    if (
      this.gameLevel.mode !== "free" &&
      this.lapTimeObj.lapNum >= this.lapLimit
    ) {
      this.handleGameover();
      return;
    }

    if (this.gameState === "running") {
      this.updateElapseForHistoryIndex++;
    }

    this.applyNaturalSlowdown(playerCar);

    this.speedMeter.setSpeed(playerCar.speed, MAX_SPEED, this.gameState);

    applyEmmiterWithCarSpeed(
      this.gameEmitter.carRunning,
      playerCar,
      this.steer,
      MAX_SPEED
    );
    applyCurveEmmiterWithCarSpeed(
      this.gameEmitter.carCurve,
      playerCar,
      this.steer,
      MAX_SPEED
    );

    if (this.gameState !== "ready") {
      this.applyPlayerLRX(playerCar);
      playerCar.image.setRotation(playerCar.lr * 0.025);
    }

    for (let car of this.cars) {
      if (this.gameState === "ready") {
        break;
      }

      if (
        !car.isPlayer &&
        this.gameLevel.mode === "ghost" &&
        this.playerTopHistory.length === 0
      ) {
        car.image.visible = false;
      }

      if (car.isPlayer || this.gameLevel.mode !== "ghost") {
        if (this.gameLevel.isAuto) {
          const ud =
            this.courseData.updown[
              Math.trunc(playerCar.y + PlayerY) % this.roadData.cMax
            ];
          // playerCar.speed = MAX_SPEED * 2 + ud * 10;
          playerCar.speed = Math.max(
            370,
            Math.min(playerCar.mileage * 0.35, 300) - ud * 7
          );
          playerCar.speed = Math.min(playerCar.speed, MAX_SPEED * 4);
        }
        this.applyCarY(car);
      } else if (
        !car.isPlayer &&
        this.gameLevel.mode === "ghost" &&
        this.playerTopHistory.length > 0
      ) {
        this.applyGhostEnemyXYAngle(car);
      }

      if (
        !car.isPlayer &&
        this.gameLevel.mode !== "ghost" &&
        !this.gameLevel.isAuto
      ) {
        this.applyNaturalSlowdown(car);

        // 接触時の処理
        this.applyContactCars(playerCar, car);

        // プレイヤーと敵の車が離れすぎていたら敵の車のスピードを調整する
        this.adjustEnemyCarSpeedForDistancePlayerCar(playerCar, car);

        this.applyEnemyLRX(playerCar, car);
        car.image.setRotation(car.lr * 0.29);
      }
    }

    this.roadGraphics.clear();
    const roadBasePosData = createRoadBasePosData(
      playerCar,
      this.roadData,
      this.courseData,
      this.dataBoard
    );

    if (this.gameLevel.isAuto) {
      for (let car of this.cars) {
        if (car.isPlayer) continue;
        car.y = playerCar.y + 33 + 10 * car.id;
        const curve =
          this.courseData.curve[Math.trunc(car.y) % this.roadData.cMax];
        car.lr = (curve * AUTO_MODE_CAR_ANGLE_RATE) / 10;
        if (car.lr > AUTO_MODE_CAR_ANGLE_RATE) {
          car.lr = AUTO_MODE_CAR_ANGLE_RATE;
        } else if (car.lr < -AUTO_MODE_CAR_ANGLE_RATE) {
          car.lr = -AUTO_MODE_CAR_ANGLE_RATE;
        }
        car.x = 400 - 11;
        car.image.setOrigin(playerCar.image.scaleX, playerCar.image.scaleY);
        car.image.setRotation(car.lr * 0.025);
      }
    }

    this.draw(playerCar, roadBasePosData);

    playSoundBikeRunBreak(
      this.updateElapseForHistoryIndex,
      this.gameState,
      playerCar,
      this.steer,
      this.sounds,
      this.playerSoundState,
      MAX_SPEED
    );

    if (this.gameLevel.isAuto) {
      for (let i = 0; i < this.cars.length; i++) {
        this.gameContainer.car.sendToBack(this.cars[i].image);
        if (!this.cars[i].isPlayer) {
          this.cars[i].image.y -= this.cars[i].image.getBounds().height * 1.2;
        }
      }
    }
  }

  pushPlayerCurDataToHistoryRecord(playerCar: Car) {
    if (this.gameState !== "running") return;

    if (
      this.gameLevel.mode === "ghost" &&
      isWithinTwoMinutes(this.lapTimeObj.totalTime)
    ) {
      this.playerCurRecord.push({
        x: playerCar.x,
        y: playerCar.y,
        r: playerCar.image.angle,
      });
    }
  }

  draw(
    playerCar: Car,
    roadBasePosData: { horizon: number; boardX: number[]; boardUd: number[] }
  ) {
    this.moveBgObjects(playerCar, roadBasePosData.horizon);

    const sy = { val: roadBasePosData.horizon };

    // ループ内で処理済みの敵の車
    const drawnEnemyCarIds: number[] = [];
    const enemyCars = getEnemyCars(this.cars);
    // 道路の水平エリア分割ごとの処理（道路の上側（画面奥）から処理するので逆ループ
    for (let i = this.roadData.board - 1; i > 0; i--) {
      const roadPosData = calcRoadPosData(
        i,
        sy,
        roadBasePosData,
        this.dataBoard
      );

      this.drawRoad(playerCar, i, roadPosData);
      this.moveRoadObjects(playerCar, i, roadPosData);
      this.applyPositionEnemyCars(
        i,
        roadPosData,
        playerCar,
        enemyCars,
        drawnEnemyCarIds
      );
    }

    hideEnemyCarsOutsideView(
      playerCar,
      enemyCars,
      this.gameLevel,
      drawnEnemyCarIds,
      this.dataBoard,
      calcRoadPosData(0, sy, roadBasePosData, this.dataBoard)
    );

    this.drawCarMarkOnMap();
  }

  applyPlayerLRX(playerCar: Car) {
    playerCar.lr = calcPlayerLR(this.steer);
    playerCar.x = getNextPlayerX(
      playerCar,
      this.courseData.curve,
      this.roadData.cMax,
      this.gameLevel,
      this.timeScale
    );

    if (this.gameLevel.isAuto) {
      const curve =
        this.courseData.curve[
          Math.trunc(playerCar.y + PlayerY) % this.roadData.cMax
        ];
      playerCar.lr = (curve * AUTO_MODE_CAR_ANGLE_RATE) / 10;
      if (playerCar.lr > AUTO_MODE_CAR_ANGLE_RATE) {
        playerCar.lr = AUTO_MODE_CAR_ANGLE_RATE;
      } else if (playerCar.lr < -AUTO_MODE_CAR_ANGLE_RATE) {
        playerCar.lr = -AUTO_MODE_CAR_ANGLE_RATE;
      }
      playerCar.x = 400 + 20;
    }
  }

  applyCarY(car: Car) {
    const diffY = (car.speed / 100) * this.timeScale;
    car.y += diffY;
    car.mileage += diffY;
    if (car.y > this.roadData.cMax - 1) {
      car.y -= this.roadData.cMax;
    }
  }
  applyEnemyLRX(playerCar: Car, enemyCar: Car) {
    if (enemyCar.lr !== 0 && Math.random() < 0.045) {
      changeEnemyLR(playerCar, enemyCar);
      enemyCar.curveDuration = 0;
    } else if (enemyCar.lr === 0) {
      if (enemyCar.curveDuration > enemyCar.curveTiming) {
        changeEnemyLR(playerCar, enemyCar);
        enemyCar.curveDuration = 0;
      }
    }
    enemyCar.curveDuration++;

    enemyCar.x =
      enemyCar.x + ((enemyCar.lr * enemyCar.speed) / 50) * this.timeScale;
    if (enemyCar.x < 50) {
      enemyCar.x = 50;
      enemyCar.lr = Math.trunc(enemyCar.lr * 0.9);
    } else if (enemyCar.x > 750) {
      enemyCar.x = 750;
      enemyCar.lr = Math.trunc(enemyCar.lr * 0.9);
    }
  }

  applyGhostEnemyXYAngle(enemyGhostCar: Car) {
    if (this.updateElapseForHistoryIndex < this.playerTopHistory.length) {
      enemyGhostCar.x =
        this.playerTopHistory[this.updateElapseForHistoryIndex].x;
      enemyGhostCar.y =
        this.playerTopHistory[this.updateElapseForHistoryIndex].y;
      enemyGhostCar.image.setAngle(
        this.playerTopHistory[this.updateElapseForHistoryIndex].r
      );
    }
  }

  applyContactCars(playerCar: Car, enemyCar: Car) {
    // 接触時の処理
    const cx = enemyCar.x - playerCar.x;
    const cy = enemyCar.y - ((playerCar.y + PlayerY) % this.roadData.cMax);
    if (
      this.gameLevel.mode !== "free" &&
      -98 <= cx &&
      cx <= 98 &&
      -40 <= cy &&
      cy <= 40
    ) {
      if (cy > 5) {
        if (!this.playerSoundState.contactEnemy) {
          const volume = 0.05 + (0.3 * playerCar.speed) / MAX_SPEED;
          this.playerSoundState.contactEnemy = true;
          playSound(this.sounds.contact, volume);
          setTimeout(() => {
            this.playerSoundState.contactEnemy = false;
          }, 1000);
        }
        playerCar.speed = enemyCar.speed * 0.7;
      } else {
        enemyCar.speed = playerCar.speed * 0.3;
      }
    }
  }

  applyPositionEnemyCars(
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
        if (this.gameLevel.mode === "ghost") {
          car.image.y = p.uy;
          car.image.x = p.ux + (car.x * this.dataBoard.w[index]) / 800;
          const scale =
            0.01 + (this.dataBoard.w[index] / this.dataBoard.w[0]) * 0.86;
          car.image.setScale(Math.max(0.01, scale * 0.64));
        } else {
          car.image.y = p.uy + car.image.getBounds().height * 2;
          if (this.gameLevel.isAuto) {
            car.image.x = p.ux + ((400 - 11) * this.dataBoard.w[index]) / 800;
          } else {
            car.image.x = p.ux + (car.x * this.dataBoard.w[index]) / 800;
          }
          const scale = 0.05 + this.dataBoard.w[index] / this.dataBoard.w[0];
          car.image.setScale(Math.max(0.01, scale * 0.84));
        }
        setTimeout(() => {
          car.image.visible = true;
        }, 1);
      }
      if (car.image.y > playerCar.image.y) {
        this.gameContainer.car.bringToTop(car.image);
      } else {
        this.gameContainer.car.sendToBack(car.image);
      }
    }
  }

  adjustEnemyCarSpeedForDistancePlayerCar(playerCar: Car, enemyCar: Car) {
    const diffRate =
      ((playerCar.y % this.roadData.cMax) - (enemyCar.y % this.roadData.cMax)) /
      this.roadData.cMax;

    let aveSp = 140;
    if (this.gameLevel.mode === "free") {
      if (enemyCar.y - playerCar.y > 220) {
        aveSp = 100 + enemyCar.id * 15;
      } else {
        aveSp += (Math.floor(playerCar.y) % 40) * 0.6 + enemyCar.id * 0.5;
      }
      if (aveSp > MAX_SPEED * 0.45) {
        aveSp = 78 + Math.floor(Math.random() * 60);
      }
    } else {
      aveSp = enemyCar.averageSpeed[this.lapTimeObj.lapNum];
    }

    let limitSpeed = aveSp;

    if (0.065 < diffRate && diffRate < 0.35) {
      limitSpeed *= 1.97;
    } else if (-0.4 < diffRate && diffRate < -0.65) {
      limitSpeed *= 0.43;
    }

    if (enemyCar.speed < limitSpeed) {
      if (this.gameLevel.mode === "free") {
        const ns = enemyCar.speed + 2;
        if (ns < MAX_SPEED * 0.88 - enemyCar.id * 4) {
          enemyCar.speed = ns;
        }
        if ((enemyCar.id === 2 || enemyCar.id === 7) && Math.random() < 0.6) {
          enemyCar.speed = playerCar.speed * 1.02;
        }
      } else {
        enemyCar.speed += 3;
      }
    }
  }

  createButton() {
    // ハンドル
    new HandleButton(this, 58, 290, 33);
    // アクセル、ブレーキ
    createActionButtons(this);

    const handleClockGameButton: ClockGameButtonHandlers = {
      TIME: () => {
        this.sound.stopAll();
        this.scene.start("ClockScene");
      },
      easy: () => {
        this.sound.stopAll();
        this.scene.start("MainScene", { gameLevel: GameLevelConfig.easy });
      },
      hard: () => {
        this.sound.stopAll();
        this.scene.start("MainScene", { gameLevel: GameLevelConfig.hard });
      },
      ghost_1: () => {
        this.sound.stopAll();
        this.scene.start("MainScene", { gameLevel: GameLevelConfig.ghost_1 });
      },
      ghost_2: () => {
        this.sound.stopAll();
        this.scene.start("MainScene", { gameLevel: GameLevelConfig.ghost_2 });
      },
      free: () => {
        this.sound.stopAll();
        this.scene.start("MainScene", { gameLevel: GameLevelConfig.free });
      },
      auto: () => {
        this.sound.stopAll();
        this.scene.start("MainScene", { gameLevel: GameLevelConfig.auto });
      },
    };

    createClockGameButtons(this, handleClockGameButton);
    createFullScreenButton(this);

    // const isGuardBgm = () => this.isGameover || this.isGameReady;
    createSoundButton(this);
  }

  createBoardData() {
    const board = this.roadData.board;
    this.dataBoard = {
      w: [],
      h: [],
      ud: [],
    };

    for (let i = 0; i < board; i++) {
      this.dataBoard.w.push(20 + ((board - i) * (board - i)) / 12);
      this.dataBoard.h.push((3.6 * (board - i)) / board);
      const rad = (i * 1.5 * Math.PI) / 180;
      this.dataBoard.ud.push(2 * Math.sin(rad));
    }
  }

  createTouchEvent(playerCar: Car) {
    this.events.on("steerChanged", (steer: number) => {
      this.steer = steer;
    });

    this.events.on("speedChanged", (sp: number) => {
      if (!this.isCountdownStart) return;
      let rateReady = 1;
      if (this.gameState === "ready") {
        rateReady = 0.9;
      }

      const isPlayerOutOfRoad = isCarOutOfRoad(playerCar);
      const maxSpeed = isPlayerOutOfRoad ? MAX_SPEED * 0.7 : MAX_SPEED;
      const rate = isPlayerOutOfRoad ? 0.7 : 1;

      const nextSpeed = Math.max(
        0,
        Math.min(maxSpeed, playerCar.speed + sp * rate * rateReady)
      );
      playerCar.speed = nextSpeed;
    });
  }

  applyNaturalSlowdown(playerCar: Car) {
    const key: CooldownActionKey =
      this.gameState === "ready" ? "slowDownWhenReady" : "slowDownWhenRunning";

    tryAction(this.time.now, key, this.lastCooldownActionTimes, () =>
      this._applyNaturalSlowdown(playerCar)
    );
  }

  _applyNaturalSlowdown(car: Car) {
    let slowRate = 0.9969 - Math.abs(car.lr * 0.0004);
    if (this.gameState === "ready") {
      slowRate = 0.9;
    } else if (isCarOutOfRoad(this.cars[0]) && car.isPlayer) {
      slowRate = 0.4;
    }
    car.speed = Math.max(0, car.speed * slowRate);
    if (car.speed < 30) {
      car.speed = 0;
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

          moveRoadObjects(obj, obj.scale, rate, p.ux, p.uy, p.uw, 1);
        }
      } else {
        obj.image.visible = false;
      }
    }
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
      if (this.gameLevel.mode === "free") {
        obj.image.visible = false;
        continue;
      }
      let projectionData: { visible: boolean; screenX?: number | null } = {
        visible: false,
        screenX: 0,
      };
      const _x = obj.x;
      projectionData = projectXOnly(_x, obj.z, 0, 0, pPos.r, fov, 900);

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
    return this.courseMap.points[Math.trunc(carY) % this.roadData.cMax];
  }

  createMapContainer() {
    const mapContainer = this.add
      .container()
      .setDepth(9999999)
      .setPosition(485, 55)
      .setScale(1 * 0.95, 1.28 * 0.95)
      .setAngle(90);

    if (this.gameLevel.name === "ghost_2") {
      mapContainer.x += 3;
      mapContainer.y -= 3;
    } else if (this.gameLevel.name !== "easy") {
      mapContainer.x -= 11;
    }
    return mapContainer;
  }

  setupTweensStartNum(txtStartNum: Phaser.GameObjects.BitmapText) {
    this.tweens.add({
      targets: txtStartNum,
      scaleY: [1.0, 0.8],
      duration: 1100,
      delay: this.gameLevel.mode === "ghost" ? 5000 : 3000,
      // duration: 1,
      // delay: 1,
      repeat: 1,
      yoyo: true,
      ease: "Sine.easeInOut",
      onStart: () => {
        txtStartNum.text = "Ready";
        playSound(this.sounds.ready, 0.3);
      },
      onComplete: () => {
        if (this.txtGhostNote) {
          this.txtGhostNote.setVisible(false);
        }
        stopSound(this.sounds.ready);
        playSound(this.sounds.countdown, 0.3);
        playSound(this.sounds.bikeStart, 0.3);
        txtStartNum.setScale(1);
        this.isCountdownStart = true;
        txtStartNum.text = "3";
        this.startCountdown(txtStartNum);
      },
    });
  }

  updateRaceTime(playerCar: Car) {
    if (this.gameState !== "running") return;

    this.lapTimeObj.update(
      playerCar.mileage,
      this.txtTotalTimer,
      this.txtLapTimerList,
      (_lapNum) => {
        if (this.gameLevel.mode === "ghost") return;
        if (_lapNum === 1) {
          playSound(this.sounds.lap2, 0.3);
        } else if (_lapNum === 2) {
          playSound(this.sounds.lapFinal, 0.3);
        }
      },
      this.gameLevel.mode === "free"
    );
  }

  handleGameover() {
    stopSound(this.sounds.bikeRun);
    stopSound(this.sounds.bikeBreak);
    this.gameState = "gameover";
    this.gameEmitter.confetti.start();

    this.time.delayedCall(6000, () => {
      this.gameEmitter.confetti.stop();
    });
    const prevHigh = loadFromHighScoreLocalStorage(this.gameLevel.name) || null;
    let isNewRecord = false;
    if (!prevHigh || this.lapTimeObj.totalTime < prevHigh) {
      saveToHighScoreLocalStorage(
        this.gameLevel.name,
        this.lapTimeObj.totalTime
      );

      // 記録が2分以内の場合のみ履歴を記録する
      if (
        this.gameLevel.mode === "ghost" &&
        isWithinTwoMinutes(this.lapTimeObj.totalTime)
      ) {
        this.savaHistoryRecordData();
      }

      if (prevHigh) {
        isNewRecord = true;
      }
    }

    if (isNewRecord) {
      playSound(this.sounds.goalNewRecord, 0.3);
      this.txtGameOver.text = "New Record!!";
    } else {
      playSound(this.sounds.goal, 0.3);
    }

    this.gameEmitter.carRunning.stop();
    this.gameEmitter.carCurve.stop();
    this.txtGameOver.visible = true;
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
        this.sounds.bikeStart.volume = (0.5 * this.cars[0].speed) / MAX_SPEED;
      },
      onRepeat: () => {
        startTextNum--;
        txtStartNum.text = `${startTextNum}`;
      },
      onComplete: () => {
        txtStartNum.y += 20;
        this.lapTimeObj.start(this.time.now);
        stopSound(this.sounds.countdown);
        txtStartNum.text = "";
        setTimeout(() => {
          playSound(this.sounds.go);
          stopSound(this.sounds.bikeStart);
          txtStartNum.text = "GO!!!!";
          this.gameState = "running";
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

  drawRoad(playerCar: Car, i: number, roadPosData: RoadPosData) {
    drawRoadGraphics(
      this.roadGraphics,
      this.gameLevel,
      playerCar,
      i,
      this.roadData,
      roadPosData
    );
  }

  drawCarMarkOnMap() {
    drawCarMarkOnMapGraphics(
      this.courseMap.playerPosGraphics,
      this.gameLevel,
      this.cars,
      this.playerTopHistory,
      (y: number) => this.getRoadPosData(y)
    );
  }

  initGhostMode() {
    this.lapLimit = 1;
    initCarForGhostMode(this.cars);
    this.txtGhostNote = createTextGhostNote(this, this.center.x);

    if (this.playerTopHistory.length === 0) {
      this.cars[1].image.setVisible(false);
    }
  }
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
  gamelevel: GameLevelProps,
  timeScale: number
) {
  const turnPower = calcTurnPower(car.speed);
  let nextX = car.x;
  nextX = car.x + car.lr * turnPower * 0.1 * timeScale;

  nextX -=
    ((car.speed * curve[Math.trunc(car.y + PlayerY) % cMax]) / 350) * timeScale;
  let minX = -190;
  let maxX = 990;
  if (gamelevel.name === "ghost_2" || gamelevel.name === "free") {
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
