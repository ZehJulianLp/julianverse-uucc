import { getCurrencyCache, setCurrencyCache } from "../storage.js";

const API_URL = "https://api.frankfurter.dev/v2/rate";
const CACHE_TTL = 6 * 60 * 60 * 1000;

function validRatePayload(data, from, to) {
  return data
    && typeof data.date === "string"
    && data.base === from
    && data.quote === to
    && typeof data.rate === "number";
}

function readCachedRate(from, to) {
  const cache = getCurrencyCache();
  const entry = cache[from];
  if (!entry || !entry.rates || typeof entry.rates[to] !== "number") return null;
  return {
    rate: entry.rates[to],
    date: entry.date,
    timestamp: entry.timestamp,
    stale: Date.now() - entry.timestamp > CACHE_TTL
  };
}

function writeCachedRate(from, to, rate, date) {
  const cache = getCurrencyCache();
  cache[from] = cache[from] || { timestamp: 0, date, rates: {} };
  cache[from].timestamp = Date.now();
  cache[from].date = date;
  cache[from].rates[to] = rate;
  setCurrencyCache(cache);
}

export async function convertCurrency({ value, from, to }) {
  if (from === to) {
    return {
      inputValue: value,
      inputUnit: from,
      outputValue: value,
      outputUnit: to,
      category: "currency",
      rate: 1,
      date: new Date().toISOString().slice(0, 10),
      source: "Identische Währung",
      cached: false
    };
  }

  const cached = readCachedRate(from, to);
  if (cached && !cached.stale) {
    return {
      inputValue: value,
      inputUnit: from,
      outputValue: value * cached.rate,
      outputUnit: to,
      category: "currency",
      rate: cached.rate,
      date: cached.date,
      source: "Frankfurter API",
      cached: true,
      stale: false
    };
  }

  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(from)}/${encodeURIComponent(to)}`);
    if (!response.ok) throw new Error("Währungs-API nicht erreichbar.");
    const data = await response.json();
    if (!validRatePayload(data, from, to)) throw new Error("Ungültige Wechselkursdaten.");
    writeCachedRate(from, to, data.rate, data.date);
    return {
      inputValue: value,
      inputUnit: from,
      outputValue: value * data.rate,
      outputUnit: to,
      category: "currency",
      rate: data.rate,
      date: data.date,
      source: "Frankfurter API",
      cached: false,
      stale: false
    };
  } catch (error) {
    if (cached) {
      return {
        inputValue: value,
        inputUnit: from,
        outputValue: value * cached.rate,
        outputUnit: to,
        category: "currency",
        rate: cached.rate,
        date: cached.date,
        source: "Frankfurter API",
        cached: true,
        stale: true,
        warning: "Die API ist nicht erreichbar. Es wird ein gespeicherter Kurs verwendet."
      };
    }
    throw new Error("Die Währungsumrechnung ist gerade nicht erreichbar und es ist kein gespeicherter Kurs vorhanden.");
  }
}
