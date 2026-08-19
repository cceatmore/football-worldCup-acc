const { test } = require("node:test");
const assert = require("node:assert/strict");
const { computeRunningTotals, getProfit, createEntryFromInvestment } = require("./ledger.js");

test("修改中间行奖金后，最后一行总计必须按全部净赚重算", () => {
  const base = -10000;
  const entries = [
    { id: "a", investment: 2000, prize: 0 },
    { id: "b", investment: 2000, prize: 0 },
    { id: "c", investment: 2000, prize: 0 },
  ];

  const before = computeRunningTotals(base, entries);
  assert.deepEqual(before, [-12000, -14000, -16000]);

  entries[1].prize = 5000;
  assert.equal(getProfit(entries[1]), 3000);

  const after = computeRunningTotals(base, entries);
  assert.equal(after[0], -12000);
  assert.equal(after[1], -9000);
  assert.equal(
    after[2],
    -11000,
    "最后一行总计应为 -10000 + (-2000) + 3000 + (-2000) = -11000"
  );
});

test("只改中间行时，后续每一行总计都要跟着变，不能只改当前行", () => {
  const base = -10000;
  const entries = [
    { investment: 1000, prize: 0 },
    { investment: 1000, prize: 2500 },
    { investment: 1000, prize: 0 },
    { investment: 1000, prize: 0 },
  ];

  const first = computeRunningTotals(base, entries);
  entries[1].prize = 4000;
  const next = computeRunningTotals(base, entries);
  const delta = getProfit(entries[1]) - (2500 - 1000);

  assert.equal(next[0], first[0]);
  assert.equal(next[1], first[1] + delta);
  assert.equal(next[2], first[2] + delta);
  assert.equal(next[3], first[3] + delta);
  assert.equal(next[3], first[3] + 1500);
});

test("新增只填投入时，奖金为0，净赚为负投入，总计按净赚累加", () => {
  const entry = createEntryFromInvestment("2,000", "8.19");
  assert.equal(entry.date, "8.19");
  assert.equal(entry.investment, 2000);
  assert.equal(entry.prize, 0);
  assert.equal(getProfit(entry), -2000);
  assert.deepEqual(computeRunningTotals(-10000, [entry]), [-12000]);
});
