import { parseQuery, queryFromRequest } from "./parser.js";

export function readUrlInput(search = window.location.search) {
  const params = new URLSearchParams(search);
  const theme = params.get("theme");
  const lang = params.get("lang");
  const precision = params.get("precision");
  const copy = params.get("copy") === "true";
  const mode = params.get("mode");
  const parsedPrecision = precision === null ? undefined : Math.max(0, Math.min(12, Number.parseInt(precision, 10)));

  const options = {
    precision: Number.isFinite(parsedPrecision) ? parsedPrecision : undefined,
    theme: ["system", "light", "dark"].includes(theme) ? theme : null,
    lang: ["de", "en"].includes(lang) ? lang : null,
    mode: mode === "compact" ? "compact" : null,
    copy
  };

  const q = params.get("q");
  if (q) {
    return { type: "query", query: q, options };
  }

  const value = params.get("value");
  const from = params.get("from");
  const to = params.get("to");
  if (value && from && to) {
    const request = { value, from, to, precision: options.precision };
    return { type: "structured", query: queryFromRequest(request), request, options };
  }

  return { type: "empty", query: value || from || to || "", options };
}

export function shareUrlForQuery(query) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("q", query);
  return url.toString();
}

export function requestFromUrlInput(urlInput) {
  if (!urlInput || urlInput.type === "empty") return null;
  return parseQuery(urlInput.query, urlInput.options);
}
