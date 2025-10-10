import type { RoadObject } from "../../../types";
import { COLOR_TREE_1, COLOR_TREE_2 } from "../../../utils/const";

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
