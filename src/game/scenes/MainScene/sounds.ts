import type { BikeSoundState, Car, GameState, SoundType } from "../../../types";
import { playSound } from "../../../utils/util";
import { isAvailableSound } from "../../main";

export type GameSoundKeys =
  | "countdown"
  | "bikeStart"
  | "ready"
  | "go"
  | "bikeRun"
  | "bikeBreak"
  | "lap2"
  | "lapFinal"
  | "goal"
  | "goalNewRecord"
  | "contact";

export type GameSounds = Record<GameSoundKeys, SoundType>;

export function setupSounds(scene: Phaser.Scene): GameSounds {
  const sounds = {
    countdown: scene.sound.add("321"),
    bikeStart: scene.sound.add("bikeStart"),
    bikeRun: scene.sound.add("bikeRun"),
    bikeBreak: scene.sound.add("bikeBreak"),
    ready: scene.sound.add("ready"),
    go: scene.sound.add("go"),

    lap2: scene.sound.add("lap2"),
    lapFinal: scene.sound.add("lapFinal"),
    goal: scene.sound.add("goal"),
    goalNewRecord: scene.sound.add("goal-new-record"),
    contact: scene.sound.add("contact"),
  };

  return sounds;
}

export function playSoundBikeRunBreak(
  updateElapse: number,
  gameState: GameState,
  playerCar: Car,
  steer: number,
  sounds: GameSounds,
  playerSoundState: BikeSoundState,
  maxSpeed: number
) {
  if (gameState === "ready") return;

  if (!playerSoundState.running && isAvailableSound()) {
    playerSoundState.running = true;
    playSound(sounds.bikeRun, 0, true);
  }

  const beat1 = Math.sin(updateElapse / 600) * 0.12;
  const beat2 = updateElapse % 300;
  const beat3 = Math.sin(updateElapse / 6000) * 0.1321;

  // ---- エンジン音の変化 ----
  const accel = playerCar.speed - playerCar.prevSpeed;
  playerCar.prevSpeed = playerCar.speed;

  // 基本ピッチ（速度に応じて上がる）
  const baseRate =
    0.1 +
    (playerCar.speed / maxSpeed) * 0.86 -
    (Math.abs(playerCar.lr) / 8) * 0.02 +
    beat1;

  // 加速時の短期的な上昇（ブオン感）
  const accelEffect = Phaser.Math.Clamp(accel * 3.4, -0.1, 0.1);
  // const accelEffect = 0.3;

  // 実際の再生レート設定
  sounds.bikeRun.setRate(baseRate + accelEffect);

  // 音量も少し速度で変える
  const ss = beat2 < 150 ? 0.67 : 1;
  sounds.bikeRun.setVolume(
    ss * (0.08 + (0.5 * playerCar.speed) / maxSpeed + beat3)
  );

  if (Math.abs(steer) >= 2) {
    if (!playerSoundState.curving && playerCar.speed > maxSpeed * 0.4) {
      playerSoundState.curving = true;
      const baseRate = 0.8 + (playerCar.speed / 200) * 0.8;

      sounds.bikeBreak.setRate(baseRate);
      playSound(sounds.bikeBreak, (0.3 * playerCar.speed) / maxSpeed, false);
    }
  } else {
    playerSoundState.curving = false;
  }
}
