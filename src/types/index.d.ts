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

export type GameLevel = "easy" | "hard" | "free" | "ghost_1" | "ghost_2";
type ClockGameButtonHandlers = Record<
  "TIME" | "easy" | "hard" | "free" | "ghost_1" | "ghost_2",
  "reset",
  () => void
>;

export type RoadObject = {
  image: Phaser.GameObjects.Image;
  boardIndex: number; // BOARD 上のインデックス
  side: "left" | "right";
  scale: { x: number; y: number };
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
};
