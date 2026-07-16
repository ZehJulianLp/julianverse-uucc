import { CURRENCIES } from "./data/currencies.js";
import { CATEGORIES, UNITS } from "./data/unit-definitions.js";
import { addFavorite, clearFavorites, clearHistory, getFavorites, getHistory, getPreference, removeFavorite, removeHistory, setPreference } from "./storage.js";

const elements = {};
let lastResult = null;
let lastQuery = "";
let onRunQuery = () => {};
let getShareUrl = () => "";

export function bindUi(callbacks) {
  onRunQuery = callbacks.onRunQuery;
  getShareUrl = callbacks.getShareUrl;
  for (const id of [
    "converterForm", "queryInput", "statusPill", "resultText", "detailText",
    "copyResultButton", "copyLinkButton", "favoriteButton", "favoritesList",
    "historyList", "clearFavoritesButton", "clearHistoryButton", "themeSelect", "langSelect",
    "structuredForm", "structuredValue", "fromSearch", "toSearch", "swapButton", "unitOptions",
    "qrCanvas", "funModeToggle", "rootFontInput", "emInput", "lineHeightInput",
    "viewportWidthInput", "viewportHeightInput", "electricityPriceInput", "fuelPriceInput",
    "co2Input"
  ]) {
    elements[id] = document.getElementById(id);
  }

  populateUnitOptions();
  elements.funModeToggle.checked = getFunMode();
  loadAssumptionInputs();

  elements.converterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    onRunQuery(elements.queryInput.value, { allowAbsurd: getFunMode() });
  });
  elements.structuredForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = structuredQuery();
    setQuery(query);
    onRunQuery(query, { allowAbsurd: getFunMode() });
  });
  elements.swapButton.addEventListener("click", () => {
    const from = elements.fromSearch.value;
    elements.fromSearch.value = elements.toSearch.value;
    elements.toSearch.value = from;
    if (elements.structuredValue.value.trim()) {
      const query = structuredQuery();
      setQuery(query);
      onRunQuery(query, { allowAbsurd: getFunMode() });
    }
  });
  elements.funModeToggle.addEventListener("change", () => {
    setPreference("funMode", elements.funModeToggle.checked ? "true" : "false");
  });
  for (const [id, key] of assumptionInputs()) {
    elements[id].addEventListener("change", () => setPreference(key, elements[id].value));
  }

  elements.copyResultButton.addEventListener("click", () => copyText(formatResult(lastResult)));
  elements.copyLinkButton.addEventListener("click", () => copyText(getShareUrl(lastQuery)));
  elements.favoriteButton.addEventListener("click", () => {
    if (!lastResult) return;
    addFavorite({
      from: lastResult.inputUnit,
      to: lastResult.outputUnit,
      label: `${lastResult.inputUnit} -> ${lastResult.outputUnit}`
    });
    renderFavorites();
  });
  elements.clearFavoritesButton.addEventListener("click", () => {
    clearFavorites();
    renderFavorites();
  });
  elements.clearHistoryButton.addEventListener("click", () => {
    clearHistory();
    renderHistory();
  });
  elements.themeSelect.addEventListener("change", () => callbacks.onThemeChange(elements.themeSelect.value));
  elements.langSelect.addEventListener("change", () => callbacks.onLangChange(elements.langSelect.value));

  renderFavorites();
  renderHistory();
}

export function focusInput() {
  elements.queryInput?.focus();
}

export function setQuery(query) {
  elements.queryInput.value = query || "";
}

export function setPreferences({ theme, lang }) {
  if (theme) elements.themeSelect.value = theme;
  if (lang) elements.langSelect.value = lang;
}

export function setBusy(isBusy) {
  elements.statusPill.textContent = isBusy ? "Rechnet" : "Bereit";
}

export function showError(message) {
  lastResult = null;
  elements.statusPill.textContent = "Fehler";
  elements.resultText.textContent = message;
  elements.resultText.classList.add("error");
  elements.detailText.textContent = "";
  setActionButtons(false);
}

