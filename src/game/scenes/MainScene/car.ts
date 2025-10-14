import type {
  BoardData,
  Car,
  GameLevelProps,
  RoadPosData,
} from "../../../types";

export function createCars(
  scene: Phaser.Scene,
  x: number,
  y: number,
  container: Phaser.GameObjects.Container,
  cMax: number,
  enemyNum: number,
  gameLevel: GameLevelProps
) {
  const cars: Car[] = [];

  for (let i = 0; i < enemyNum + 1; i++) {
    const carImage = scene.add
      .image(x, y, "car03")
      .setOrigin(0.5, 1)
      .setDepth(9999);

    const col = (i - 1) % 2;
    const row = Math.floor((i - 1) / 3);
    const randX = 70 + col * 146;
    const randY = 390 + row * (gameLevel.name === "easy" ? 390 : 200) + i * 168;
    const randSp = (100 * randY) / cMax;
    const randCurveTiming = Phaser.Math.Between(300, 680);
    const randAveSp = [
      Phaser.Math.Between(80, 150),
      Phaser.Math.Between(55, 165),
      Phaser.Math.Between(65, 190),
    ];

    cars.push({
      id: i,
      isPlayer: i === 0 ? true : false,
      image: carImage,
      x: i === 0 ? 400 : randX,
      y: i === 0 ? 0 : randY,
      lr: 0,
      speed: i === 0 ? 0 : randSp,
      prevSpeed: 0,
      averageSpeed: i === 0 ? [0, 0, 0] : randAveSp,
      curveTiming: i === 0 ? 0 : randCurveTiming,
      curveDuration: 0,
      mileage: 0,
    });

    carImage.setScale(0.4);
    carImage.setAlpha(1);
    if (i !== 0) {
      if (gameLevel.name === "free") {
        const col = Phaser.Utils.Array.GetRandom([
          0x18ffff, 0x78ffff, 0xa8ffff,
        ]);
        carImage.setTint(col);
      } else {
        carImage.setTint(0x88ffff);
      }
      carImage.setAlpha(0.85);
    }
    container.add(carImage);

    if (gameLevel.name === "free") {
      cars
        .filter((e) => !e.isPlayer)
        .forEach((e) => {
          e.y = Math.max(0, 80 + Math.floor(e.id / 4) * 340);
          e.x = -150 + (e.id % 10) * 310;
          e.speed = 100;
          e.averageSpeed[0] = 170;
          e.averageSpeed[1] = 170;
          e.averageSpeed[2] = 190;
        });
    }
  }

  return cars;
}
export function execGameoverPlayerCarTweens(
  scene: Phaser.Scene,
  playerCar: Car
) {
  scene.tweens.add({
    targets: playerCar.image,
    scale: 0,
    alpha: 0,
    angle: 15,
    y: 190,
    duration: 400,
  });
}
export function initCarForGhostMode(cars: Car[]) {
  cars[1].x = cars[0].x;
  cars[1].y = cars[0].y;
  cars[1].image.setOrigin(cars[0].image.originX, cars[0].image.originY);
  cars[1].image.setScale(
    cars[0].image.scaleX * 0.98,
    cars[0].image.scaleY * 0.98
  );
  cars[1].image.setPosition(cars[0].image.x, cars[0].image.y);
  cars[1].image.setTint(0xddffff);
  cars[1].image.setAlpha(0.7);
}
export function initCarForAutoMode(cars: Car[]) {
  for (let car of cars) {
    car.x = 400 + 11;
  }
}

export function isCarOutOfRoad(car: Car) {
  return Math.abs(car.x - 400) > 355;
}

export function getEnemyCars(cars: Car[]) {
  const enemyCars = cars.filter((c) => !c.isPlayer);
  return enemyCars;
}
// 範囲外の車の表示非表示処理
export function hideEnemyCarsOutsideView(
  playerCar: Car,
  enemyCars: Car[],
  gameLevel: GameLevelProps,
  drawnEnemyCarIds: number[],
  dataBoard: BoardData,
  p: RoadPosData
) {
  // 描画範囲外の車
  for (let car of enemyCars) {
    if (!drawnEnemyCarIds.includes(car.id)) {
      if (gameLevel.mode === "ghost") {
        if (Math.abs(playerCar.y - car.y) > 240) {
          car.image.visible = false;
        } else {
          car.image.x = p.ux + (car.x * dataBoard.w[0]) / 800;
        }
      } else {
        car.image.visible = false;
      }
    }
  }
}
export function changeEnemyLR(playerCar: Car, enemyCar: Car) {
  if (enemyCar.x < playerCar.x) {
    enemyCar.lr += Phaser.Math.Between(-1, 3);
  } else {
    enemyCar.lr += Phaser.Math.Between(-3, 1);
  }

  if (enemyCar.lr < -3) {
    enemyCar.lr = -3;
  } else if (enemyCar.lr > 3) {
    enemyCar.lr = 3;
  }
}
