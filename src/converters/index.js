import { convertAbsurd } from "./absurd.js";
import { convertCurrency } from "./currency.js";
import { convertSpecial } from "./special.js";
import { convertUnit } from "./units.js";

export async function convert(request, options = {}) {
  if (request.kind === "absurd") return convertAbsurd(request);
  if (request.kind === "special") return convertSpecial(request, options);
  try {
    return request.kind === "currency" ? convertCurrency(request) : convertUnit(request, options);
  } catch (error) {
    if (options.allowAbsurd) return convertAbsurd(request);
    throw error;
  }
}
