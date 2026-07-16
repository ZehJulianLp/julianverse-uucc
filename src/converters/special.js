import { unitById } from "./units.js";

const defaults = {
  electricityPricePerKwh: 0.35,
  fuelPricePerLiter: 1.8,
  carCo2KgPerKm: 0.17
};

export function convertSpecial(request, options = {}) {
  const assumptions = { ...defaults, ...options.assumptions };
  if (request.special === "aspectRatio") return aspectRatio(request);
  if (request.special === "imageMemory") return imageMemory(request);
  if (request.special === "printPixels") return printPixels(request);
  if (request.special === "downloadTime") return downloadTime(request);
  if (request.special === "batteryWh") return batteryWh(request);
  if (request.special === "electricityCost") return electricityCost(request, assumptions);
  if (request.special === "fuelCost") return fuelCost(request, assumptions);
  if (request.special === "co2Car") return co2Car(request, assumptions);
  throw new Error("Diese Spezialumrechnung konnte nicht erkannt werden.");
}

function aspectRatio({ width, height }) {
  const divisor = gcd(width, height);
  const ratio = `${width / divisor}:${height / divisor}`;
  return result(width * height, "px", width / height, "ratio", "Bildseitenverhältnis", `Seitenverhältnis: ${ratio}`);
}

function imageMemory({ width, height, channels, to }) {
  const bytes = width * height * channels;
  const outputValue = bytes / factor(to);
  return result(width * height, channels === 4 ? "rgba px" : "rgb px", outputValue, to, "Bildspeicher", `${channels} Kanäle à 8 Bit, unkomprimiert`);
}

function printPixels({ dpi, lengthValue, lengthUnit }) {
  const inches = lengthValue * factor(lengthUnit) / factor("in");
  return result(lengthValue, lengthUnit, dpi * inches, "px", "Druckpixel", `${dpi} dpi`);
}

function downloadTime({ firstValue, firstUnit, secondValue, secondUnit }) {
  const bits = firstValue * factor(firstUnit) * 8;
  const bitsPerSecond = secondValue * factor(secondUnit);
  const seconds = bits / bitsPerSecond;
  return result(firstValue, firstUnit, seconds, "s", "Downloadzeit", `${firstValue} ${firstUnit} bei ${secondValue} ${secondUnit}`);
}

function batteryWh({ firstValue, secondValue }) {
  const wh = (firstValue / 1000) * secondValue;
  return result(firstValue, "mAh", wh, "Wh", "Akkuenergie", `${firstValue} mAh bei ${secondValue} V`);
}

function electricityCost(request, assumptions) {
  const kwh = request.energyKwh ?? (request.firstValue * factor(request.firstUnit) / factor("kW")) * (request.secondValue * factor(request.secondUnit) / factor("h"));
  const cost = kwh * assumptions.electricityPricePerKwh;
  return result(kwh, "kWh", cost, request.to || "EUR", "Stromkosten", `${assumptions.electricityPricePerKwh} pro kWh`);
}

function fuelCost(request, assumptions) {
  const liters = request.firstValue / 100 * request.secondValue;
  const cost = liters * assumptions.fuelPricePerLiter;
  return result(request.firstValue, "km", cost, request.to || "EUR", "Spritkosten", `${liters.toFixed(2)} l bei ${assumptions.fuelPricePerLiter} pro l`);
}

function co2Car(request, assumptions) {
  const kg = request.distanceKm * assumptions.carCo2KgPerKm;
  return result(request.distanceKm, "km", kg, "kg CO2", "CO2 grob", `${assumptions.carCo2KgPerKm} kg CO2/km`);
}

function result(inputValue, inputUnit, outputValue, outputUnit, label, detail) {
  return {
    inputValue,
    inputUnit,
    outputValue,
    outputUnit,
    category: "special",
    categoryLabel: label,
    factor: null,
    detail
  };
}

function factor(id) {
  const unit = unitById.get(id);
  if (!unit?.factorToBase) throw new Error(`Die Einheit "${id}" ist für diese Spezialumrechnung nicht geeignet.`);
  return unit.factorToBase;
}

function gcd(a, b) {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}
