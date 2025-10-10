export class HandleButton {
  private scene: Phaser.Scene;
  private centerX: number;
  private radius: number;
  private steer: number = 0;
  private gHandles: Phaser.GameObjects.Graphics[];

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number = 60) {
    this.scene = scene;
    this.centerX = x;
    this.radius = radius;

    // outer
    scene.add
      .circle(x, y, radius * 1.2, 0x483808)
      .setDepth(9999)
      .setAlpha(0.1);

    const _g = scene.add.graphics({ x: x, y: y }).setDepth(999999);
    _g.lineStyle(11, 0x555555, 0.5); // 線の太さと色
    _g.beginPath();

    const _s = Phaser.Math.DegToRad(0);
    const _e = Phaser.Math.DegToRad(360);
    _g.arc(0, 0, radius, _s, _e, false);
    _g.strokePath();

    this.gHandles = [];
    for (let d of [
      [-50, 50],
      [-230, -130],
    ]) {
      const g = scene.add.graphics({ x: x, y: y }).setDepth(999999);
      g.lineStyle(12, 0x552222, 0.5);
      g.beginPath();

      const r = radius * 1.05;
      const s = Phaser.Math.DegToRad(d[0]);
      const e = Phaser.Math.DegToRad(d[1]);
      g.arc(0, 0, r, s, e, false);
      g.strokePath();
      this.gHandles.push(g);
    }

    // innerハンドル（動く）
    scene.add
      .circle(x, y, radius * 0.77, 0x777777)
      .setDepth(9999)
      .setAlpha(0.3);

    const rect = scene.add
      .rectangle(x, y, radius * 3.8, radius * 2)
      .setDepth(99999999)
      .setInteractive({
        useHandCursor: true,
      });

    // outerにハンドラ
    rect.on("pointerdown", (p: Phaser.Input.Pointer) => this.updateSteer(p.x));
    rect.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.updateSteer(p.x);
    });
    this.scene.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (p.x <= this.scene.cameras.main.width / 2) {
        this.resetSteer();
      }
    });
  }

  private updateSteer(pointerX: number) {
    // outer中心からの横距離
    let dx = Phaser.Math.Clamp(
      pointerX - this.centerX,
      -this.radius,
      this.radius
    );

    const step = (this.radius * 2) / 4;
    this.steer = Math.round(dx / step);
    dx = this.steer * step;

    // // innerを動かす
    // this.inner.x = this.centerX + dx * 0.55;
    this.emitAndRotation(dx);
  }

  private resetSteer() {
    // this.inner.x = this.centerX;
    this.steer = 0;
    this.emitAndRotation(0);
  }

  private emitAndRotation(dx: number) {
    this.gHandles.forEach((g) => g.setRotation(Phaser.Math.DegToRad(dx * 1.2)));
    this.scene.events.emit("steerChanged", this.steer);
  }

  // public getSteer(): number {
  //   return this.steer;
  // }
}
