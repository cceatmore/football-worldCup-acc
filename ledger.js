(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Ledger = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function toNumber(value) {
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function getPrize(entry) {
    return toNumber(entry.prize);
  }

  function getProfit(entry) {
    return getPrize(entry) - toNumber(entry.investment);
  }

  function computeRunningTotals(baseTotal, entries) {
    let total = toNumber(baseTotal);
    return entries.map((entry) => {
      total += getProfit(entry);
      return total;
    });
  }

  const REMARK_OPTIONS = ["ch", "hy", "hz", "me"];
  const DEFAULT_REMARK = "me";

  function normalizeRemark(value) {
    const remark = String(value || "").trim().toLowerCase();
    return REMARK_OPTIONS.includes(remark) ? remark : "";
  }

  function createEntryFromInvestment(investment, dateLabel, remark) {
    return {
      date: dateLabel,
      investment: toNumber(investment),
      prize: 0,
      remark: normalizeRemark(remark) || DEFAULT_REMARK,
    };
  }

  function getRemarkChartSeries(sortedEntries, rangeStart, enabledRemarks) {
    const enabled = new Set(
      (enabledRemarks || REMARK_OPTIONS).filter((item) => REMARK_OPTIONS.includes(item))
    );
    const totals = Object.fromEntries(REMARK_OPTIONS.map((item) => [item, 0]));
    const series = Object.fromEntries(REMARK_OPTIONS.map((item) => [item, []]));

    (sortedEntries || []).forEach((entry) => {
      const remark = normalizeRemark(entry.remark);
      if (REMARK_OPTIONS.includes(remark)) {
        totals[remark] += getProfit(entry);
      }
      const date = parseEntryDate(entry.date);
      if (!date || (rangeStart && date < rangeStart)) return;
      if (remark && enabled.has(remark)) {
        series[remark].push({ label: entry.date, value: totals[remark] });
      }
    });

    return { series, totals };
  }

  function normalizeDateLabel(label) {
    const raw = String(label || "").trim();
    const match = raw.match(/^(\d{1,2})\.(\d{1,2})(晚)?$/);
    if (!match) return raw.replace(/晚/g, "");
    return `${Number(match[1])}.${Number(match[2])}`;
  }

  function formatDateLabel(date) {
    return `${date.getMonth() + 1}.${date.getDate()}`;
  }

  function parseEntryDate(label, year) {
    const match = String(label).match(/^(\d{1,2})\.(\d{1,2})(晚)?$/);
    if (!match) return null;
    const y = year ?? new Date().getFullYear();
    return new Date(y, Number(match[1]) - 1, Number(match[2]));
  }

  function dateTime(label) {
    return parseEntryDate(label)?.getTime() ?? 0;
  }

  function normalizeFoldedBefore(value) {
    if (!Array.isArray(value)) return [];
    const keys = [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
    return keys.length ? [keys[keys.length - 1]] : [];
  }

  function toggleFold(foldedBefore, key) {
    const next = String(key || "").trim();
    if (!next) return normalizeFoldedBefore(foldedBefore);
    const current = normalizeFoldedBefore(foldedBefore)[0];
    return current === next ? [] : [next];
  }

  function findFoldEndIndex(entries, key) {
    return entries.findIndex((entry) => entry.id === key);
  }

  function getFoldSegments(sortedEntries, foldedBefore) {
    const entries = Array.isArray(sortedEntries) ? sortedEntries : [];
    const key = normalizeFoldedBefore(foldedBefore)[0];
    if (!key || !entries.length) {
      return entries.length ? [{ type: "rows", entries }] : [];
    }

    const end = findFoldEndIndex(entries, key);
    if (end < 0) {
      return [{ type: "rows", entries }];
    }

    const collapsed = entries.slice(0, end + 1);
    const rest = entries.slice(end + 1);
    const segments = [];
    if (collapsed.length) {
      segments.push({
        type: "fold",
        key,
        entries: collapsed,
        from: collapsed[0].date,
        to: collapsed[collapsed.length - 1].date,
      });
    }
    if (rest.length) {
      segments.push({ type: "rows", entries: rest });
    }
    return segments;
  }

  const DEFAULT_TITLE = "盈亏记账";
  const DEFAULT_THEME_COLOR = "#e91e8c";

  function normalizeHexColor(value, fallback = DEFAULT_THEME_COLOR) {
    const match = String(value || "")
      .trim()
      .match(/^#?([0-9a-fA-F]{6})$/);
    return match ? `#${match[1].toLowerCase()}` : fallback;
  }

  function hexToRgb(hex) {
    const n = normalizeHexColor(hex).slice(1);
    return {
      r: parseInt(n.slice(0, 2), 16),
      g: parseInt(n.slice(2, 4), 16),
      b: parseInt(n.slice(4, 6), 16),
    };
  }

  function mixHex(hex, target, ratio) {
    const a = hexToRgb(hex);
    const t = hexToRgb(target);
    const mix = (from, to) => Math.round(from + (to - from) * ratio);
    return `#${[mix(a.r, t.r), mix(a.g, t.g), mix(a.b, t.b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function themeFromColor(hex) {
    const color = normalizeHexColor(hex);
    return {
      color,
      dark: mixHex(color, "#000000", 0.18),
      light: mixHex(color, "#ffffff", 0.85),
    };
  }

  function normalizeSettings(raw) {
    const title = String(raw?.title ?? DEFAULT_TITLE).trim().slice(0, 20);
    return {
      title: title || DEFAULT_TITLE,
      themeColor: normalizeHexColor(raw?.themeColor),
    };
  }

  function getFoldSummary(segment, runningTotalAtEnd) {
    const from = segment?.from ?? "";
    const to = segment?.to ?? "";
    const entries = Array.isArray(segment?.entries) ? segment.entries : [];
    const rangeProfit = entries.reduce((sum, entry) => sum + getProfit(entry), 0);
    return {
      time: from && to && from !== to ? `${from} – ${to}` : from || to,
      count: entries.length,
      rangeProfit,
      total: toNumber(runningTotalAtEnd),
    };
  }

  return {
    toNumber,
    getPrize,
    getProfit,
    computeRunningTotals,
    createEntryFromInvestment,
    normalizeRemark,
    getRemarkChartSeries,
    REMARK_OPTIONS,
    DEFAULT_REMARK,
    parseEntryDate,
    normalizeDateLabel,
    formatDateLabel,
    normalizeFoldedBefore,
    toggleFold,
    getFoldSegments,
    getFoldSummary,
    normalizeSettings,
    themeFromColor,
    DEFAULT_TITLE,
    DEFAULT_THEME_COLOR,
  };
});
