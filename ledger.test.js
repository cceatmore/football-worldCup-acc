const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  computeRunningTotals,
  getProfit,
  createEntryFromInvestment,
  getFoldSegments,
  toggleFold,
  getFoldSummary,
  normalizeSettings,
  themeFromColor,
} = require("./ledger.js");

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

test("在 7.31 向上折叠时，只收起 7.31 之前的记录", () => {
  const entries = [
    { id: "1", date: "7.28" },
    { id: "2", date: "7.30" },
    { id: "3", date: "7.31" },
    { id: "4", date: "7.31晚" },
    { id: "5", date: "8.1" },
  ];
  const segments = getFoldSegments(entries, ["7.31"]);
  assert.equal(segments[0].type, "fold");
  assert.equal(segments[0].key, "7.31");
  assert.deepEqual(
    segments[0].entries.map((e) => e.id),
    ["1", "2"]
  );
  assert.equal(segments[1].type, "rows");
  assert.deepEqual(
    segments[1].entries.map((e) => e.id),
    ["3", "4", "5"]
  );
});

test("多个折叠同级：7.31 与 8.15 各收起各自之前尚未折叠的一段", () => {
  const entries = [
    { id: "1", date: "7.28" },
    { id: "2", date: "7.31" },
    { id: "3", date: "8.1" },
    { id: "4", date: "8.15" },
    { id: "5", date: "8.16" },
  ];
  const segments = getFoldSegments(entries, ["8.15", "7.31"]);
  assert.equal(segments.length, 3);
  assert.deepEqual(
    segments.map((s) => s.type),
    ["fold", "fold", "rows"]
  );
  assert.equal(segments[0].key, "7.31");
  assert.deepEqual(
    segments[0].entries.map((e) => e.id),
    ["1"]
  );
  assert.equal(segments[1].key, "8.15");
  assert.deepEqual(
    segments[1].entries.map((e) => e.id),
    ["2", "3"]
  );
  assert.deepEqual(
    segments[2].entries.map((e) => e.id),
    ["4", "5"]
  );
});

test("再次点击同一日期应取消该段折叠", () => {
  const folded = toggleFold(["7.31"], "7.31");
  assert.deepEqual(folded, []);
  assert.deepEqual(toggleFold(folded, "7.31"), ["7.31"]);
});

test("折叠条摘要包含时间、数量和该段结束时的总计", () => {
  const entries = [
    { id: "1", date: "7.28", investment: 2000, prize: 0 },
    { id: "2", date: "7.30", investment: 2000, prize: 0 },
    { id: "3", date: "7.31", investment: 2000, prize: 0 },
  ];
  const segments = getFoldSegments(entries, ["7.31"]);
  const totals = computeRunningTotals(-10000, entries);
  const summary = getFoldSummary(segments[0], totals[1]);
  assert.equal(summary.time, "7.28 – 7.30");
  assert.equal(summary.count, 2);
  assert.equal(summary.total, -14000);
});

test("系统设置会规范化标题和主题色", () => {
  assert.deepEqual(normalizeSettings({}), { title: "盈亏记账", themeColor: "#e91e8c" });
  assert.equal(normalizeSettings({ title: "  世界杯记账  " }).title, "世界杯记账");
  assert.equal(normalizeSettings({ title: "" }).title, "盈亏记账");
  assert.equal(normalizeSettings({ themeColor: "1A73E8" }).themeColor, "#1a73e8");
  assert.equal(normalizeSettings({ themeColor: "#abc" }).themeColor, "#e91e8c");
});

test("主题色会生成深色和浅色配套色", () => {
  const theme = themeFromColor("#e91e8c");
  assert.equal(theme.color, "#e91e8c");
  assert.match(theme.dark, /^#[0-9a-f]{6}$/);
  assert.match(theme.light, /^#[0-9a-f]{6}$/);
  assert.notEqual(theme.dark, theme.color);
  assert.notEqual(theme.light, theme.color);
});
