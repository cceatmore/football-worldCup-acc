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

  return { toNumber, getPrize, getProfit, computeRunningTotals, createEntryFromInvestment };
});
