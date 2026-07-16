import { CATEGORIES } from "../data/unit-definitions.js";
import { unitById } from "./units.js";

const categoryScale = {
  currency: 1,
  length: 1,
  mass: 8,
  area: 12,
  volume: 2,
  speed: 0.7,
  time: 0.02,
  data: 0.000000002,
  energy: 0.0002,
  temperature: 0.12,
  pressure: 0.00003,
  power: 0.006,
  torque: 0.04,
  angle: 3,
  density: 0.01,
  force: 0.05,
  frequency: 0.000001,
  fuel: 0.4,
  typography: 0.08,
  acceleration: 0.2,
  flow: 0.3,
  dataRate: 0.000000003,
  voltage: 0.05,
  current: 0.07,
  resistance: 0.01,
  charge: 0.04,
  capacitance: 0.0000008,
  inductance: 0.0008,
  illuminance: 0.002,
  luminousFlux: 0.001,
  luminousIntensity: 0.01,
  radioactivity: 0.00000001,
  magnetism: 0.6,
  concentration: 0.0004,
  substance: 0.9,
  viscosityDynamic: 0.03,
  viscosityKinematic: 0.08,
  resolution: 0.005,
  rotation: 0.2,
  sound: 0.02,
  minecraftLength: 1,
  minecraftItems: 0.003,
  imageSize: 0.00000002,
  productivityFun: 0.5
};

function unitCategory(id) {
  return unitById.get(id)?.category || "currency";
}

function unitFactor(id) {
  const unit = unitById.get(id);
  if (!unit) return 1;
  if (unit.category === "temperature" || unit.category === "fuel") return 1;
  return unit.factorToBase || 1;
}

export function convertAbsurd({ value, from, to }) {
  const fromCategory = unitCategory(from);
  const toCategory = unitCategory(to);
  const fromPoints = value * unitFactor(from) * (categoryScale[fromCategory] || 1);
  const outputValue = fromPoints / ((categoryScale[toCategory] || 1) * unitFactor(to));

  return {
    inputValue: value,
    inputUnit: from,
    outputValue,
    outputUnit: to,
    category: "absurd",
    categoryLabel: "Alles-Modus",
    factor: outputValue / value,
    fromCategory: CATEGORIES[fromCategory]?.label || "Währung",
    toCategory: CATEGORIES[toCategory]?.label || "Währung",
    warning: "Spaßmodus: Das ist keine physikalisch oder finanziell sinnvolle Umrechnung."
  };
}
