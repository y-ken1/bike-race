import type { GameLevel } from "../../types";

export const GameLevelConfig: GameLevel = {
  easy: { name: "easy", mode: "race", isAuto: false },
  hard: { name: "hard", mode: "race", isAuto: false },
  free: { name: "free", mode: "free", isAuto: false },
  auto: { name: "auto", mode: "free", isAuto: true },
  ghost_1: { name: "ghost_1", mode: "ghost", isAuto: false },
  ghost_2: { name: "ghost_2", mode: "ghost", isAuto: false },
};
