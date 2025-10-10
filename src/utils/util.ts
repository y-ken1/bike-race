import LZString from "lz-string";

import { Math as PhaserMath } from "phaser";
export const Vec2 = PhaserMath.Vector2;
export type Vec2 = PhaserMath.Vector2;

import { isAvailableSound } from "../game/main";
import type { GameLevel, SoundType } from "../types";
// import type { GameLevel, SoundLabel } from "../types";

// import { SCREEN } from "./const";

const LOCALSTORAGE_KEY = "BIKE-RACE-GAME-HIGHSCORE_1008";
const LOCALSTORAGE_KEY_EASY = "BIKE-RACE-GAME-HIGHSCORE-EASY_1008";
const LOCALSTORAGE_KEY_GHOST_1 = "BIKE-RACE-GAME-HIGHSCORE-GHOST_1008";
const LOCALSTORAGE_KEY_GHOST_2 = "BIKE-RACE-GAME-HIGHSCORE-GHOST_2_1008";

const LOCALSTORAGE_KEY_GHOST_1_HISTORY = "BIKE-RACE-GAME-GHOST-HISTORY_1009";
const LOCALSTORAGE_KEY_GHOST_2_HISTORY = "BIKE-RACE-GAME-GHOST-HISTORY_2_1009";
export function removeAllLoaclStrage() {
  localStorage.removeItem(LOCALSTORAGE_KEY);
  localStorage.removeItem(LOCALSTORAGE_KEY_EASY);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_1);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_2);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_1_HISTORY);
  localStorage.removeItem(LOCALSTORAGE_KEY_GHOST_2_HISTORY);
}

export function loadFromHighScoreLocalStorage(level: GameLevel) {
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

export function loadHistoryDataGhost(
  gameLevel: Extract<GameLevel, "ghost_1" | "ghost_2">
) {
  const key =
    gameLevel === "ghost_1"
      ? LOCALSTORAGE_KEY_GHOST_1_HISTORY
      : LOCALSTORAGE_KEY_GHOST_2_HISTORY;

  const d = localStorage.getItem(key);
  if (d) {
    return d;
  }
  return null;
}
export function saveHistoryData(
  data: string,
  gameLevel: Extract<GameLevel, "ghost_1" | "ghost_2">
) {
  const key =
    gameLevel === "ghost_1"
      ? LOCALSTORAGE_KEY_GHOST_1_HISTORY
      : LOCALSTORAGE_KEY_GHOST_2_HISTORY;

  localStorage.setItem(key, data);
}

export function saveToHighScoreLocalStorage(
  level: GameLevel,
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
