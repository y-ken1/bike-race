import type { Car, GameLevelProps } from "../../../types";
import { ROAD_DATA_LR_UD } from "../../../utils/const";
import { interpolateArray } from "../../../utils/util";

export function createMapImage(
  scene: Phaser.Scene,
  gameLevel: GameLevelProps
): {
  image: Phaser.GameObjects.Image;
  points: { x: number; y: number; r: number }[];
} {
  const _mapPoints: { x: number; y: number; r: number }[] = [];

  const data = ROAD_DATA_LR_UD[gameLevel.name].DATA_LR;
  const g = scene.add.graphics();

  g.lineStyle(5, 0xffffff, 0.9);

  let baseX = 60;
  let baseY = 60;
  let rangeX = 6 * 1.15;
  let rangeY = 5 * 1.15;
  if (gameLevel.name === "ghost_2") {
    baseX = 58;
    baseY = 58;
    rangeX = 6 * 0.85;
    rangeY = 5 * 0.85;
  } else if (gameLevel.name !== "easy") {
    baseX = 50;
    baseY = 50;
    rangeX = 6 * 0.8;
    rangeY = 5 * 0.8;
  }

  g.moveTo(baseX, baseY);
  _mapPoints.push({ x: baseY, y: baseY, r: 0 });
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

    _mapPoints.push({ x: x2, y: y2, r: angle });
  }
  g.strokePath();
  // goal line
  if (gameLevel.mode !== "free") {
    g.lineStyle(2, 0x878787, 1);
    g.strokeRect(baseX, baseY - 7, 2, 14);
  }

  const maxXObj = _mapPoints.reduce((v, obj) => (obj.x > v.x ? obj : v));
  const maxYObj = _mapPoints.reduce((v, obj) => (obj.y > v.y ? obj : v));
  const minXObj = _mapPoints.reduce((v, obj) => (obj.x < v.x ? obj : v));
  const minYObj = _mapPoints.reduce((v, obj) => (obj.y < v.y ? obj : v));

  if (gameLevel.name === "easy") {
    const width = maxXObj.x - minXObj.x + 20;
    const height = maxYObj.y - minXObj.y + 33;
    g.fillStyle(0x000000, 0.1);
    g.fillRect(minXObj.x - 10, minYObj.y - 12, width, height);
  } else if (gameLevel.name === "free") {
    const width = maxXObj.x - minXObj.x + 20;
    const height = maxYObj.y - minXObj.y + 48;
    g.fillStyle(0x000000, 0.1);
    g.fillRect(minXObj.x - 10, minYObj.y - 9, width, height);
  } else if (gameLevel.name === "ghost_2") {
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
  if (scene.textures.exists("grid")) {
    scene.textures.remove("grid");
  }
  g.generateTexture("grid", 100, 100);

  // Graphicsはもう不要
  g.destroy();

  // Imageとして1ドローで表示
  const map = scene.add
    .image(0, 0, "grid")
    .setScale(1)
    .setOrigin(0)
    .setDepth(999999999);

  _mapPoints[_mapPoints.length - 1] = {
    x: Math.abs(_mapPoints[0].x + _mapPoints[_mapPoints.length - 2].x) / 2,
    y: Math.abs(_mapPoints[0].y + _mapPoints[_mapPoints.length - 2].y) / 2,
    r: Math.abs(_mapPoints[0].r + _mapPoints[_mapPoints.length - 2].r) / 2,
  };

  const points = interpolateArray(_mapPoints);

  return { image: map, points };
}

export function drawCarMarkOnMapGraphics(
  g: Phaser.GameObjects.Graphics,
  gameLevel: GameLevelProps,
  cars: Car[],
  playerTopHistory: { x: number; y: number; r: number }[],
  getRoadPosData: (y: number) => { x: number; y: number; r: number }
) {
  g.clear();
  for (let i = 0; i < cars.length; i++) {
    const curPosData = getRoadPosData(cars[i].y);

    const offset = (3 * (cars[i].x - 400)) / 400;
    const x = curPosData.x - Math.sin(curPosData.r) * offset;
    const y = curPosData.y - Math.cos(curPosData.r) * offset;

    if (i === 0) {
      g.fillStyle(0xdd5544, 0.8);
      g.fillCircle(x, y, 2.5);
    } else {
      if (gameLevel.mode === "ghost") {
        if (playerTopHistory.length > 0) {
          g.lineStyle(1, 0x0000ff, 0.8);
          g.strokeRect(x, y, 3, 3);
        }
      } else {
        g.fillStyle(0x229955, 1);
        g.fillPoint(x, y, 1.18);
      }
    }
  }
}
