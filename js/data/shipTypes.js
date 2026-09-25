export const SHIP_TYPES = Object.freeze([
  Object.freeze({
    id: "courier",
    name: "Курьер MK II",
    short: "COURIER",
    description: "Лёгкий быстрый корабль для первой экспедиции.",
    price: 0,
    hull: 32,
    shield: 22,
    maxSpeed: 105,
    cargoCapacity: 10,
    laserPower: 7,
    laserCooldown: 0.2,
    color: 0x00d5df
  }),
  Object.freeze({
    id: "hawk",
    name: "Ястреб",
    short: "HAWK",
    description: "Скоростной перехватчик с мощной носовой батареей.",
    price: 34000,
    hull: 42,
    shield: 28,
    maxSpeed: 145,
    cargoCapacity: 7,
    laserPower: 10,
    laserCooldown: 0.16,
    color: 0xffe14a
  }),
  Object.freeze({
    id: "bastion",
    name: "Бастион",
    short: "BASTION",
    description: "Тяжёлый защитник с прочным корпусом и грузовым трюмом.",
    price: 76000,
    hull: 78,
    shield: 48,
    maxSpeed: 82,
    cargoCapacity: 24,
    laserPower: 12,
    laserCooldown: 0.24,
    color: 0xff3b30
  }),
  Object.freeze({
    id: "starlight",
    name: "Звёздный свет",
    short: "STARLIGHT",
    description: "Универсальный разведчик премиального класса.",
    price: 148000,
    hull: 58,
    shield: 42,
    maxSpeed: 172,
    cargoCapacity: 14,
    laserPower: 15,
    laserCooldown: 0.14,
    color: 0xed2f91
  })
]);

export const UPGRADE_TYPES = Object.freeze([
  Object.freeze({ id: "engine", name: "Гипердвигатель", short: "DRIVE", maxLevel: 4, baseCost: 5400, description: "+12% скорости за уровень" }),
  Object.freeze({ id: "shield", name: "Генератор щита", short: "SHLD", maxLevel: 4, baseCost: 6100, description: "+8 щита за уровень" }),
  Object.freeze({ id: "armor", name: "Бронекорпус", short: "ARMOR", maxLevel: 4, baseCost: 7200, description: "+10 корпуса за уровень" }),
  Object.freeze({ id: "laser", name: "Лазерная батарея", short: "LASER", maxLevel: 4, baseCost: 8100, description: "+25% урона и быстрее зарядка" }),
  Object.freeze({ id: "radar", name: "Радар", short: "RADAR", maxLevel: 3, baseCost: 4600, description: "Увеличивает дальность радара" }),
  Object.freeze({ id: "fuel", name: "Топливные баки", short: "FUEL", maxLevel: 4, baseCost: 3900, description: "+25 единицы топлива за уровень" })
]);

export function getShipType(id) {
  return SHIP_TYPES.find((ship) => ship.id === id) || SHIP_TYPES[0];
}

export function getUpgradeType(id) {
  return UPGRADE_TYPES.find((upgrade) => upgrade.id === id) || null;
}

export function createLoadout(typeId = "courier") {
  const ship = getShipType(typeId);
  return {
    typeId: ship.id,
    hull: ship.hull,
    maxHull: ship.hull,
    shield: ship.shield,
    maxShield: ship.shield,
    fuel: 70,
    maxFuel: 70,
    maxSpeed: ship.maxSpeed,
    cargoCapacity: ship.cargoCapacity,
    laserPower: ship.laserPower,
    laserCooldown: ship.laserCooldown
  };
}

export function getUpgradeCost(upgradeId, level) {
  const upgrade = getUpgradeType(upgradeId);
  if (!upgrade) return Infinity;
  return Math.round(upgrade.baseCost * Math.pow(1.72, level));
}

export function getUpgradeRefund(upgradeId, level) {
  return Math.round(getUpgradeCost(upgradeId, Math.max(0, level - 1)) * 0.55);
}
