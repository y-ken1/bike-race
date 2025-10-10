import { Scene } from "phaser";
// import WebFont from "webfontloader";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.image(512, 384, "background");
  }

  preload() {
    this.add
      .text(this.cameras.main.width - 20, 20, "Bike Race", {
        fontSize: "16px",
        color: "#888888",
        fontFamily: "Courier New, monospace",
        fontStyle: "italic",
      })
      .setOrigin(1, 0)
      .setAlpha(0.8);

    this.add
      .text(
        this.cameras.main.centerX - 70,
        this.cameras.main.centerY,
        "loading",
        {
          fontSize: "20px",
          color: "#cccccc",
          fontFamily: "Courier New, monospace",
        }
      )
      .setOrigin(0, 0.5)
      .setAlpha(0.8);

    const dots: Phaser.GameObjects.Arc[] = [];
    for (let i = 0; i < 3; i++) {
      const dot = this.add
        .circle(
          this.cameras.main.centerX + 30 + i * 10, // 横に並べる
          this.cameras.main.centerY + 5,
          2,
          0xcccccc
        )
        .setAlpha(0.3);
      dots.push(dot);

      this.tweens.add({
        targets: dot,
        alpha: { from: 0.3, to: 0.7 },
        duration: 550,
        delay: i * 120, // ずらして点滅
        yoyo: true,
        repeat: -1,
      });
    }

    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("/bike-race/assets/");

    this.load.bitmapFont(
      "oldschool-black",
      "fonts/charmap-oldschool_black.png",
      "fonts/oldschool.fnt"
    );

    this.load.bitmapFont(
      "oldschool-white",
      "fonts/charmap-oldschool_white.png",
      "fonts/oldschool.fnt"
    );
    this.load.image("clock-bg", "images/clock-bg.png");
    this.load.image("game-wrapper", "images/game_wrapper.png");
    this.load.image("bg1", "images/bg1.jpg");
    this.load.image("tower", "images/tower.png");
    this.load.image("grass", "images/grass.png");
    this.load.image("bush", "images/bush.png");
    this.load.image("car03", "images/car03.png");
    this.load.image("smoke", "images/smoke.png");
    this.load.image("flare", "images/flare.png");

    this.load.audio("ready", "sounds/ready.mp3");
    this.load.audio("321", "sounds/321.mp3");
    this.load.audio("go", "sounds/go.mp3");
    this.load.audio("bikeRun", "sounds/bike.mp3");
    this.load.audio("bikeBreak", "sounds/bikeBreak.mp3");
    this.load.audio("bikeStart", "sounds/bikeStart.mp3");
    this.load.audio("lap2", "sounds/lap2.mp3");
    this.load.audio("lapFinal", "sounds/lapFinal.mp3");
    this.load.audio("goal", "sounds/goal.mp3");
    this.load.audio("goal-new-record", "sounds/goal-new-record.mp3");
    this.load.audio("contact", "sounds/contact.mp3");
  }
  create() {
    this.scene.start("ClockScene");
    // this.scene.start("MainScene", { gameLevel: "free" });
  }
}
