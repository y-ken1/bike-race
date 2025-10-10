export class ActionButton extends Phaser.GameObjects.Rectangle {
  scene: Phaser.Scene;
  isPress: boolean;
  timer: number;
  interval: number;
  type: "Break" | "Accele";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: "Break" | "Accele"
  ) {
    super(scene, x, y, 65, 60, 0xffffff);
    this.scene = scene;
    this.setDepth(9999999);
    this.isPress = false;
    this.type = type;
    this.timer = 0;
    this.interval = 0.01;
    this.init(scene, x, y, type);
  }
  init(scene: Phaser.Scene, x: number, y: number, type: "Break" | "Accele") {
    this.isPress = false;
    this.timer = 0;
    let label = "A";
    let color = 0xba9999;
    if (type === "Break") {
      label = "B";
      color = 0xababab;
    }

    const btnOuter = scene.add.circle(x, y, 32, 0x483808, 0.95);
    const btnInner = scene.add.circle(x, y, 25, color);
    const text = scene.add
      .bitmapText(x, y - 3, "oldschool-black", label, 23)
      .setScale(1.15, 1)
      .setAlpha(0.3);

    text.setOrigin(0.5);

    btnOuter.setDepth(9999);
    btnInner.setDepth(9999);
    text.setDepth(9999);

    this.setInteractive({ useHandCursor: true });
    this.on("pointerdown", () => {
      if (this.scene.scene.key === "ClockScene") {
        const eventName = this.type === "Accele" ? "downA" : "downB";
        this.scene.events.emit(eventName);
        return;
      }

      btnInner.setAlpha(0.75);
      this.isPress = true;
      this.timer = 0;
      // this.scene.events.emit("speedChanged", this.type === "Break" ? -1 : 1);
    });
    this.on("pointerup", () => {
      btnInner.setAlpha(1); // 離したときに元に戻す
      this.isPress = false;
    });

    this.on("pointerout", () => {
      btnInner.setAlpha(1); // 外にカーソルが出たときも戻す（スマホ対応）
      this.isPress = false;
    });

    scene.events.on("update", this.update, this);
  }

  update(_: number, delta: number) {
    if (!this.isPress) {
      return;
    }
    this.timer += delta / 1000;
    if (this.timer >= this.interval) {
      this.scene.events.emit(
        "speedChanged",
        this.type === "Break" ? -0.6 : 1.8
      );
      this.timer = 0;
    }
  }
}
