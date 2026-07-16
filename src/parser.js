import { resolveAmbiguous, resolveUnit } from "./data/aliases.js";
import { unitById } from "./converters/units.js";

const SEPARATORS = new Set(["to", "in", "nach", "zu", "as", "=>", "->", "="]);

function cleanQuery(query) {
  return String(query || "")
    .trim()
    .replace(/,/g, ".")
    .replace(/\s+/g, " ");
}

function tokenise(query) {
  const tokens = cleanQuery(query).split(" ").filter(Boolean);
  const expanded = [];
  for (let index = 0; index < tokens.length; index += 1) {
    expanded.push(...splitLeadingValueAndUnit(tokens[index]));
  }
  return expanded.filter((token) => !SEPARATORS.has(token.toLowerCase()));
}

function parseNumber(expression) {
  const compact = String(expression).replace(/\s+/g, "").replace(/(\d)x(\d)/gi, "$1*$2");
  if (!/^[\d.+\-*/()]+$/.test(compact) || !/\d/.test(compact)) return null;
  try {
    const value = Function(`"use strict"; return (${compact});`)();
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function splitLeadingValueAndUnit(token) {
  const match = String(token).match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:\/\d+(?:\.\d+)?)?)([^\d\s].*)$/);
  if (!match) return [token];
  const [, valuePart, unitPart] = match;
  if (!unitPart || /^[+\-*/)]/.test(unitPart) || /^x\d/i.test(unitPart)) return [token];
  return [valuePart, unitPart];
}

function describeUnknown(token) {
  return token ? `Die Einheit "${token}" ist nicht bekannt.` : "Diese Umrechnung konnte nicht erkannt werden.";
}

function resolvePair(fromToken, toToken) {
  let to = resolveUnit(toToken);
  let from = resolveUnit(fromToken);
  const fromUnit = from?.type === "unit" ? unitById.get(from.id) : null;
  const toUnit = to?.type === "unit" ? unitById.get(to.id) : null;
  if (toUnit?.category === "imageSize" && from?.id === "px") from = { id: "pximg", type: "unit" };
  if (fromUnit?.category === "imageSize" && to?.id === "px") to = { id: "pximg", type: "unit" };
  if (from?.type === "ambiguous" && toUnit) from = resolveAmbiguous(fromToken, toUnit, unitById);
  if (to?.type === "ambiguous" && fromUnit) to = resolveAmbiguous(toToken, fromUnit, unitById);

  return { from, to };
}

function resolvePhrase(tokens) {
  if (!tokens.length) return null;
  return resolveUnit(tokens.join("")) || resolveUnit(tokens.join(" "));
}

function resolvePhrasePair(tokens) {
  for (let split = tokens.length - 1; split >= 1; split -= 1) {
    const fromToken = tokens.slice(0, split).join(" ");
    const toToken = tokens.slice(split).join(" ");
    const { from, to } = resolvePair(fromToken, toToken);
    if (from && to) return { from, to, fromToken, toToken };
  }
  return {
    from: resolvePhrase([tokens[0]]),
    to: resolvePhrase(tokens.slice(1)),
    fromToken: tokens[0],
    toToken: tokens.slice(1).join(" ")
  };
}

export function parseQuery(query, options = {}) {
  const tokens = tokenise(query);
  const special = parseSpecial(tokens, options);
  if (special) return special;
  if (tokens.length < 3) {
    throw new Error("Bitte gib Wert, Ausgangseinheit und Zieleinheit ein.");
  }

  let parsed = null;
  for (let valueEnd = 1; valueEnd <= tokens.length - 2; valueEnd += 1) {
    const value = parseNumber(tokens.slice(0, valueEnd).join(" "));
    if (value === null) continue;
    const unitTokens = tokens.slice(valueEnd);
    const pair = resolvePhrasePair(unitTokens);
    if (pair.from && pair.to) {
      parsed = { value, ...pair };
      break;
    }
  }

  if (!parsed) {
    const value = parseNumber(tokens[0]);
    if (value === null) throw new Error("Bitte gib einen gültigen Zahlenwert ein.");
    const fromToken = tokens[1];
    const toToken = tokens.slice(2).join(" ");
    const { from, to } = resolvePair(fromToken, toToken);
    parsed = { value, from, to, fromToken, toToken };
  }

  const { value, from, to, fromToken, toToken } = parsed;

  if (!from) throw new Error(describeUnknown(fromToken));
  if (!to) throw new Error(describeUnknown(toToken));
  if (from.type === "ambiguous") throw new Error(`Die Einheit "${fromToken}" ist mehrdeutig. Nutze eine genauere Schreibweise.`);
  if (to.type === "ambiguous") throw new Error(`Die Einheit "${toToken}" ist mehrdeutig. Nutze eine genauere Schreibweise.`);

  if (from.type !== to.type && !options.allowMixed) {
    const fromLabel = from.id;
    const toLabel = to.id;
    throw new Error(`${fromLabel} kann nicht direkt in ${toLabel} umgerechnet werden.`);
  }

  return {
    value,
    from: from.id,
    to: to.id,
    kind: from.type === "currency" && to.type === "currency"
      ? "currency"
      : from.type !== to.type
        ? "absurd"
        : "unit",
    precision: options.precision
  };
}

