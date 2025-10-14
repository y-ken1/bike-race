import type { GameLevelProps } from "../../../types";

export function createBg1(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  gameLevel: GameLevelProps
) {
  const bg1 = scene.add.image(0, 0, "bg1").setScale(2.5, 2.45).setOrigin(0, 0);
  container.add(bg1);
  if (gameLevel.mode === "free") {
    bg1.setTint(0xffffff);
    setupTweensForBg1WhenGameLevelFree(scene, bg1, gameLevel);
  }
  return bg1;
}

export function createTower(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
) {
  const tower = scene.add
    .image(230, 220, "tower")
    .setScale(1.8)
    .setAlpha(0.5)
    .setOrigin(0.5, 1);

  container.add(tower);
  return tower;
}

export function createGrassLand(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  gamelevel: GameLevelProps
) {
  const grassLand = scene.add.image(0, 0, "grass").setOrigin(0, 0);

  if (gamelevel.mode === "free") {
    grassLand.setTint(0xccddcc);
    setupTweensForGrassLandWhenGameLevelFree(scene, grassLand, gamelevel);
  } else if (gamelevel.name === "ghost_2") {
    grassLand.setTint(0x6cddff);
  } else {
    grassLand.setTint(0xccddcc);
  }

  container.add(grassLand);
  return grassLand;
}

function setupTweensForBg1WhenGameLevelFree(
  scene: Phaser.Scene,
  bg1: Phaser.GameObjects.Image,
  gameLevel: GameLevelProps
) {
  const colors = [
    Phaser.Display.Color.ValueToColor(0xffffff),
    Phaser.Display.Color.ValueToColor(0x888888),
  ];

  const colorObj = { t: 0 };
  scene.tweens.add({
    targets: colorObj,
    t: 1,
    duration: gameLevel.isAuto ? 62000 : 60000,
    ease: "Linear",
    delay: 8000,
    repeat: -1,
    yoyo: true,
    onUpdate: () => {
      const totalSegments = colors.length - 1;
      const seg = colorObj.t * totalSegments;
      const index = Math.floor(seg);
      const localT = seg - index;

      const c1 = colors[index];
      const c2 = colors[index + 1] || colors[0];

      // 線形補間
      const r = Phaser.Math.Linear(c1.red, c2.red, localT);
      const g = Phaser.Math.Linear(c1.green, c2.green, localT);
      const b = Phaser.Math.Linear(c1.blue, c2.blue, localT);

      bg1.setTint(Phaser.Display.Color.GetColor(r, g, b));
    },
  });
}

function setupTweensForGrassLandWhenGameLevelFree(
  scene: Phaser.Scene,
  grassLand: Phaser.GameObjects.Image,
  gameLevel: GameLevelProps
) {
  const colors = [
    Phaser.Display.Color.ValueToColor(0xccddcc),
    Phaser.Display.Color.ValueToColor(0x6cddff),
    Phaser.Display.Color.ValueToColor(0x3c88aa),
    Phaser.Display.Color.ValueToColor(0x999999),
    Phaser.Display.Color.ValueToColor(0xccffdd),
  ];
  // tweenデータ用の一時オブジェクト
  const colorObj = { t: 0 };

  // Tweenを作成
  scene.tweens.add({
    targets: colorObj,
    t: 1,
    duration: gameLevel.isAuto ? 75000 : 90000,
    ease: "Linear",
    repeat: -1,
    delay: 6000,
    yoyo: true,
    onUpdate: () => {
      const totalSegments = colors.length - 1;
      const seg = colorObj.t * totalSegments;
      const index = Math.floor(seg);
      const localT = seg - index;

      const c1 = colors[index];
      const c2 = colors[index + 1] || colors[0];

      const r = Phaser.Math.Linear(c1.red, c2.red, localT);
      const g = Phaser.Math.Linear(c1.green, c2.green, localT);
      const b = Phaser.Math.Linear(c1.blue, c2.blue, localT);
      grassLand.setTint(Phaser.Display.Color.GetColor(r, g, b));
    },
  });
}
