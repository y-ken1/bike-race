import type { GameState } from "../../types";

const ARC_ANGLE_FROM = Phaser.Math.DegToRad(140);
const ARC_ANGLE_TO = Phaser.Math.DegToRad(380);
const ARC_ANGLE = Math.abs(ARC_ANGLE_FROM - ARC_ANGLE_TO);

export class SpeedMeter {
  outerArc: Phaser.GameObjects.Graphics;
  innerArc: Phaser.GameObjects.Graphics;
  neadle: Phaser.GameObjects.Graphics;
  neadleLength: number;
  text: Phaser.GameObjects.BitmapText;
  bgRect: Phaser.GameObjects.Rectangle;
  txtKM: Phaser.GameObjects.BitmapText;
  constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
    this.neadleLength = radius;
    const arc = scene.add.graphics({ x: x, y: y }).setDepth(999999);
    arc.lineStyle(3, 0x555555, 0.5); // 線の太さと色
    arc.beginPath();

    const _s = Phaser.Math.DegToRad(ARC_ANGLE_TO);
    const _e = Phaser.Math.DegToRad(ARC_ANGLE_TO);
    arc.arc(0, 0, radius, _s, _e, false);
    arc.strokePath();

    this.outerArc = scene.add.graphics({ x: x, y: y }).setData(999999);
    this.innerArc = scene.add.graphics({ x: x, y: y }).setData(999999);
    this.neadle = scene.add.graphics({ x: x, y: y }).setData(999999);

    this.bgRect = scene.add.rectangle(
      x + 3,
      y + 4,
      radius * 2 + 8 * 2 + 10,
      radius * 2 + 8 * 3 - 4,
      0x000000,
      0.06
    );
    this.txtKM = scene.add
      .bitmapText(
        x + this.neadleLength + 10,
        y + 27,
        "oldschool-black",
        "km/h",
        11.5
      )
      .setAlpha(0.7)
      .setScale(0.65, 1)
      .setOrigin(1, 0.5);

    this.text = scene.add
      .bitmapText(
        x + this.neadleLength - 20,
        y + 26,
        "oldschool-black",
        "0",
        11.5
      )
      .setAlpha(0.85)
      .setOrigin(1, 0.5);
  }
  hide() {
    this.innerArc.setVisible(false);
    this.outerArc.setVisible(false);
    this.neadle.setVisible(false);
    this.text.setVisible(false);
    this.bgRect.setVisible(false);
    this.txtKM.setVisible(false);
  }
  setSpeed(speed: number, maxSpeed: number, gameState: GameState) {
    const rate = (ARC_ANGLE * speed) / maxSpeed;
    const angle = ARC_ANGLE_FROM + rate;
    this.drawOuterArc();
    this.drawInnerArc(angle, rate);
    this.drawNeadle(angle);
    if (gameState === "ready") {
      this.text.text = `--`;
    } else {
      this.text.text = `${(0.6 * speed).toFixed(0)}`;
    }
  }
  drawNeadle(angle: number) {
    this.neadle.clear();
    this.neadle.lineStyle(2, 0xaa8585);

    // 線を描く（中心から右方向に伸ばす）
    this.neadle.beginPath();
    this.neadle.moveTo(0, 0);
    this.neadle.lineTo(
      Math.cos(angle) * this.neadleLength,
      Math.sin(angle) * this.neadleLength
    );
    this.neadle.strokePath();
  }

  drawInnerArc(angle: number, rate: number) {
    this.innerArc.clear();
    this.innerArc.fillStyle(0xaa3434, (0.33 * rate) / ARC_ANGLE);
    this.innerArc.lineStyle(2, 0xffffff);

    const s = ARC_ANGLE_FROM;
    const e = angle;

    this.innerArc.beginPath();
    this.innerArc.moveTo(0, 0);
    this.innerArc.arc(0, 0, this.neadleLength * 0.8, s, e, false);
    this.innerArc.closePath();
    this.innerArc.fillPath();
  }
  drawOuterArc() {
    this.outerArc.clear();
    this.outerArc.fillStyle(0xccccff, 0.51);
    this.outerArc.lineStyle(2, 0x888888);

    const s = ARC_ANGLE_FROM;
    const e = ARC_ANGLE_TO;

    this.outerArc.beginPath();
    this.outerArc.moveTo(0, 0);
    this.outerArc.arc(0, 0, this.neadleLength, s, e, false);
    this.outerArc.closePath();
    this.outerArc.fillPath();
  }
}
