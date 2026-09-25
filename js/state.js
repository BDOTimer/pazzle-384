import { APP_CONFIG } from "./config.js";
import { createLoadout, getShipType } from "./data/shipTypes.js";

export const ACTIONS = Object.freeze({
  NEW_GAME: "NEW_GAME",
  LOAD_SAVE: "LOAD_SAVE",
  CLEAR_RUN: "CLEAR_RUN",
  SET_LOCATION: "SET_LOCATION",
  SET_TARGET: "SET_TARGET",
  HYPERSPACE: "HYPERSPACE",
  DAMAGE: "DAMAGE",
  SET_STATUS: "SET_STATUS",
  REPAIR_AND_RECHARGE: "REPAIR_AND_RECHARGE",
  BUY_FUEL: "BUY_FUEL",
  BUY_CARGO: "BUY_CARGO",
  SELL_CARGO: "SELL_CARGO",
  BUY_UPGRADE: "BUY_UPGRADE",
  SELL_UPGRADE: "SELL_UPGRADE",
  CHANGE_SHIP: "CHANGE_SHIP",
  ADD_CREDITS: "ADD_CREDITS",
  ADD_STAT: "ADD_STAT",
  SET_GAME_OVER: "SET_GAME_OVER",
  SET_SETTING: "SET_SETTING"
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const normalizePilot = (value) => String(value || "НОВЫЙ КОМАНДИР").trim().slice(0, 18).toUpperCase() || "НОВЫЙ КОМАНДИР";

function rebuildShip(ship, upgrades) {
  const base = createLoadout(ship.typeId);
  const next = {
    ...base,
    maxSpeed: Math.round(base.maxSpeed * (1 + upgrades.engine * 0.12)),
    maxShield: base.maxShield + upgrades.shield * 8,
    maxHull: base.maxHull + upgrades.armor * 10,
    laserPower: Math.round(base.laserPower * (1 + upgrades.laser * 0.25)),
    laserCooldown: Math.round(base.laserCooldown * Math.max(0.5, 1 - upgrades.laser * 0.12) * 1000) / 1000,
    maxFuel: base.maxFuel + upgrades.fuel * 25
  };
  const hullRatio = base.maxHull ? ship.hull / base.maxHull : 1;
  const shieldRatio = base.maxShield ? ship.shield / base.maxShield : 0;
  const fuelRatio = base.maxFuel ? ship.fuel / base.maxFuel : 1;
  next.hull = ship.hull >= base.maxHull ? next.maxHull : clamp(Math.round(hullRatio * next.maxHull), 1, next.maxHull);
  next.shield = ship.shield >= base.maxShield ? next.maxShield : clamp(Math.round(shieldRatio * next.maxShield), 0, next.maxShield);
  next.fuel = ship.fuel >= base.maxFuel ? next.maxFuel : clamp(Math.round(fuelRatio * next.maxFuel), 0, next.maxFuel);
  return next;
}

function createRun({ seed, pilot, shipTypeId, currentSystemId }) {
  const type = getShipType(shipTypeId);
  return {
    seed: Number(seed) || 1337,
    currentSystemId,
    targetSystemId: null,
    stationId: null,
    pilot: normalizePilot(pilot),
    credits: APP_CONFIG.economy.startCredits,
    bounty: 0,
    legal: true,
    ship: createLoadout(type.id),
    upgrades: { engine: 0, shield: 0, armor: 0, laser: 0, radar: 0, fuel: 0 },
    cargo: [],
    gameOver: false,
    startedAt: Date.now(),
    stats: {
      hyperspaces: 0,
      distance: 0,
      kills: 0,
      trades: 0,
      cargoDelivered: 0,
      playTime: 0
    }
  };
}

export function createInitialState(settings = {}) {
  return {
    version: 1,
    settings: {
      masterVolume: settings.masterVolume ?? 0.55,
      muted: settings.muted ?? false
    },
    run: null
  };
}

export function getCargoQuantity(state, commodityId) {
  return state.run?.cargo.find((item) => item.commodityId === commodityId)?.quantity || 0;
}

export function reducer(state, action) {
  if (!action?.type) return state;
  if (action.type === ACTIONS.LOAD_SAVE) {
    const loaded = action.payload;
    if (!loaded || typeof loaded !== "object") return state;
    return {
      version: 1,
      settings: {
        masterVolume: clamp(Number(loaded.settings?.masterVolume ?? 0.55), 0, 1),
        muted: Boolean(loaded.settings?.muted)
      },
      run: loaded.run ? { ...loaded.run } : null
    };
  }
  if (action.type === ACTIONS.SET_SETTING) {
    return {
      ...state,
      settings: { ...state.settings, ...action.payload }
    };
  }
  if (action.type === ACTIONS.NEW_GAME) {
    return {
      ...state,
      run: createRun({
        seed: action.payload?.seed,
        pilot: action.payload?.pilot,
        shipTypeId: action.payload?.shipTypeId,
        currentSystemId: action.payload?.currentSystemId || "sys-01"
      })
    };
  }
  if (action.type === ACTIONS.CLEAR_RUN) {
    return { ...state, run: null };
  }
  if (!state.run) return state;
  const run = state.run;

  switch (action.type) {
    case ACTIONS.SET_LOCATION:
      return {
        ...state,
        run: {
          ...run,
          currentSystemId: action.payload.currentSystemId ?? run.currentSystemId,
          stationId: action.payload.stationId === undefined ? run.stationId : action.payload.stationId,
          targetSystemId: action.payload.targetSystemId === undefined ? run.targetSystemId : action.payload.targetSystemId
        }
      };
    case ACTIONS.SET_TARGET:
      return { ...state, run: { ...run, targetSystemId: action.payload.targetSystemId } };
    case ACTIONS.HYPERSPACE: {
      const fuel = Math.max(0, run.ship.fuel - action.payload.fuelCost);
      const distance = action.payload.distance || 0;
      return {
        ...state,
        run: {
          ...run,
          currentSystemId: action.payload.targetSystemId,
          targetSystemId: null,
          stationId: null,
          ship: { ...run.ship, fuel },
          stats: {
            ...run.stats,
            hyperspaces: run.stats.hyperspaces + 1,
            distance: run.stats.distance + distance
          }
        }
      };
    }
    case ACTIONS.DAMAGE: {
      const amount = Math.max(0, Number(action.payload.amount) || 0);
      const absorbed = Math.min(run.ship.shield, amount);
      const hull = Math.max(0, run.ship.hull - (amount - absorbed));
      return {
        ...state,
        run: {
          ...run,
          ship: { ...run.ship, shield: run.ship.shield - absorbed, hull },
          legal: action.payload.legal === false ? false : run.legal,
          gameOver: hull <= 0 || run.gameOver
        }
      };
    }
    case ACTIONS.SET_STATUS:
      return {
        ...state,
        run: {
          ...run,
          ship: {
            ...run.ship,
            hull: clamp(Number(action.payload.hull ?? run.ship.hull), 0, run.ship.maxHull),
            shield: clamp(Number(action.payload.shield ?? run.ship.shield), 0, run.ship.maxShield),
            fuel: clamp(Number(action.payload.fuel ?? run.ship.fuel), 0, run.ship.maxFuel)
          }
        }
      };
    case ACTIONS.REPAIR_AND_RECHARGE:
      return {
        ...state,
        run: {
          ...run,
          ship: { ...run.ship, hull: run.ship.maxHull, shield: run.ship.maxShield },
          legal: true
        }
      };
    case ACTIONS.BUY_FUEL: {
      const quantity = Math.max(0, Math.floor(Number(action.payload.quantity) || 0));
      const total = quantity * APP_CONFIG.economy.fuelPrice;
      if (!quantity || run.credits < total) return state;
      return {
        ...state,
        run: {
          ...run,
          credits: run.credits - total,
          ship: { ...run.ship, fuel: Math.min(run.ship.maxFuel, run.ship.fuel + quantity) },
          stats: { ...run.stats, trades: run.stats.trades + 1 }
        }
      };
    }
    case ACTIONS.BUY_CARGO: {
      const quantity = Math.max(0, Math.floor(Number(action.payload.quantity) || 0));
      const unitPrice = Math.max(0, Math.floor(Number(action.payload.unitPrice) || 0));
      const total = quantity * unitPrice;
      const used = run.cargo.reduce((sum, item) => sum + item.quantity, 0);
      const current = getCargoQuantity(state, action.payload.commodityId);
      if (!quantity || run.credits < total || used + quantity > run.ship.cargoCapacity) return state;
      return {
        ...state,
        run: {
          ...run,
          credits: run.credits - total,
          legal: run.legal,
          cargo: current > 0
            ? run.cargo.map((item) => item.commodityId === action.payload.commodityId ? { ...item, quantity: item.quantity + quantity } : item)
            : [...run.cargo, { commodityId: action.payload.commodityId, quantity }],
          stats: { ...run.stats, trades: run.stats.trades + 1 }
        }
      };
    }
    case ACTIONS.SELL_CARGO: {
      const current = getCargoQuantity(state, action.payload.commodityId);
      const quantity = Math.min(current, Math.max(0, Math.floor(Number(action.payload.quantity) || 0)));
      const total = quantity * Math.max(0, Math.floor(Number(action.payload.unitPrice) || 0));
      if (!quantity) return state;
      const cargo = run.cargo
        .map((item) => item.commodityId === action.payload.commodityId ? { ...item, quantity: item.quantity - quantity } : item)
        .filter((item) => item.quantity > 0);
      return {
        ...state,
        run: {
          ...run,
          credits: run.credits + total,
          cargo,
          stats: { ...run.stats, trades: run.stats.trades + 1 }
        }
      };
    }
    case ACTIONS.BUY_UPGRADE: {
      const upgrades = { ...run.upgrades };
      const id = action.payload.id;
      if (!(id in upgrades) || upgrades[id] >= (action.payload.maxLevel || 4) || run.credits < action.payload.cost) return state;
      upgrades[id] += 1;
      return {
        ...state,
        run: {
          ...run,
          credits: run.credits - action.payload.cost,
          upgrades,
          ship: rebuildShip(run.ship, upgrades),
          stats: { ...run.stats, trades: run.stats.trades + 1 }
        }
      };
    }
    case ACTIONS.SELL_UPGRADE: {
      const upgrades = { ...run.upgrades };
      const id = action.payload.id;
      if (!(id in upgrades) || upgrades[id] <= 0 || run.credits + action.payload.refund < 0) return state;
      upgrades[id] -= 1;
      return {
        ...state,
        run: {
          ...run,
          credits: run.credits + action.payload.refund,
          upgrades,
          ship: rebuildShip(run.ship, upgrades)
        }
      };
    }
    case ACTIONS.CHANGE_SHIP: {
      const type = getShipType(action.payload.typeId);
      if (run.ship.typeId === type.id || run.credits < type.price) return state;
      return {
        ...state,
        run: {
          ...run,
          credits: run.credits - type.price,
          ship: rebuildShip({ ...createLoadout(type.id), hull: run.ship.hull, shield: run.ship.shield, fuel: run.ship.fuel }, run.upgrades),
          stats: { ...run.stats, trades: run.stats.trades + 1 }
        }
      };
    }
    case ACTIONS.ADD_CREDITS:
      return { ...state, run: { ...run, credits: Math.max(0, run.credits + Number(action.payload.amount || 0)) } };
    case ACTIONS.ADD_STAT: {
      const amount = Number(action.payload.amount || 0);
      return {
        ...state,
        run: {
          ...run,
          bounty: Math.max(0, run.bounty + Number(action.payload.bounty || 0)),
          credits: Math.max(0, run.credits + Number(action.payload.credits || 0)),
          legal: action.payload.legal === undefined ? run.legal : Boolean(action.payload.legal),
          stats: { ...run.stats, [action.payload.key]: (run.stats[action.payload.key] || 0) + amount }
        }
      };
    }
    case ACTIONS.SET_GAME_OVER:
      return { ...state, run: { ...run, gameOver: Boolean(action.payload.value) } };
    default:
      return state;
  }
}

export function createStore(reducerFunction = reducer) {
  let state = createInitialState();
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch(action) {
      const next = reducerFunction(state, action);
      if (next !== state) {
        state = next;
        listeners.forEach((listener) => listener(state, action));
      }
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
