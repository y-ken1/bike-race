export class MyGamepad {
  pad!: Phaser.Input.Gamepad.Gamepad | undefined;
  scene: Phaser.Scene;
  timerSpeedUp: number;
  timerSpeedDown: number;

  interval: number;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.timerSpeedUp = 0;
    this.timerSpeedDown = 0;

    this.interval = 0.01;
    this.initGamePad();
  }
  private initGamePad() {
    if (this.scene.input.gamepad?.total === 0) {
      this.scene.input.gamepad?.once(
        "connected",
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          this.pad = pad;
        }
      );
    } else {
      this.pad = this.scene.input.gamepad?.pad1;
    }
  }
  update(_: number, delta: number) {
    if (this.pad) {
      this.timerSpeedUp += delta / 1000;
      this.timerSpeedDown += delta / 1000;
      if (this.pad.buttons[0].pressed && this.timerSpeedUp > this.interval) {
        this.scene.events.emit("speedChanged", 1.8);
        this.timerSpeedUp = 0;
      }

      if (this.pad.buttons[1].pressed && this.timerSpeedDown > this.interval) {
        this.scene.events.emit("speedChanged", -0.6);
        this.timerSpeedDown = 0;
      }

      const _x = this.pad.axes.length > 0 ? this.pad.axes[0].getValue() : 0;
      const steer = Math.round(_x * 2);
      this.scene.events.emit("steerChanged", steer);
    }
  }
}
