// carEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
// carCurveEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

import type { Car } from "../../../types";
import { isCarOutOfRoad } from "./car";

export type GameEmitter = {
  carRunning: Phaser.GameObjects.Particles.ParticleEmitter;
  carCurve: Phaser.GameObjects.Particles.ParticleEmitter;
  confetti: Phaser.GameObjects.Particles.ParticleEmitter;
};

export function createCarEmitter(
  scene: Phaser.Scene,
  playerCar: Car,
  carContainer: Phaser.GameObjects.Container
) {
  const carRunning = createCarRunningEmitter(
    scene,
    playerCar.image.x + 20,
    playerCar.image.y - 3,
    carContainer
  );

  carRunning.start();

  const carCurve = createCarCurveEmitter(
    scene,
    playerCar.image.x - 90,
    playerCar.image.y + 20,
    carContainer
  );
  carCurve.start();

  return { carRunning, carCurve };
}
function createCarRunningEmitter(
  scene: Phaser.Scene,
  x: number,
  y: number,
  container: Phaser.GameObjects.Container
) {
  const emitter = scene.add
    .particles(x, y, "smoke", {
      speed: 63,
      lifespan: 1050,

      quantity: 2,
      gravityY: 1800,
      gravityX: 0,
      tint: [0xffff88, 0xffaacc, 0xfffcaa],
      alpha: { start: 0.4, end: 0.3 },
      scale: { start: 1, end: 0 },
      emitting: false,
      frequency: 100,
    })
    .setDepth(999999);

  container.add(emitter);
  return emitter;
}

function createCarCurveEmitter(
  scene: Phaser.Scene,
  x: number,
  y: number,
  container: Phaser.GameObjects.Container
) {
  const emitter = scene.add
    .particles(x, y, "flare", {
      speed: { min: 100, max: 200 },
      lifespan: { min: 150, max: 400 },
      gravityY: 100,
      quantity: 5,
      blendMode: "ADD",
      tint: [0xff0000, 0xff3300, 0xdf4500],
      alpha: { start: 0.8, end: 0.3 },
      scale: { start: 0.5, end: 0 },
    })
    .setDepth(999999);

  container.add(emitter);
  container.add(emitter);
  return emitter;
}

export function createConfettiEmitter(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
) {
  // 小さな矩形テクスチャを生成（カラーは tint で変える）
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 6, 10); // 幅6px, 高さ10px の紙吹雪ピース
  g.generateTexture("confetti", 6, 10);
  const emitter = scene.add
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

  container.add(emitter);
  emitter.stop();

  return emitter;
}

export function applyEmmiterWithCarSpeed(
  emitter: Phaser.GameObjects.Particles.ParticleEmitter,
  playerCar: Car,
  steer: number,
  maxSpeed: number
) {
  if (playerCar.speed < 30) {
    emitter.visible = false;
  } else {
    emitter.visible = true;

    if (steer === 0) {
      emitter.x = playerCar.image.x + 25;
      emitter.y = playerCar.image.y - 17;
    } else {
      const rad = playerCar.image.rotation;

      const baseX = 25;
      const baseY = -17;
      const _sin = Math.sin(rad);
      const _cos = Math.cos(rad);
      emitter.x = playerCar.image.x + baseX * _cos - baseY * _sin;
      emitter.y = playerCar.image.y + baseX * _sin + baseY * _cos;
    }

    emitter.setScale((1.32 * playerCar.speed) / maxSpeed);
    emitter.setAlpha((3 * playerCar.speed) / maxSpeed);
    emitter.setAngle(playerCar.image.angle * 0.8);
  }
}

export function applyCurveEmmiterWithCarSpeed(
  emitter: Phaser.GameObjects.Particles.ParticleEmitter,
  playerCar: Car,
  steer: number,
  maxSpeed: number
) {
  if (
    isCarOutOfRoad(playerCar) ||
    playerCar.speed < 30 ||
    Math.abs(steer) < 2
  ) {
    emitter.visible = false;
  } else {
    const _x = playerCar.image.x + (playerCar.lr > 0 ? 50 : -50);
    const _y = playerCar.image.y + (playerCar.lr > 0 ? 16 : 6);
    const _gx = 10000 * Math.sign(playerCar.lr);
    emitter.x = _x;
    emitter.y = _y;
    emitter.setParticleGravity(_gx, 10);
    emitter.setAlpha(Math.max(0, (playerCar.speed - 130) / maxSpeed));
    emitter.visible = true;
  }
}
