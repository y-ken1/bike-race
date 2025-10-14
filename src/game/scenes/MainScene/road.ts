import type {
  BoardData,
  Car,
  CourseData,
  GameLevelProps,
  RoadData,
  RoadObject,
  RoadPosData,
} from "../../../types";
import {
  COLOR_ROAD,
  COLOR_ROAD_LINE_INNER,
  COLOR_ROAD_LINE_OUTER,
  COLOR_ROAD_START_LINE,
  COLOR_TREE_1,
  COLOR_TREE_2,
  ROAD_DATA_LR_UD,
} from "../../../utils/const";
import { leapBoard, Vec2 } from "../../../utils/util";

export function createRoadObjects(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
) {
  const roadObjects: RoadObject[] = [];

  for (let i = 0; i < 90; i++) {
    const tex = "bush";
    const tree: RoadObject = {
      image: scene.add.image(0, 0, tex).setOrigin(0.5, 0.5),
      boardIndex: 80 + i * 90,
      side: i % 2 === 0 ? "left" : "right",
      // side: -3,
      scale: { x: 2.8, y: 3.3 },
    };

    tree.image.setTint(Math.random() > 0.5 ? COLOR_TREE_1 : COLOR_TREE_2);
    tree.image.setAngle(Math.random() > 0.5 ? 0 : 5);
    roadObjects.push(tree);
    container.add(tree.image);
  }
  return roadObjects;
}

export function moveRoadObjects(
  obj: RoadObject,
  scale: { x: number; y: number },
  rate: number,
  ux: number,
  uy: number,
  uw: number,
  alpha: number
) {
  obj.image.visible = true;
  const scaleRateX = rate * scale.x;
  const scaleRateY = rate * scale.y;

  obj.image.x = obj.side === "left" ? ux - uw * 0.1 : ux + uw * 1.1;
  obj.image.setScale(scaleRateX, scaleRateY);

  obj.image.y = uy;
  obj.image.setAlpha(alpha);
}

export function drawRoadGraphics(
  g: Phaser.GameObjects.Graphics,
  gameLevel: GameLevelProps,
  playerCar: Car,
  index: number,
  roadData: RoadData,
  roadPosData: RoadPosData
) {
  const alpha = Math.min(
    0.4,
    Math.max(0.13, 1 - (index / roadData.board) * 0.9)
  );
  drawRoadField(g, gameLevel, roadPosData, alpha);
  if (gameLevel.mode !== "free") {
    drawStartLine(g, playerCar, index, roadData, roadPosData, alpha);
  }
  drawLineOuter(g, gameLevel, playerCar, index, roadPosData, alpha);
  drawLineInner(g, gameLevel, playerCar, index, roadPosData, alpha);
}

function drawRoadField(
  g: Phaser.GameObjects.Graphics,
  gameLevel: GameLevelProps,
  p: RoadPosData,
  alpha: number
) {
  const roadPoints: Vec2[] = [
    new Vec2(p.ux, p.uy),
    new Vec2(p.ux + p.uw, p.uy),
    new Vec2(p.bx + p.bw, p.by),
    new Vec2(p.bx, p.by),
  ];
  let al = alpha;
  if (gameLevel.isAuto) {
    al = 0;
  }

  drawPolygon(g, roadPoints, COLOR_ROAD, al);
}
function drawStartLine(
  g: Phaser.GameObjects.Graphics,
  playerCar: Car,
  index: number,
  roadData: RoadData,
  p: RoadPosData,
  alpha: number
) {
  const point = Math.trunc(playerCar.y + index) % roadData.cMax;
  if (point === 20 || point === 21 || point === 22) {
    const lineLRPoints: Vec2[] = [
      new Vec2(p.ux + p.uw * 0, p.uy),
      new Vec2(p.ux + p.uw * 1, p.uy),
      new Vec2(p.bx + p.bw * 1, p.by),
      new Vec2(p.bx + p.uw * 0, p.by),
    ];
    drawPolygon(
      g,
      lineLRPoints,
      COLOR_ROAD_START_LINE,
      Math.min(1, alpha * 1.2)
    );
  }
}
function drawLineOuter(
  g: Phaser.GameObjects.Graphics,
  gameLevel: GameLevelProps,
  playerCar: Car,
  index: number,
  p: RoadPosData,
  alpha: number
) {
  let al = alpha * 0.6;
  if (gameLevel.name === "free") {
    al = 0.6;
    if (Math.trunc(playerCar.y + index) % 200 <= 90) {
      al = 0.85;
    }
  } else if (gameLevel.name === "ghost_2") {
    al = alpha;
    if (Math.trunc(playerCar.y + index) % 100 <= 50) {
      al = alpha * 0.9;
    }
  } else if (gameLevel.isAuto) {
    if (Math.trunc(playerCar.y + index) % 60 <= 30) {
      al = alpha * 0.9;
    }
  } else {
    if (Math.trunc(playerCar.y + index) % 60 <= 8) {
      al = alpha * 0.7;
    }
  }

  let data = [
    [0, 0.1, 0.1, 0],
    [0.9, 1, 1, 0.9],
  ];

  if (gameLevel.name === "free") {
    data = [
      [0, 0.02, 0.02, 0],
      [0.98, 1, 1, 0.98],
    ];
  }
  if (gameLevel.isAuto) {
    data = [
      [0.3, 0.35, 0.35, 0.3],
      [0.65, 0.7, 0.7, 0.65],
    ];
  }

  data.forEach((d) => {
    const lineLRPoints: Vec2[] = [
      new Vec2(p.ux + p.uw * d[0], p.uy),
      new Vec2(p.ux + p.uw * d[1], p.uy),
      new Vec2(p.bx + p.bw * d[2], p.by),
      new Vec2(p.bx + p.uw * d[3], p.by),
    ];
    if (gameLevel.name === "free") {
      drawPolygon(g, lineLRPoints, 0xaadaff, al);
    } else {
      drawPolygon(g, lineLRPoints, COLOR_ROAD_LINE_OUTER, al);
    }
  });
}

