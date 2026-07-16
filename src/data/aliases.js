import { CURRENCY_ALIASES, CURRENCIES } from "./currencies.js";
import { UNITS } from "./unit-definitions.js";

const normaliseKey = (value) => String(value).trim().toLowerCase().replace(/\s+/g, "");

const unitAliasMap = new Map();
const ambiguousAliasMap = new Map();

for (const unit of UNITS) {
  for (const alias of [unit.id, unit.label, ...(unit.aliases || [])]) {
    const key = normaliseKey(alias);
    if (unitAliasMap.has(key) && unitAliasMap.get(key) !== unit.id) {
      ambiguousAliasMap.set(key, [...new Set([unitAliasMap.get(key), unit.id])]);
      unitAliasMap.delete(key);
    } else if (!ambiguousAliasMap.has(key)) {
      unitAliasMap.set(key, unit.id);
    }
  }
}

const currencyAliasMap = new Map();
for (const currency of CURRENCIES) currencyAliasMap.set(currency.toLowerCase(), currency);
for (const [alias, currency] of Object.entries(CURRENCY_ALIASES)) {
  currencyAliasMap.set(normaliseKey(alias), currency);
}

export function normaliseToken(token) {
  return normaliseKey(token).replace(/^°/, "");
}

export function resolveUnit(token) {
  const key = normaliseKey(token);
  if (currencyAliasMap.has(key)) return { id: currencyAliasMap.get(key), type: "currency" };
  if (unitAliasMap.has(key)) return { id: unitAliasMap.get(key), type: "unit" };
  if (ambiguousAliasMap.has(key)) return { ids: ambiguousAliasMap.get(key), type: "ambiguous" };
  if (/^[a-z]{3}$/.test(key)) return { id: key.toUpperCase(), type: "currency" };
  return null;
}

export function resolveAmbiguous(token, otherUnit, unitById) {
  const resolved = resolveUnit(token);
  if (!resolved || resolved.type !== "ambiguous" || !otherUnit) return resolved;
  const match = resolved.ids.find((id) => unitById.get(id)?.category === otherUnit.category);
  return match ? { id: match, type: "unit" } : resolved;
}
