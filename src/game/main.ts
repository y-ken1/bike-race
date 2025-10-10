import { Boot } from "./scenes/Boot";
import { ClockScene } from "./scenes/ClockScene";
import { MainScene } from "./scenes/MainScene";
import { Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

let availableSound = false;
export function toggleAvailableSound(scene: Phaser.Scene) {
  availableSound = !availableSound;
  scene.sound.volume = availableSound ? 1 : 0;
}

export function setAvailableSound(b: boolean) {
  availableSound = b;
}

export function isAvailableSound() {
  return availableSound;
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  backgroundColor: "#000000",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 360,
  },
  input: {
    gamepad: true,
  },

  scene: [Boot, Preloader, ClockScene, MainScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