function drawLineInner(
  g: Phaser.GameObjects.Graphics,
  gamelevel: GameLevelProps,
  playerCar: Car,
  index: number,
  p: RoadPosData,
  alpha: number
) {
  if (Math.trunc(playerCar.y + index) % 120 <= 60) {
    // 道路内のライン
    [
      // [0.249, 0.26, 0.26, 0.24],
      [0.499, 0.51, 0.51, 0.49],
      // [0.749, 0.76, 0.76, 0.74],
    ].forEach((d) => {
      const lineLRPoints: Vec2[] = [
        new Vec2(p.ux + p.uw * d[0], p.uy),
        new Vec2(p.ux + p.uw * d[1], p.uy),
        new Vec2(p.bx + p.bw * d[2], p.by),
        new Vec2(p.bx + p.uw * d[3], p.by),
      ];

      let al = alpha;
      if (gamelevel.isAuto) {
        al = 0;
      }
      drawPolygon(g, lineLRPoints, COLOR_ROAD_LINE_INNER, al * 0.95);
    });
  }
}

function drawPolygon(
  g: Phaser.GameObjects.Graphics,
  points: Phaser.Math.Vector2[],
  color: number,
  alpha: number
) {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);

  for (let j = 1; j < points.length; j++) {
    g.lineTo(points[j].x, points[j].y);
  }
  g.closePath();
  g.fillPath();
  g.setDepth(999);
}

export function createRoadBasePosData(
  playerCar: Car,
  roadData: RoadData,
  courseData: CourseData,
  dataBoard: BoardData
) {
  const board = roadData.board;
  const cMax = roadData.cMax;

  let di = 0;
  let ud = 0;
  const boardX: number[] = [];
  const boardUd: number[] = [];

  for (let i = 0; i < board; i++) {
    di += courseData.curve[Math.trunc(playerCar.y + i) % cMax];
    ud += courseData.updown[Math.trunc(playerCar.y + i) % cMax];
    boardX.push(400 - (dataBoard.w[i] * playerCar.x) / 800 + di / 2);
    boardUd.push(ud / 30);
  }

  let horizon = 230 + Math.trunc(ud / 18);

  return { horizon, boardX, boardUd };
}

export function getRoadData(level: GameLevelProps): RoadData {
  const dataLR = ROAD_DATA_LR_UD[level.name].DATA_LR;
  const dataUD = ROAD_DATA_LR_UD[level.name].DATA_UD;
  const cLen = dataLR.length;
  const board = 120;
  const cMax = board * cLen;
  const enemyNum = ROAD_DATA_LR_UD[level.name].ENEMY_NUM;

  return {
    dataLR,
    dataUD,
    cLen,
    board,
    cMax,
    enemyNum,
  };
}

export function calcRoadPosData(
  index: number,
  sy: { val: number },
  roadBasePosData: {
    horizon: number;
    boardX: number[];
    boardUd: number[];
  },
  dataBoard: BoardData
): RoadPosData {
  const horizon = roadBasePosData.horizon;
  const boardX = roadBasePosData.boardX;
  const boardUd = roadBasePosData.boardUd;

  let ux = boardX[index];
  let uy = sy.val - dataBoard.ud[index] * boardUd[index];
  let uw = dataBoard.w[index];

  sy.val = sy.val + (dataBoard.h[index] * (600 - horizon)) / 190;
  let bx = boardX[index - 1];
  let by = sy.val - dataBoard.ud[index - 1] * boardUd[index - 1];
  let bw = dataBoard.w[index - 1];

  return { ux, uy, uw, bx, by, bw };
}

export function makeCourseData(roadData: RoadData): CourseData {
  const cLen = roadData.cLen;
  const cMax = roadData.cMax;
  const dataLR = roadData.dataLR;
  const dataUD = roadData.dataUD;
  const boad = roadData.board;

  const curve = [];
  const updown = [];
  const objectLeft = [];
  const objectRight = [];

  for (let i = 0; i < cMax; i++) {
    curve.push(0);
    updown.push(0);
    objectLeft.push(0);
    objectRight.push(0);
  }
  for (let i = 0; i < cLen; i++) {
    const lr1 = dataLR[i];
    const lr2 = dataLR[(i + 1) % cLen];
    const ud1 = dataUD[i];
    const ud2 = dataUD[(i + 1) % cLen];
    for (let j = 0; j < boad; j++) {
      const pos = j + boad * i;
      curve[pos] = leapBoard(lr1, lr2, j, boad);
      updown[pos] = leapBoard(ud1, ud2, j, boad);

      if (j === 60) {
        objectRight[pos] = 1;
      }
      if (j % 12 === 0) {
        objectLeft[pos] = 2;
      }
      if (j % 20 === 0) {
        objectLeft[pos] = 3;
      }
      if (j % 12 === 6) {
        objectLeft[pos] = 9;
      }
    }
  }
  return {
    curve,
    updown,
    objectLeft,
    objectRight,
  };
}
