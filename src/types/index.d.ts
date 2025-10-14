export type CooldownActionKey =
  | "slowDownWhenReady"
  | "slowDownWhenRunning"
  | "slowDownEnemy";

export type LastCooldownActionTimes = Record<CooldownActionKey, number>;
export type CourseData = {
  curve: number[];
  updown: number[];
  objectRight: number[];
  objectLeft: number[];
};

export type GameState = "ready" | "running" | "gameover";
export type BikeSoundState = {
  running: boolean;
  curving: boolean;
  contactEnemy: boolean;
};

export type SoundType =
  | Phaser.Sound.NoAudioSound
  | Phaser.Sound.HTML5AudioSound
  | Phaser.Sound.WebAudioSound;

export type RoadData = {
  dataLR: number[];
  dataUD: number[];
  cLen: number;
  board: number;
  cMax: number;
  enemyNum: number;
};
export type LevelRoadLRUD = {
  ENEMY_NUM: number;
  DATA_LR: number[];
  DATA_UD: number[];
};

export type RoadPosData = {
  ux: number;
  uy: number;
  uw: number;
  bx: number;
  by: number;
  bw: number;
};

export type GameLevelKey =
  | "easy"
  | "hard"
  | "free"
  | "ghost_1"
  | "ghost_2"
  | "auto";
export type GameLevelProps = {
  name: GameLevelKey;
  mode: "race" | "ghost" | "free";
  isAuto: boolean;
};

export type GameLevel = Record<GameLevelKey, GameLevelProps>;

type ClockGameButtonHandlers = Record<
  "TIME" | "easy" | "hard" | "free" | "ghost_1" | "ghost_2",
  "auto",
  "reset",
  () => void
>;

export type RoadObject = {
  image: Phaser.GameObjects.Image;
  boardIndex: number; // BOARD 上のインデックス
  side: "left" | "right";
  scale: { x: number; y: number };
};

export type GameContainer = {
  car: Phaser.GameObjects.Container;
  road: Phaser.GameObjects.Container;
  map: Phaser.GameObjects.Container;
};

export type BoardData = {
  w: number[];
  h: number[];
  ud: number[];
};

export type Car = {
  id: number;
  isPlayer: boolean;
  image: Phaser.GameObjects.Image;
  x: number;
  y: number;
  mileage: number;
  lr: number;
  speed: number;
  prevSpeed: number;
  averageSpeed: number[];
  curveTiming: number;
  curveDuration: number;
};
