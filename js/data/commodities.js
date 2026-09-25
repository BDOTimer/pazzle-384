export const COMMODITIES = Object.freeze([
  Object.freeze({ id: "food", name: "Продовольствие", short: "FOOD", basePrice: 42, legal: true }),
  Object.freeze({ id: "textiles", name: "Текстиль", short: "TEXT", basePrice: 68, legal: true }),
  Object.freeze({ id: "metal", name: "Металлы", short: "METAL", basePrice: 96, legal: true }),
  Object.freeze({ id: "circuits", name: "Микросхемы", short: "CHIP", basePrice: 164, legal: true }),
  Object.freeze({ id: "medicine", name: "Медикаменты", short: "MED", basePrice: 142, legal: true }),
  Object.freeze({ id: "machinery", name: "Механизмы", short: "MACH", basePrice: 238, legal: true }),
  Object.freeze({ id: "minerals", name: "Редкие минералы", short: "MIN", basePrice: 326, legal: true }),
  Object.freeze({ id: "isotopes", name: "Изотопы", short: "ISO", basePrice: 520, legal: false })
]);

export function getCommodity(id) {
  return COMMODITIES.find((commodity) => commodity.id === id) || null;
}

function marketRandom(seed) {
  let value = (Number(seed) >>> 0) || 1;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMarket(seed, count = COMMODITIES.length) {
  const random = marketRandom(seed);
  const entries = COMMODITIES.slice(0, count).map((commodity, index) => {
    const pressure = 0.56 + random() * 1.35;
    const buyPrice = Math.max(8, Math.round(commodity.basePrice * pressure));
    return Object.freeze({
      commodityId: commodity.id,
      stock: commodity.legal ? 8 + Math.floor(random() * 150) : Math.floor(random() * 38),
      buyPrice,
      sellPrice: Math.max(4, Math.round(buyPrice * 0.68)),
      trend: Math.round((pressure - 1) * 100),
      sequence: index
    });
  });
  return Object.freeze(entries);
}

export function getMarketEntry(market, commodityId) {
  return market.find((entry) => entry.commodityId === commodityId) || null;
}
