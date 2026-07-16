import assert from "node:assert/strict";
import { parseQuery } from "../src/parser.js";
import { convert } from "../src/converters/index.js";
import { convertUnit } from "../src/converters/units.js";

const cases = [
  ["10 km mi", "mi", 6.2137119223733395],
  ["1mm m", "m", 0.001],
  ["10km mi", "mi", 6.2137119223733395],
  ["10,5cm m", "m", 0.105],
  ["5 ft cm", "cm", 152.4],
  ["98 f c", "C", 36.66666666666667],
  ["1 gb mib", "MiB", 953.67431640625],
  ["10 oz g", "g", 283.49523125],
  ["10 oz ml", "ml", 295.735295625],
  ["1 bar psi", "psi", 14.503773773020923],
  ["1 hp kw", "kW", 0.7456998715822702],
  ["1 PS kW", "kW", 0.73549875],
  ["1 MPa bar", "bar", 10],
  ["760 torr atm", "atm", 1],
  ["90 deg rad", "rad", Math.PI / 2],
  ["1 g/cm3 kg/m3", "kg/m3", 1000],
  ["1 lbf n", "N", 4.4482216152605],
  ["2.4 ghz mhz", "MHz", 2400],
  ["5 l/100km mpg", "mpg", 47.04291666666666],
  ["12 pt px", "px", 16],
  ["2.5 rem px", "px", 40],
  ["24px rem", "rem", 1.5],
  ["1 pc px", "px", 16],
  ["50vw px", "px", 960],
  ["2 lh px", "px", 38.4],
  ["1 dvw px", "px", 19.2],
  ["1/2 cup ml", "ml", 118.29411825],
  ["2 * 49.99 usd eur", "EUR", null],
  ["10 square feet m2", "m2", 0.9290304],
  ["1 g0 m/s2", "m/s2", 9.80665],
  ["60 l/min l/s", "l/s", 1],
  ["100 Mbit/s MB/s", "MB/s", 12.5],
  ["1 gbps mb/s", "MB/s", 125],
  ["3h deg", "deg", 90],
  ["90deg h", "h", 3],
  ["1000 mV V", "V", 1],
  ["2500 mA A", "A", 2.5],
  ["1 kOhm Ohm", "Ohm", 1000],
  ["1 Ah Coul", "Coul", 3600],
  ["1000 uF mF", "mF", 1],
  ["1000 uH mH", "mH", 1],
  ["100 fc lx", "lx", 1076.3910416709722],
  ["1 Ci Bq", "Bq", 37000000000],
  ["1 Tmag Gmag", "Gmag", 10000],
  ["1 percent ppm", "ppm", 10000],
  ["1000 mmol mol", "mol", 1],
  ["1 Pa*s cP", "cP", 1000],
  ["1 cSt m2/s", "m2/s", 0.000001],
  ["1 dppx ppi", "ppi", 96],
  ["60 rpm rev/s", "rev/s", 1],
  ["1 bel dB", "dB", 10],
  ["1 chunk block", "block", 16],
  ["1 region chunk", "chunk", 32],
  ["1 block m", "m", 1],
  ["1 km block", "block", 1000],
  ["16 m chunk", "chunk", 1],
  ["1 nether_block block", "block", 8],
  ["1 block/s km/h", "km/h", 3.6],
  ["3 shulker items", "item", 5184],
  ["1 stack16 item", "item", 16],
  ["1 inventory stack", "stack", 36],
  ["1 double chest stack", "stack", 54],
  ["1920x1080 px MP", "MP", 2.0736],
  ["1 A4 A5", "A5", 2.0067567567567566],
  ["42 shoe_eu shoe_jp", "shoe_jp", 26.5],
  ["54 ring_eu ring_diameter", "ring_diameter", 17.188733853924695],
  ["1920x1080 ratio", "ratio", 1.7777777777777777],
  ["1920x1080 rgba MB", "MB", 8.2944],
  ["300 dpi 10cm px", "px", 1181.1023622047244],
  ["50GB 100Mbit/s time", "s", 4000],
  ["5000mAh 3.7V Wh", "Wh", 18.5],
  ["350W 4h eur", "EUR", 0.49],
  ["2 kWh eur", "EUR", 0.7],
  ["600km 7l/100km eur", "EUR", 75.6],
  ["100km car co2", "kg CO2", 17]
];

for (const [query, to, expected] of cases) {
  const request = parseQuery(query);
  assert.equal(request.to, to);
  if (request.kind === "currency") continue;
  const result = request.kind === "special" ? await convert(request) : convertUnit(request);
  assert.equal(result.outputUnit, to);
  assert.ok(Math.abs(result.outputValue - expected) < 0.000001, `${query}: ${result.outputValue}`);
}

console.log("acceptance tests passed");

const absurdMixed = parseQuery("1mm eur", { allowMixed: true });
assert.equal(absurdMixed.kind, "absurd");
assert.equal((await convert(absurdMixed)).category, "absurd");

const absurdCategory = parseQuery("1mm kg");
assert.equal((await convert(absurdCategory, { allowAbsurd: true })).category, "absurd");

const meetingMoney = parseQuery("1 meeting eur", { allowMixed: true });
assert.equal(meetingMoney.kind, "absurd");
assert.equal((await convert(meetingMoney)).category, "absurd");

console.log("absurd mode tests passed");
