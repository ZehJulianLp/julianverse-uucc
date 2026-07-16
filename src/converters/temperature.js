const toCelsius = {
  C: (value) => value,
  F: (value) => (value - 32) * (5 / 9),
  K: (value) => value - 273.15
};

const fromCelsius = {
  C: (value) => value,
  F: (value) => value * (9 / 5) + 32,
  K: (value) => value + 273.15
};

export function convertTemperature(value, from, to) {
  if (!toCelsius[from] || !fromCelsius[to]) {
    throw new Error("Diese Temperaturumrechnung ist nicht bekannt.");
  }
  return fromCelsius[to](toCelsius[from](value));
}
