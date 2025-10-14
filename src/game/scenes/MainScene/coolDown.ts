import type {
  CooldownActionKey,
  LastCooldownActionTimes,
} from "../../../types";

const cooldownDuration: Record<CooldownActionKey, number> = {
  slowDownWhenReady: 700,
  slowDownWhenRunning: 1000,
  slowDownEnemy: 1000,
};

export function setUpLastCoolDownActionTimes(): LastCooldownActionTimes {
  return {
    slowDownWhenReady: 0,
    slowDownWhenRunning: 0,
    slowDownEnemy: 0,
  };
}

export function tryAction(
  now: number,
  key: CooldownActionKey,
  lastActionTimes: LastCooldownActionTimes,
  doAction: () => void
) {
  const lastActionTime = lastActionTimes[key];
  if (now - lastActionTime >= cooldownDuration[key]) {
    doAction();
    lastActionTimes[key] = now;
  }
}
