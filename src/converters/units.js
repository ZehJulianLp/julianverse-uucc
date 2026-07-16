import { CATEGORIES, UNITS } from "../data/unit-definitions.js";
import { convertTemperature } from "./temperature.js";

export const unitById = new Map(UNITS.map((unit) => [unit.id, unit]));

const fuelToBase = {
  "km/l": (value) => value,
  "l/100km": (value) => 100 / value,
  mpg: (value) => value * 1.609344 / 3.785411784
};

const fuelFromBase = {
  "km/l": (value) => value,
  "l/100km": (value) => 100 / value,
  mpg: (value) => value / (1.609344 / 3.785411784)
};

export function convertUnit({ value, from, to }, options = {}) {
  const fromUnit = unitById.get(from);
  const toUnit = unitById.get(to);
  if (!fromUnit) throw new Error(`Die Einheit "${from}" ist nicht bekannt.`);
  if (!toUnit) throw new Error(`Die Einheit "${to}" ist nicht bekannt.`);
  if (fromUnit.category === "shoeSize" && toUnit.category === "shoeSize") {
    return convertShoeSize(value, fromUnit, toUnit);
  }
  if (fromUnit.category === "ringSize" && toUnit.category === "ringSize") {
    return convertRingSize(value, fromUnit, toUnit);
  }
  if (isMinecraftLengthConversion(fromUnit, toUnit)) {
    return convertMinecraftLength(value, fromUnit, toUnit);
  }
  if (isClockAngleConversion(fromUnit, toUnit)) {
    return convertClockAngle(value, fromUnit, toUnit);
  }
  if (fromUnit.category !== toUnit.category) {
    throw new Error(`${fromUnit.label} kann nicht direkt in ${toUnit.label} umgerechnet werden.`);
  }

  let outputValue;
  if (fromUnit.category === "temperature") {
    outputValue = convertTemperature(value, from, to);
  } else if (fromUnit.category === "fuel") {
    if (value === 0) throw new Error("Kraftstoffverbrauch kann nicht mit 0 umgerechnet werden.");
    outputValue = fuelFromBase[to](fuelToBase[from](value));
  } else {
    outputValue = (value * factorToBase(fromUnit, options)) / factorToBase(toUnit, options);
  }

  const factor = ["temperature", "fuel"].includes(fromUnit.category)
    ? null
    : factorToBase(fromUnit, options) / factorToBase(toUnit, options);

  return {
    inputValue: value,
    inputUnit: from,
    outputValue,
    outputUnit: to,
    category: fromUnit.category,
    categoryLabel: CATEGORIES[fromUnit.category]?.label || fromUnit.category,
    factor
  };
}

function factorToBase(unit, options = {}) {
  if (unit.category !== "typography") return unit.factorToBase;
  const assumptions = {
    rootFontPx: 16,
    emPx: 16,
    lineHeightPx: 19.2,
    viewportWidthPx: 1920,
    viewportHeightPx: 1080,
    ...options.assumptions
  };
  const minViewport = Math.min(assumptions.viewportWidthPx, assumptions.viewportHeightPx);
  const maxViewport = Math.max(assumptions.viewportWidthPx, assumptions.viewportHeightPx);
  const dynamic = {
    rem: assumptions.rootFontPx,
    em: assumptions.emPx,
    ch: assumptions.emPx * 0.5,
    ex: assumptions.emPx * 0.5,
    lh: assumptions.lineHeightPx,
    rlh: assumptions.lineHeightPx,
    vw: assumptions.viewportWidthPx / 100,
    svw: assumptions.viewportWidthPx / 100,
    lvw: assumptions.viewportWidthPx / 100,
    dvw: assumptions.viewportWidthPx / 100,
    vh: assumptions.viewportHeightPx / 100,
    svh: assumptions.viewportHeightPx / 100,
    lvh: assumptions.viewportHeightPx / 100,
    dvh: assumptions.viewportHeightPx / 100,
    vmin: minViewport / 100,
    vmax: maxViewport / 100
  };
  return dynamic[unit.id] ?? unit.factorToBase;
}

