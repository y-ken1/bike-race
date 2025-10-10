export function createKeyEvent(
  scene: Phaser.Scene,
  callbackLeft: () => void,
  callbackRight: () => void
) {
  scene.input.keyboard?.on("keydown-LEFT", (event: KeyboardEvent) => {
    if (!event.repeat) {
      callbackLeft();
    }
  });

  scene.input.keyboard?.on("keydown-RIGHT", (event: KeyboardEvent) => {
    if (!event.repeat) {
      callbackRight();
    }
  });
  scene.input.keyboard?.on("keydown-UP", (_: KeyboardEvent) => {
    scene.events.emit("speedChanged", 0.9 * 3);
  });
  scene.input.keyboard?.on("keydown-DOWN", (_: KeyboardEvent) => {
    scene.events.emit("speedChanged", -1 * 1.5);
  });
}
