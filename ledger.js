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

  function indexById(entries) {
    return new Map((entries || []).map((entry, index) => [entry.id, index]));
  }

  function normalizeFoldedBefore(value, sortedEntries) {
    const entries = Array.isArray(sortedEntries) ? sortedEntries : [];
    const ids = indexById(entries);
    if (!Array.isArray(value) || !entries.length) return [];

    const ranges = [];
    value.forEach((item) => {
      if (item && typeof item === "object") {
        const from = String(item.from || "").trim();
        const to = String(item.to || "").trim();
        if (ids.has(from) && ids.has(to) && ids.get(from) <= ids.get(to)) {
          ranges.push({ from, to });
        }
        return;
      }
      const to = String(item || "").trim();
      if (!ids.has(to)) return;
      const toIdx = ids.get(to);
      const used = new Set();
      ranges.forEach((range) => {
        for (let i = ids.get(range.from); i <= ids.get(range.to); i++) used.add(i);
      });
      let fromIdx = 0;
      while (fromIdx <= toIdx && used.has(fromIdx)) fromIdx += 1;
      if (fromIdx <= toIdx) {
        ranges.push({ from: entries[fromIdx].id, to });
      }
    });

    ranges.sort((a, b) => ids.get(a.from) - ids.get(b.from));
    const cleaned = [];
    let lastEnd = -1;
    ranges.forEach((range) => {
      const start = ids.get(range.from);
      const end = ids.get(range.to);
      if (start > lastEnd) {
        cleaned.push({ from: range.from, to: range.to });
        lastEnd = end;
      }
    });
    return cleaned;
  }

  function toggleFold(foldedBefore, key, sortedEntries) {
    const entries = Array.isArray(sortedEntries) ? sortedEntries : [];
    const next = String(key || "").trim();
    const folds = normalizeFoldedBefore(foldedBefore, entries);
    if (!next || !entries.length) return folds;

    const ids = indexById(entries);
    const idx = ids.get(next);
    if (idx === undefined) return folds;

    const hit = folds.find((range) => {
      const start = ids.get(range.from);
      const end = ids.get(range.to);
      return range.to === next || (idx >= start && idx <= end);
    });
    if (hit) {
      return folds.filter((range) => range !== hit);
    }

    const foldedIndex = new Set();
    folds.forEach((range) => {
      for (let i = ids.get(range.from); i <= ids.get(range.to); i++) foldedIndex.add(i);
    });

    let fromIdx = idx;
    while (fromIdx > 0 && !foldedIndex.has(fromIdx - 1)) {
      fromIdx -= 1;
    }

    return normalizeFoldedBefore([...folds, { from: entries[fromIdx].id, to: next }], entries);
  }

  function getFoldSegments(sortedEntries, foldedBefore) {
    const entries = Array.isArray(sortedEntries) ? sortedEntries : [];
    const folds = normalizeFoldedBefore(foldedBefore, entries);
    if (!entries.length) return [];
    if (!folds.length) return [{ type: "rows", entries }];

    const ids = indexById(entries);
    const foldByStart = new Map(folds.map((range) => [ids.get(range.from), range]));
    const segments = [];
    let i = 0;
    while (i < entries.length) {
      const fold = foldByStart.get(i);
      if (fold) {
        const end = ids.get(fold.to);
        const collapsed = entries.slice(i, end + 1);
        segments.push({
          type: "fold",
          key: fold.to,
          entries: collapsed,
          from: collapsed[0].date,
          to: collapsed[collapsed.length - 1].date,
        });
        i = end + 1;
        continue;
      }
      const start = i;
      i += 1;
      while (i < entries.length && !foldByStart.has(i)) i += 1;
      segments.push({ type: "rows", entries: entries.slice(start, i) });
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
