import type { ClockGameButtonHandlers } from "../../types";
import { isAvailableSound, toggleAvailableSound } from "../main";
import { ActionButton } from "./actionButton";
import { createClockGameButton } from "./clockGameButton";
import { createFullScreenButton as createFullScreenButtonSub } from "./fullScreenButton";
import { createToggleButton } from "./toggleButton";

const PositionData = {
  FULL: { x: 589, y: 30 },
  SOUND: { x: 589, y: 85 },
  ATTACK: {
    RIGHT_HIGH: (scene: Phaser.Scene) => {
      return { x: scene.cameras.main.width - 52, y: 205 };
    },

    RIGHT_LOW: (scene: Phaser.Scene) => {
      return { x: scene.cameras.main.width - 52, y: 290 };
    },
  },

  CLOCK_GAME: {
    TIME: (scene: Phaser.Scene) => {
      return {
        x: scene.cameras.main.centerX - 70,
        y: 344,
      };
    },
    reset: (scene: Phaser.Scene) => {
      return {
        x: scene.cameras.main.centerX + 70,
        y: 344,
      };
    },
    EASY: (_scene: Phaser.Scene) => {
      return { x: 51, y: 35 };
    },

    HARD: (_scene: Phaser.Scene) => {
      return { x: 51, y: 78 };
    },
    GHOST_1: (_scene: Phaser.Scene) => {
      return { x: 51, y: 121 };
    },
    GHOST_2: (_scene: Phaser.Scene) => {
      return { x: 51, y: 164 };
    },
    FREE: (_scene: Phaser.Scene) => {
      return { x: 51, y: 207 };
    },
  },
};

export function createAttackButtons(scene: Phaser.Scene) {
  new ActionButton(
    scene,
    PositionData.ATTACK.RIGHT_HIGH(scene).x,
    PositionData.ATTACK.RIGHT_HIGH(scene).y,
    "Break"
  );

  new ActionButton(
    scene,
    PositionData.ATTACK.RIGHT_LOW(scene).x,
    PositionData.ATTACK.RIGHT_LOW(scene).y,
    "Accele"
  );
}

export function createAttackKeyEvent(scene: Phaser.Scene) {
  scene.input.keyboard?.on("keydown-W", (event: KeyboardEvent) => {
    if (!event.repeat) {
    }
  });

  scene.input.keyboard?.on("keydown-S", (event: KeyboardEvent) => {
    if (!event.repeat) {
    }
  });

  scene.input.keyboard?.on("keydown-UP", (event: KeyboardEvent) => {
    if (!event.repeat) {
    }
  });

  scene.input.keyboard?.on("keydown-DOWN", (event: KeyboardEvent) => {
    if (!event.repeat) {
    }
  });
}

export function createSoundButton(scene: Phaser.Scene) {
  createToggleButton(
    scene,
    PositionData.SOUND.x,
    PositionData.SOUND.y,
    "SOUND",
    () => toggleAvailableSound(scene),
    isAvailableSound
  );
}

export function createFullScreenButton(scene: Phaser.Scene) {
  createFullScreenButtonSub(scene, PositionData.FULL.x, PositionData.FULL.y);
}

export function createClockGameButtons(
  scene: Phaser.Scene,
  handleClockGameButton: ClockGameButtonHandlers
) {
  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.TIME(scene).x,
    PositionData.CLOCK_GAME.TIME(scene).y,
    "TIME",
    handleClockGameButton.TIME
  );
  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.reset(scene).x,
    PositionData.CLOCK_GAME.reset(scene).y,
    "reset",
    handleClockGameButton.reset
  );

  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.EASY(scene).x,
    PositionData.CLOCK_GAME.EASY(scene).y,
    "easy",
    handleClockGameButton.easy
  );

  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.HARD(scene).x,
    PositionData.CLOCK_GAME.HARD(scene).y,
    "hard",
    handleClockGameButton.hard
  );

  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.GHOST_1(scene).x,
    PositionData.CLOCK_GAME.GHOST_1(scene).y,
    "ghost_1",
    handleClockGameButton.ghost_1
  );
  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.GHOST_2(scene).x,
    PositionData.CLOCK_GAME.GHOST_2(scene).y,
    "ghost_2",
    handleClockGameButton.ghost_2
  );
  createClockGameButton(
    scene,
    PositionData.CLOCK_GAME.FREE(scene).x,
    PositionData.CLOCK_GAME.FREE(scene).y,
    "free",
    handleClockGameButton.free
  );
}
