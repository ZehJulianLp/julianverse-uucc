const keys = {
  history: "uucc:history",
  favorites: "uucc:favorites",
  currencyCache: "uucc:currency-cache",
  theme: "uucc:theme",
  lang: "uucc:lang",
  funMode: "uucc:fun-mode",
  rootFontPx: "uucc:root-font-px",
  emPx: "uucc:em-px",
  lineHeightPx: "uucc:line-height-px",
  viewportWidthPx: "uucc:viewport-width-px",
  viewportHeightPx: "uucc:viewport-height-px",
  electricityPricePerKwh: "uucc:electricity-price-kwh",
  fuelPricePerLiter: "uucc:fuel-price-liter",
  carCo2KgPerKm: "uucc:car-co2-kg-km"
};

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getHistory() {
  return read(keys.history, []);
}

export function addHistory(entry) {
  const next = [entry, ...getHistory().filter((item) => item.query !== entry.query)].slice(0, 12);
  write(keys.history, next);
  return next;
}

export function clearHistory() {
  write(keys.history, []);
}

export function removeHistory(query) {
  write(keys.history, getHistory().filter((item) => item.query !== query));
}

export function getFavorites() {
  return read(keys.favorites, []);
}

export function addFavorite(favorite) {
  const next = [favorite, ...getFavorites().filter((item) => `${item.from}:${item.to}` !== `${favorite.from}:${favorite.to}`)].slice(0, 16);
  write(keys.favorites, next);
  return next;
}

export function clearFavorites() {
  write(keys.favorites, []);
}

export function removeFavorite(from, to) {
  write(keys.favorites, getFavorites().filter((item) => `${item.from}:${item.to}` !== `${from}:${to}`));
}

export function getCurrencyCache() {
  return read(keys.currencyCache, {});
}

export function setCurrencyCache(cache) {
  write(keys.currencyCache, cache);
}

export function getPreference(name, fallback) {
  return localStorage.getItem(keys[name]) || fallback;
}

export function setPreference(name, value) {
  localStorage.setItem(keys[name], value);
}
