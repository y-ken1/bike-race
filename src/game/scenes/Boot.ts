import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.image("background", "assets/bg.png");
  }

  create() {
    if (this.input.manager.pointersTotal < 2) {
      this.input.addPointer(1);
    }
    this.scene.start("Preloader");
  }
}