export function showResult(result, query, precision) {
  lastResult = result;
  lastQuery = query;
  elements.statusPill.textContent = result.category === "absurd"
    ? "Alles"
    : result.category === "currency" && result.cached ? "Cache" : "Fertig";
  elements.resultText.classList.remove("error");
  elements.resultText.textContent = formatResult(result, precision);
  elements.detailText.textContent = formatDetail(result, precision);
  setActionButtons(true);
  syncStructuredFromResult(result);
  drawShareQr(lastQuery ? getShareUrl(lastQuery) : "");
  renderHistory();
}

function setActionButtons(enabled) {
  elements.copyResultButton.disabled = !enabled;
  elements.copyLinkButton.disabled = !enabled;
  elements.favoriteButton.disabled = !enabled;
}

export function renderHistory() {
  const history = getHistory();
  renderList(elements.historyList, history, (entry) => ({
    label: entry.result,
    meta: entry.query,
    query: entry.query,
    removeLabel: "Verlaufseintrag löschen",
    onRemove: () => {
      removeHistory(entry.query);
      renderHistory();
    }
  }), "Noch kein Verlauf.");
}

export function renderFavorites() {
  const favorites = getFavorites();
  renderList(elements.favoritesList, favorites, (entry) => ({
    label: entry.label,
    meta: "1 " + entry.from + " " + entry.to,
    query: "1 " + entry.from + " " + entry.to,
    removeLabel: "Favorit löschen",
    onRemove: () => {
      removeFavorite(entry.from, entry.to);
      renderFavorites();
    }
  }), "Noch keine Favoriten.");
}

function renderList(container, items, mapItem, emptyText) {
  container.textContent = "";
  container.classList.toggle("empty", items.length === 0);
  if (!items.length) {
    container.textContent = emptyText;
    return;
  }

  for (const item of items) {
    const data = mapItem(item);
    const row = document.createElement("div");
    const button = document.createElement("button");
    const removeButton = document.createElement("button");
    const meta = document.createElement("span");
    row.className = "item-row";
    button.type = "button";
    button.className = "item-button";
    button.textContent = data.label;
    meta.className = "item-meta";
    meta.textContent = data.meta;
    button.append(meta);
    button.addEventListener("click", () => {
      setQuery(data.query);
      onRunQuery(data.query, { allowAbsurd: getFunMode() });
    });
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", data.removeLabel);
    removeButton.addEventListener("click", data.onRemove);
    row.append(button, removeButton);
    container.append(row);
  }
}

function formatNumber(value, precision) {
  const digits = Number.isInteger(precision) ? precision : Math.abs(value) >= 100 ? 2 : 4;
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(value);
}

export function formatResult(result, precision) {
  return `${formatNumber(result.inputValue, precision)} ${result.inputUnit} ≈ ${formatNumber(result.outputValue, precision)} ${result.outputUnit}`;
}

function formatDetail(result, precision) {
  if (result.category === "currency") {
    const stale = result.stale ? " · gespeicherter Kurs eventuell veraltet" : "";
    const cached = result.cached ? " · aus Cache" : "";
    return `1 ${result.inputUnit} = ${formatNumber(result.rate, precision ?? 6)} ${result.outputUnit} · Kursdatum: ${result.date}${cached}${stale}`;
  }
  if (result.category === "absurd") {
    return `${result.warning} · ${result.fromCategory} -> ${result.toCategory}`;
  }
  if (result.category === "special") return `${result.categoryLabel}: ${result.detail}`;
  if (result.factor === null) return `${result.categoryLabel}: Temperaturumrechnung mit Offset`;
  return `1 ${result.inputUnit} = ${formatNumber(result.factor, precision ?? 8)} ${result.outputUnit}`;
}

export function getFunMode() {
  return elements.funModeToggle?.checked ?? getPreference("funMode", "false") === "true";
}

export function getAssumptions() {
  return {
    rootFontPx: numberPreference("rootFontPx", 16),
    emPx: numberPreference("emPx", 16),
    lineHeightPx: numberPreference("lineHeightPx", 19.2),
    viewportWidthPx: numberPreference("viewportWidthPx", 1920),
    viewportHeightPx: numberPreference("viewportHeightPx", 1080),
    electricityPricePerKwh: numberPreference("electricityPricePerKwh", 0.35),
    fuelPricePerLiter: numberPreference("fuelPricePerLiter", 1.8),
    carCo2KgPerKm: numberPreference("carCo2KgPerKm", 0.17)
  };
}

