import type { Car, GameLevel } from "../../../types";

export function createCars(
  scene: Phaser.Scene,
  x: number,
  y: number,
  container: Phaser.GameObjects.Container,
  cMax: number,
  enemyNum: number,
  gameLevel: GameLevel
) {
  const cars: Car[] = [];

  for (let i = 0; i < enemyNum + 1; i++) {
    // const iamgeX = this.CX + 67;
    // const imageY = 580;
    const carImage = scene.add
      .image(x, y, "car03")
      .setOrigin(0.5, 1)
      .setDepth(9999);

    // const randX = Phaser.Math.Between(90, 700);
    const col = (i - 1) % 2;
    const row = Math.floor((i - 1) / 3);
    const randX = 70 + col * 146;
    // const randY = Phaser.Math.Between(100, CMAX - 300);
    const randY = 390 + row * (gameLevel === "easy" ? 390 : 200) + i * 168;
    // const randSp = Phaser.Math.Between(100, MAX_SPEED * 0.6);
    // const randSp = Phaser.Math.Between(20, 30);
    const randSp = (100 * randY) / cMax;
    const randCurveTiming = Phaser.Math.Between(10, 580);
    const randAveSp = [
      Phaser.Math.Between(80, 150),
      Phaser.Math.Between(55, 165),
      Phaser.Math.Between(65, 190),
    ];
    // const randX = 400;
    // const randY = 70;
    // const randSp = 100;
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
      mileage: 0,
    });

    carImage.setScale(0.4);
    carImage.setAlpha(1);
    if (i !== 0) {
      if (gameLevel === "free") {
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
    if (gameLevel === "free") {
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
