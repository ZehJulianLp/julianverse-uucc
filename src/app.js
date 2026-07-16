import { convert } from "./converters/index.js";
import { parseQuery } from "./parser.js";
import { readUrlInput, shareUrlForQuery } from "./router.js";
import { addHistory, getPreference, setPreference } from "./storage.js";
import { bindUi, focusInput, formatResult, getAssumptions, getFunMode, setBusy, setPreferences, setQuery, showError, showResult } from "./ui.js";

let currentPrecision;

function applyTheme(theme) {
  const selected = theme || getPreference("theme", "system");
  const effective = selected === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : selected;
  document.documentElement.dataset.theme = effective;
  setPreference("theme", selected);
  return selected;
}

function applyLang(lang) {
  const selected = lang || getPreference("lang", "de");
  document.documentElement.lang = selected;
  setPreference("lang", selected);
  return selected;
}

async function runQuery(query, options = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) {
    showError("Bitte gib eine Umrechnung ein.");
    return;
  }

  setBusy(true);
  try {
    currentPrecision = options.precision ?? currentPrecision;
    const allowAbsurd = options.allowAbsurd ?? getFunMode();
    const request = parseQuery(trimmed, { precision: currentPrecision, allowMixed: allowAbsurd });
    const result = await convert(request, { allowAbsurd, assumptions: getAssumptions() });
    const resultText = formatResult(result, currentPrecision);
    addHistory({ query: trimmed, result: resultText, timestamp: Date.now() });
    window.history.replaceState(null, "", shareUrlForQuery(trimmed));
    showResult(result, trimmed, currentPrecision);
  } catch (error) {
    showError(error.message || "Diese Umrechnung konnte nicht erkannt werden.");
  }
}

async function boot() {
  bindUi({
    onRunQuery: runQuery,
    getShareUrl: shareUrlForQuery,
    onThemeChange: (theme) => setPreferences({ theme: applyTheme(theme) }),
    onLangChange: (lang) => setPreferences({ lang: applyLang(lang) })
  });

  const urlInput = readUrlInput();
  if (urlInput.options.mode === "compact") document.body.classList.add("compact");
  const theme = applyTheme(urlInput.options.theme);
  const lang = applyLang(urlInput.options.lang);
  setPreferences({ theme, lang });
  currentPrecision = urlInput.options.precision;

  if (urlInput.query) setQuery(urlInput.query);

  if (urlInput.type !== "empty") await runQuery(urlInput.query, urlInput.options);

  focusInput();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