function loadAssumptionInputs() {
  const values = getAssumptions();
  const map = {
    rootFontInput: "rootFontPx",
    emInput: "emPx",
    lineHeightInput: "lineHeightPx",
    viewportWidthInput: "viewportWidthPx",
    viewportHeightInput: "viewportHeightPx",
    electricityPriceInput: "electricityPricePerKwh",
    fuelPriceInput: "fuelPricePerLiter",
    co2Input: "carCo2KgPerKm"
  };
  for (const [id, key] of Object.entries(map)) elements[id].value = values[key];
}

function assumptionInputs() {
  return [
    ["rootFontInput", "rootFontPx"],
    ["emInput", "emPx"],
    ["lineHeightInput", "lineHeightPx"],
    ["viewportWidthInput", "viewportWidthPx"],
    ["viewportHeightInput", "viewportHeightPx"],
    ["electricityPriceInput", "electricityPricePerKwh"],
    ["fuelPriceInput", "fuelPricePerLiter"],
    ["co2Input", "carCo2KgPerKm"]
  ];
}

function numberPreference(key, fallback) {
  const value = Number(getPreference(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

function populateUnitOptions() {
  const seen = new Set();
  const fragment = document.createDocumentFragment();
  for (const unit of UNITS) {
    const option = document.createElement("option");
    option.value = optionValue(unit.id, unit.label, CATEGORIES[unit.category]?.label || unit.category);
    fragment.append(option);
    seen.add(unit.id);
  }
  for (const currency of CURRENCIES) {
    const option = document.createElement("option");
    option.value = optionValue(currency, currency, "Währung");
    fragment.append(option);
    seen.add(currency);
  }
  elements.unitOptions.append(fragment);
  fetch("https://api.frankfurter.dev/v2/currencies")
    .then((response) => response.ok ? response.json() : [])
    .then((currencies) => appendRemoteCurrencies(Array.isArray(currencies) ? currencies : [], seen))
    .catch(() => {});
}

function appendRemoteCurrencies(currencies, seen) {
  const fragment = document.createDocumentFragment();
  for (const currency of currencies) {
    const id = currency.iso_code;
    if (!id || seen.has(id)) continue;
    const option = document.createElement("option");
    option.value = optionValue(id, currency.name || id, "Währung");
    fragment.append(option);
    seen.add(id);
  }
  elements.unitOptions.append(fragment);
}

function optionValue(id, label, category) {
  return `${id} - ${label} (${category})`;
}

function normaliseSelection(value) {
  return String(value || "").split(" - ")[0].trim();
}

function structuredQuery() {
  const value = elements.structuredValue.value.trim() || "1";
  return `${value} ${normaliseSelection(elements.fromSearch.value)} ${normaliseSelection(elements.toSearch.value)}`.trim();
}

function syncStructuredFromResult(result) {
  elements.structuredValue.value = String(result.inputValue);
  elements.fromSearch.value = result.inputUnit;
  elements.toSearch.value = result.outputUnit;
}

function drawShareQr(url) {
  const canvas = elements.qrCanvas;
  if (!canvas || !url) {
    if (canvas) canvas.hidden = true;
    return;
  }
  canvas.hidden = false;
  const size = canvas.width;
  const cells = 33;
  const cell = Math.floor(size / cells);
  const quiet = Math.floor((size - cell * cells) / 2);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#111";
  drawFinder(ctx, quiet, quiet, cell);
  drawFinder(ctx, quiet + cell * 24, quiet, cell);
  drawFinder(ctx, quiet, quiet + cell * 24, cell);
  let hash = 2166136261;
  for (const char of url) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      if (inFinder(x, y)) continue;
      hash ^= x * 374761393 + y * 668265263;
      hash = Math.imul(hash, 2246822519);
      if ((hash >>> 29) % 2 === 0) ctx.fillRect(quiet + x * cell, quiet + y * cell, cell, cell);
    }
  }
}

function drawFinder(ctx, x, y, cell) {
  ctx.fillRect(x, y, cell * 7, cell * 7);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
}

function inFinder(x, y) {
  return (x < 8 && y < 8) || (x > 23 && y < 8) || (x < 8 && y > 23);
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    elements.statusPill.textContent = "Kopiert";
  } catch {
    elements.statusPill.textContent = "Kopieren nicht möglich";
  }
}