function convertShoeSize(value, fromUnit, toUnit) {
  const cm = shoeToCentimeters(value, fromUnit.id);
  const outputValue = centimetersToShoe(cm, toUnit.id);
  return sizedResult(value, fromUnit, outputValue, toUnit, "Schuhgröße", null);
}

function shoeToCentimeters(value, unit) {
  if (unit === "shoe_jp") return value;
  if (unit === "shoe_eu") return value / 1.5 - 1.5;
  if (unit === "shoe_uk") return (value + 23) / 3 * 2.54;
  if (unit === "shoe_us_m") return (value + 22) / 3 * 2.54;
  if (unit === "shoe_us_w") return (value + 20.5) / 3 * 2.54;
  return value;
}

function centimetersToShoe(cm, unit) {
  if (unit === "shoe_jp") return cm;
  if (unit === "shoe_eu") return (cm + 1.5) * 1.5;
  if (unit === "shoe_uk") return cm / 2.54 * 3 - 23;
  if (unit === "shoe_us_m") return cm / 2.54 * 3 - 22;
  if (unit === "shoe_us_w") return cm / 2.54 * 3 - 20.5;
  return cm;
}

function convertRingSize(value, fromUnit, toUnit) {
  const circumference = ringToCircumference(value, fromUnit.id);
  const outputValue = circumferenceToRing(circumference, toUnit.id);
  return sizedResult(value, fromUnit, outputValue, toUnit, "Ringgröße", null);
}

function ringToCircumference(value, unit) {
  if (unit === "ring_eu") return value;
  if (unit === "ring_diameter") return value * Math.PI;
  if (unit === "ring_us") return value * 2.55 + 36.5;
  if (unit === "ring_uk") return value * 1.25 + 37.8;
  return value;
}

function circumferenceToRing(circumference, unit) {
  if (unit === "ring_eu") return circumference;
  if (unit === "ring_diameter") return circumference / Math.PI;
  if (unit === "ring_us") return (circumference - 36.5) / 2.55;
  if (unit === "ring_uk") return (circumference - 37.8) / 1.25;
  return circumference;
}

function sizedResult(inputValue, fromUnit, outputValue, toUnit, label, factor) {
  return {
    inputValue,
    inputUnit: fromUnit.id,
    outputValue,
    outputUnit: toUnit.id,
    category: fromUnit.category,
    categoryLabel: label,
    factor
  };
}

function isClockAngleConversion(fromUnit, toUnit) {
  return (fromUnit.category === "time" && toUnit.category === "angle")
    || (fromUnit.category === "angle" && toUnit.category === "time");
}

function isMinecraftLengthConversion(fromUnit, toUnit) {
  return (fromUnit.category === "minecraftLength" && toUnit.category === "length")
    || (fromUnit.category === "length" && toUnit.category === "minecraftLength")
    || (fromUnit.category === "minecraftLength" && toUnit.category === "minecraftLength");
}

function convertMinecraftLength(value, fromUnit, toUnit) {
  const factor = fromUnit.factorToBase / toUnit.factorToBase;
  return {
    inputValue: value,
    inputUnit: fromUnit.id,
    outputValue: value * factor,
    outputUnit: toUnit.id,
    category: "minecraftLength",
    categoryLabel: "Minecraft Länge",
    factor
  };
}

function convertClockAngle(value, fromUnit, toUnit) {
  const factor = clockAngleFactor(fromUnit, toUnit);
  return {
    inputValue: value,
    inputUnit: fromUnit.id,
    outputValue: value * factor,
    outputUnit: toUnit.id,
    category: "clockAngle",
    categoryLabel: "Uhrwinkel",
    factor
  };
}

function clockAngleFactor(fromUnit, toUnit) {
  if (fromUnit.category === "time") {
    const hours = fromUnit.factorToBase / 3600;
    const radians = hours * 30 * (Math.PI / 180);
    return radians / toUnit.factorToBase;
  }

  const degrees = fromUnit.factorToBase * (180 / Math.PI);
  const seconds = (degrees / 30) * 3600;
  return seconds / toUnit.factorToBase;
}