function parseSpecial(tokens) {
  const lower = tokens.map((token) => token.toLowerCase());
  const dimension = parseDimensionToken(tokens[0]);
  if (dimension && ["ratio", "aspect", "seitenverhältnis", "seitenverhaeltnis"].includes(lower[1])) {
    return { kind: "special", special: "aspectRatio", ...dimension, to: "ratio" };
  }
  if (dimension && ["rgb", "rgba"].includes(lower[1]) && tokens[2]) {
    return { kind: "special", special: "imageMemory", ...dimension, channels: lower[1] === "rgba" ? 4 : 3, to: resolveUnit(tokens[2])?.id || tokens[2] };
  }
  if (dimension && resolveUnit(tokens[1])?.id === "pximg" && resolveUnit(tokens[2])?.id === "MP") {
    return { value: dimension.width * dimension.height, from: "pximg", to: "MP", kind: "unit" };
  }

  if (tokens.length >= 5 && lower[1] === "dpi") {
    const lengthValue = parseNumber(tokens[2]);
    const lengthUnit = resolveUnit(tokens[3])?.id;
    const to = resolveUnit(tokens[4])?.id;
    if (parseNumber(tokens[0]) !== null && lengthValue !== null && lengthUnit && to === "px") {
      return { kind: "special", special: "printPixels", dpi: parseNumber(tokens[0]), lengthValue, lengthUnit, to };
    }
  }

  if (tokens.length >= 5 && lower[4] === "time") {
    return { ...specialWithTwoValues(tokens, "downloadTime"), to: "s" };
  }
  if (tokens.length >= 5 && resolveUnit(tokens[1])?.id === "mAh" && resolveUnit(tokens[3])?.id === "V" && resolveUnit(tokens[4])?.id === "Wh") {
    return specialWithTwoValues(tokens, "batteryWh");
  }
  if (tokens.length >= 5 && resolveUnit(tokens[1])?.id === "W" && unitById.get(resolveUnit(tokens[3])?.id)?.category === "time") {
    return specialWithTwoValues(tokens, "electricityCost");
  }
  if (tokens.length >= 3 && resolveUnit(tokens[1])?.id === "kWh" && isMoneyToken(tokens[2])) {
    return { kind: "special", special: "electricityCost", energyKwh: parseNumber(tokens[0]), to: tokens[2].toUpperCase() };
  }
  if (tokens.length >= 5 && resolveUnit(tokens[1])?.id === "km" && resolveUnit(tokens[3])?.id === "l/100km" && isMoneyToken(tokens[4])) {
    return specialWithTwoValues(tokens, "fuelCost");
  }
  if (tokens.length >= 4 && resolveUnit(tokens[1])?.id === "km" && ["car", "auto"].includes(lower[2]) && lower[3] === "co2") {
    return { kind: "special", special: "co2Car", distanceKm: parseNumber(tokens[0]), to: "kg CO2" };
  }
  return null;
}

function specialWithTwoValues(tokens, special) {
  const firstValue = parseNumber(tokens[0]);
  const secondValue = parseNumber(tokens[2]);
  if (firstValue === null || secondValue === null) return null;
  return {
    kind: "special",
    special,
    firstValue,
    firstUnit: resolveUnit(tokens[1])?.id || tokens[1],
    secondValue,
    secondUnit: resolveUnit(tokens[3])?.id || tokens[3],
    to: resolveUnit(tokens[4])?.id || tokens[4]
  };
}

function parseDimensionToken(token) {
  const match = String(token).match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/i);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

function isMoneyToken(token) {
  return ["eur", "usd", "gbp", "€", "$", "£"].includes(String(token).toLowerCase());
}

export function queryFromRequest(request) {
  return `${request.value} ${request.from} ${request.to}`;
}
