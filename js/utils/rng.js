export function hashString(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed = 1) {
  let value = (Number(seed) >>> 0) || 1;
  const next = () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    float: (min = 0, max = 1) => min + (max - min) * next(),
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffled: (items) => {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const target = Math.floor(next() * (index + 1));
        [result[index], result[target]] = [result[target], result[index]];
      }
      return result;
    },
    fork: (salt = 0) => createRng((value ^ hashString(salt)) >>> 0)
  };
}
