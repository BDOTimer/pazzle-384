import { createRng, hashString } from "../utils/rng.js";
import { createMarket } from "./commodities.js";

const SYSTEM_NAMES = [
  ["Лазурный берег", "LAZ"],
  ["Оникс", "ONX"],
  ["Терновый штурм", "THN"],
  ["Заря", "ZAR"],
  ["Мидгард", "MID"],
  ["Соляная гора", "SLT"],
  ["Пыльный шум", "DST"],
  ["Крагон", "KRG"],
  ["Полярная звезда", "POL"],
  ["Рыжий риф", "RDG"],
  ["Виридиан", "VRD"],
  ["Стеклянный шторм", "GLS"],
  ["Архив", "ARC"],
  ["Нова", "NOV"],
  ["Серый карман", "GRY"],
  ["Красный дрейф", "RDR"],
  ["Седой узел", "SED"],
  ["Тихая гавань", "HBR"],
  ["Медный ветер", "COP"],
  ["Чёрный свет", "BLK"],
  ["Аметист", "AMT"],
  ["Последний маяк", "LMN"],
  ["Резонанс", "RSN"],
  ["Нулевая орбита", "ZRO"]
];

const GOVERNMENTS = ["Конфедерация", "Звёздный Союз", "Торговая Гильдия", "Свободный сектор"];
const ECONOMIES = ["Промышленность", "Агросектор", "Технологии", "Энергетика", "Торговый хаб"];
const PLANET_TYPES = ["океан", "пустыня", "ледник", "вулкан", "лес", "газовый гигант", "пустошь"];
const PLANET_COLORS = [0x0084ff, 0xffe14a, 0xf4f4ed, 0xff3b30, 0x00c957, 0xed2f91, 0x7b8491];

export function createGalaxy(seed = 1337) {
  const random = createRng(hashString(`galaxy:${seed}`));
  const systems = SYSTEM_NAMES.map(([name, short], index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    const systemSeed = hashString(`${seed}:${index}`);
    const systemRandom = createRng(systemSeed);
    const x = 9 + column * 16.2 + systemRandom.float(-2.2, 2.2);
    const y = 12 + row * 26 + systemRandom.float(-2.6, 2.6);
    const danger = 1 + ((index * 7 + systemSeed) % 5);
    const tech = 1 + ((index * 3 + Math.floor(systemSeed / 13)) % 5);
    const planetCount = 2 + systemRandom.int(0, 3);
    const planets = Array.from({ length: planetCount }, (__, planetIndex) => {
      const angle = systemRandom.float(0, Math.PI * 2);
      const distance = systemRandom.float(190, 980);
      const radius = planetIndex === 0 ? systemRandom.float(42, 76) : systemRandom.float(20, 58);
      return {
        id: `${index + 1}-${planetIndex + 1}`,
        name: `${name} ${planetIndex + 1}`,
        type: systemRandom.pick(PLANET_TYPES),
        radius,
        position: {
          x: Math.cos(angle) * distance,
          y: systemRandom.float(-180, 180),
          z: Math.sin(angle) * distance
        },
        color: systemRandom.pick(PLANET_COLORS),
        hasRings: systemRandom.next() > 0.72
      };
    });
    const economy = ECONOMIES[(index + Math.floor(systemSeed / 97)) % ECONOMIES.length];
    return {
      id: `sys-${String(index + 1).padStart(2, "0")}`,
      index,
      name,
      short,
      x: Math.min(94, Math.max(6, x)),
      y: Math.min(92, Math.max(8, y)),
      seed: systemSeed,
      government: GOVERNMENTS[(index + Math.floor(systemSeed / 71)) % GOVERNMENTS.length],
      economy,
      population: Math.round(systemRandom.float(0.4, 18.5) * 100) / 100,
      danger,
      tech,
      tax: 2 + Math.round(systemRandom.float(0, 11)),
      station: {
        id: `stn-${String(index + 1).padStart(2, "0")}`,
        name: `${short}-${systemRandom.int(10, 99)}`,
        seed: hashString(`station:${systemSeed}`),
        position: { x: 0, y: 0, z: -560 },
        color: economy === "Технологии" ? 0x00d5df : 0xffe14a
      },
      planets,
      market: createMarket(hashString(`market:${systemSeed}`))
    };
  });

  const routes = new Set();
  const addRoute = (a, b) => {
    const left = Math.min(a, b);
    const right = Math.max(a, b);
    routes.add(`${left}|${right}`);
  };
  systems.forEach((system, index) => {
    addRoute(index, (index + 1) % systems.length);
    if (index % 6 < 5) addRoute(index, index + 1);
    if (index % 6 > 0) addRoute(index, index - 1);
  });
  for (let index = 0; index < 10; index += 1) {
    addRoute(random.int(0, systems.length - 1), random.int(0, systems.length - 1));
  }

  const routeList = [...routes].map((entry) => entry.split("|").map(Number));
  return Object.freeze({
    seed,
    systems: Object.freeze(systems),
    routeList: Object.freeze(routeList.map((route) => Object.freeze(route))),
    systemById: Object.freeze(Object.fromEntries(systems.map((system) => [system.id, system])))
  });
}

export function getSystem(galaxy, id) {
  return galaxy.systemById[id] || null;
}

export function routesFrom(galaxy, id) {
  const index = systemsIndex(galaxy, id);
  if (index < 0) return [];
  return galaxy.routeList
    .filter((route) => route[0] === index || route[1] === index)
    .map((route) => route[0] === index ? route[1] : route[0])
    .map((targetIndex) => galaxy.systems[targetIndex]);
}

export function systemsIndex(galaxy, id) {
  return galaxy.systems.findIndex((system) => system.id === id);
}

export function systemDistance(from, to) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 140);
}
