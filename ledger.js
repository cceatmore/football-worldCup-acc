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

  function createEntryFromInvestment(investment, dateLabel) {
    return {
      date: dateLabel,
      investment: toNumber(investment),
      prize: 0,
    };
  }

  function parseEntryDate(label, year) {
    const match = String(label).match(/^(\d{1,2})\.(\d{1,2})(晚)?$/);
    if (!match) return null;
    const y = year ?? new Date().getFullYear();
    const date = new Date(y, Number(match[1]) - 1, Number(match[2]));
    if (match[3]) date.setHours(20, 0, 0, 0);
    return date;
  }

  function dateTime(label) {
    return parseEntryDate(label)?.getTime() ?? 0;
  }

  function normalizeFoldedBefore(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))].sort(
      (a, b) => dateTime(a) - dateTime(b)
    );
  }

  function toggleFold(foldedBefore, key) {
    const label = String(key || "").trim();
    if (!label) return normalizeFoldedBefore(foldedBefore);
    const set = new Set(normalizeFoldedBefore(foldedBefore));
    if (set.has(label)) set.delete(label);
    else set.add(label);
    return normalizeFoldedBefore([...set]);
  }

  function getFoldSegments(sortedEntries, foldedBefore) {
    const entries = Array.isArray(sortedEntries) ? sortedEntries : [];
    const keys = normalizeFoldedBefore(foldedBefore);
    const segments = [];
    let start = 0;

    keys.forEach((key) => {
      const cutoff = dateTime(key);
      const collapsed = [];
      while (start < entries.length && dateTime(entries[start].date) < cutoff) {
        collapsed.push(entries[start]);
        start += 1;
      }
      if (collapsed.length) {
        segments.push({
          type: "fold",
          key,
          entries: collapsed,
          from: collapsed[0].date,
          to: collapsed[collapsed.length - 1].date,
        });
      }
    });

    if (start < entries.length) {
      segments.push({ type: "rows", entries: entries.slice(start) });
    }

    return segments;
  }

  function getFoldSummary(segment, runningTotalAtEnd) {
    const from = segment?.from ?? "";
    const to = segment?.to ?? "";
    return {
      time: from && to && from !== to ? `${from} – ${to}` : from || to,
      count: Array.isArray(segment?.entries) ? segment.entries.length : 0,
      total: toNumber(runningTotalAtEnd),
    };
  }

  return {
    toNumber,
    getPrize,
    getProfit,
    computeRunningTotals,
    createEntryFromInvestment,
    parseEntryDate,
    normalizeFoldedBefore,
    toggleFold,
    getFoldSegments,
    getFoldSummary,
  };
});
