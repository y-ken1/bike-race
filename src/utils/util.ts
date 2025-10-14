import LZString from "lz-string";

import { Math as PhaserMath } from "phaser";
export const Vec2 = PhaserMath.Vector2;
export type Vec2 = PhaserMath.Vector2;

import { isAvailableSound } from "../game/main";
import type { GameLevelKey, GameLevelProps, SoundType } from "../types";
// import type { GameLevel, SoundLabel } from "../types";

// import { SCREEN } from "./const";

const LOCALSTORAGE_KEY = "BIKE-RACE-GAME-HIGHSCORE_v2";
const LOCALSTORAGE_KEY_EASY = "BIKE-RACE-GAME-HIGHSCORE-EASY_v2";
const LOCALSTORAGE_KEY_GHOST_1 = "BIKE-RACE-GAME-HIGHSCORE-GHOST_v2";
const LOCALSTORAGE_KEY_GHOST_2 = "BIKE-RACE-GAME-HIGHSCORE-GHOST_2_v2";

const LOCALSTORAGE_KEY_GHOST_1_HISTORY = "BIKE-RACE-GAME-GHOST-HISTORY_v2";
const LOCALSTORAGE_KEY_GHOST_2_HISTORY = "BIKE-RACE-GAME-GHOST-HISTORY_2_v2";
export function removeAllLoaclStrage() {
  localStorage.removeItem(LOCALSTORAGE_KEY);
  localStorage.removeItem(LOCALSTORAGE_KEY_EASY);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_1);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_2);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_1_HISTORY);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_2_HISTORY);
}

export function loadFromHighScoreLocalStorage(level: GameLevelKey) {
  let highScoreStr: string | null = null;
  if (level === "easy") {
    highScoreStr = localStorage.getItem(LOCALSTORAGE_KEY_EASY);
  } else if (level === "ghost_1") {
    highScoreStr = localStorage.getItem(LOCALSTORAGE_KEY_GHOST_1);
  } else if (level === "ghost_2") {
    highScoreStr = localStorage.getItem(LOCALSTORAGE_KEY_GHOST_2);
  } else {
    highScoreStr = localStorage.getItem(LOCALSTORAGE_KEY);
  }
  return highScoreStr ? Number(highScoreStr) : 0;
}

export function loadHistoryDataGhost(gameLevel: GameLevelProps) {
  if (gameLevel.mode !== "ghost")
    throw new Error("Ghostモード以外で呼ばれました");

  const key =
    gameLevel.name === "ghost_1"
      ? LOCALSTORAGE_KEY_GHOST_1_HISTORY
      : LOCALSTORAGE_KEY_GHOST_2_HISTORY;

  const d = localStorage.getItem(key);
  if (d) {
    return d;
  }
  return null;
}
export function saveHistoryData(data: string, gameLevel: GameLevelProps) {
  if (gameLevel.mode !== "ghost")
    throw new Error("Ghostモード以外で呼ばれました");

  const key =
    gameLevel.name === "ghost_1"
      ? LOCALSTORAGE_KEY_GHOST_1_HISTORY
      : LOCALSTORAGE_KEY_GHOST_2_HISTORY;

  localStorage.setItem(key, data);
}

export function saveToHighScoreLocalStorage(
  level: GameLevelKey,
  highScore: number
) {
  if (level === "easy") {
    localStorage.setItem(LOCALSTORAGE_KEY_EASY, String(highScore));
  } else if (level === "ghost_1") {
    localStorage.setItem(LOCALSTORAGE_KEY_GHOST_1, String(highScore));
  } else if (level === "ghost_2") {
    localStorage.setItem(LOCALSTORAGE_KEY_GHOST_2, String(highScore));
  } else {
    localStorage.setItem(LOCALSTORAGE_KEY, String(highScore));
  }
}

export function playSound(
  sound: SoundType,
  value: number = 0.38,
  loop: boolean = false
) {
  if (!isAvailableSound()) {
    return null;
  }

  sound.play({ volume: value, loop: loop });
}

export function stopSound(sound: SoundType) {
  sound.stop();
}
// 文字列を圧縮してBase64化
export async function compressToBase64(text: string) {
  const compressed = LZString.compressToUTF16(text);
  return compressed;
}

// Base64文字列を解凍して元のテキストへ
export async function decompressFromBase64(compressed: string) {
  const decompressed = LZString.decompressFromUTF16(compressed);
  return decompressed;
}

// 線形補間
export function leapBoard(a: number, b: number, j: number, board: number) {
  return (a * (board - j) + b * j) / board;
}

export function lerpAngle(start: number, end: number, t: number) {
  let delta = end - start;

  // -π ~ π の範囲に変換
  delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

  return start + delta * t;
}

export function interpolateArray(
  arr: { x: number; y: number; r: number }[],
  segments = 120
) {
  const result: { x: number; y: number; r: number }[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    const start = arr[i];
    const end = arr[i + 1];

    for (let j = 0; j < segments; j++) {
      const t = j / segments; // 0 から 1
      result.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        // angle: start.angle + (end.angle - start.angle) * t,
        r: lerpAngle(start.r, end.r, t),
      });
    }
  }

  // 最後の値を追加
  result.push(arr[arr.length - 1]);

  return result;
}

export function projectXOnly(
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

export function getCourseName(gameLevel: GameLevelKey) {
  let courseName = "Race 1";
  if (gameLevel === "hard") {
    courseName = "Race 2";
  } else if (gameLevel === "free") {
    courseName = "Free";
  } else if (gameLevel === "ghost_1") {
    courseName = "Ghost 1";
  } else if (gameLevel === "ghost_2") {
    courseName = "Ghost 2";
  } else if (gameLevel === "auto") {
    courseName = "Auto";
  }

  return courseName;
}
