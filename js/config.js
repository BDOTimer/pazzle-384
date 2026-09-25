const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
};

export const APP_CONFIG = deepFreeze({
  appName: "ELITE // ZX REMASTER",
  version: "1.0.0",
  renderer: {
    fieldOfView: 72,
    near: 0.1,
    far: 5000,
    resolutionScale: 0.66,
    background: 0x05070d,
    fogNear: 650,
    fogFar: 2600
  },
  world: {
    boundary: 2200,
    dustCount: 900,
    starCount: 1300,
    meteorCount: 30,
    dockDistance: 72,
    safeSpeed: 82
  },
  flight: {
    acceleration: 36,
    braking: 58,
    turnRate: 1.18,
    pitchRate: 0.88,
    rollRate: 1.5,
    mouseSensitivity: 0.0022,
    boostMultiplier: 2.15,
    fireCooldown: 0.19,
    laserSpeed: 520,
    enemyLaserSpeed: 300,
    maxSubSteps: 5,
    fixedStep: 1 / 60
  },
  economy: {
    startCredits: 10000,
    fuelPrice: 2,
    repairPrice: 4,
    shieldPrice: 3,
    illegalRisk: 0.38
  },
  hyperspace: {
    fuelCost: 24,
    baseDistance: 4200
  },
  saveInterval: 15000
});

export const STORAGE_CONFIG = deepFreeze({
  key: "elite-zx-remaster-save-v1",
  version: 1
});

export const SPECTRUM = deepFreeze({
  black: "#08090c",
  blue: "#0084ff",
  cyan: "#00d5df",
  green: "#00c957",
  yellow: "#ffe14a",
  red: "#ff3b30",
  magenta: "#ed2f91",
  white: "#f4f4ed",
  gray: "#7b8491"
});
