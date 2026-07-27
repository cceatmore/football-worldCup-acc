(function () {
  "use strict";

  const STORAGE_KEY = "football-ledger-simple-v1";
  const DEFAULT_BASE_TOTAL = -10000;

  const state = {
    baseTotal: DEFAULT_BASE_TOTAL,
    entries: [],
    activeTab: "ledger",
    chartRange: "week",
  };

  const els = {
    ledgerView: document.querySelector("#ledger-view"),
    chartView: document.querySelector("#chart-view"),
    ledgerBody: document.querySelector("#ledger-body"),
    emptyState: document.querySelector("#empty-state"),
    addEntryBtn: document.querySelector("#add-entry-btn"),
    tabLedger: document.querySelector("#tab-ledger"),
    tabChart: document.querySelector("#tab-chart"),
    chartCanvas: document.querySelector("#profit-chart"),
    chartEmpty: document.querySelector("#chart-empty"),
    rangeProfit: document.querySelector("#range-profit"),
    totalProfit: document.querySelector("#total-profit"),
    rangeBtns: document.querySelectorAll(".range-btn"),
  };

  init();

  function init() {
    loadData();
    bindEvents();
    render();
  }

  function bindEvents() {
    els.addEntryBtn.addEventListener("click", addEntry);
    els.tabLedger.addEventListener("click", () => switchTab("ledger"));
    els.tabChart.addEventListener("click", () => switchTab("chart"));
    els.rangeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.chartRange = btn.dataset.range;
        els.rangeBtns.forEach((b) => b.classList.toggle("active", b === btn));
        renderChart();
      });
    });
    window.addEventListener("resize", () => {
      if (state.activeTab === "chart") renderChart();
    });
  }

  function switchTab(tab) {
    state.activeTab = tab;
    els.ledgerView.classList.toggle("hidden", tab !== "ledger");
    els.chartView.classList.toggle("hidden", tab !== "chart");
    els.tabLedger.classList.toggle("active", tab === "ledger");
    els.tabChart.classList.toggle("active", tab === "chart");
    els.tabLedger.setAttribute("aria-selected", tab === "ledger");
    els.tabChart.setAttribute("aria-selected", tab === "chart");
    if (tab === "chart") renderChart();
  }

  function loadData() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw?.entries) {
        state.baseTotal = raw.baseTotal !== undefined ? toNumber(raw.baseTotal) : DEFAULT_BASE_TOTAL;
        state.entries = normalizeEntries(raw.entries);
        return;
      }
      if (Array.isArray(raw)) {
        state.baseTotal = DEFAULT_BASE_TOTAL;
        state.entries = normalizeEntries(raw);
      }
    } catch (_) {}
  }

  function normalizeEntries(entries) {
    return entries.map((entry) => {
      if (entry.profit !== undefined) return entry;
      const investment = toNumber(entry.investment);
      const prize = toNumber(entry.prize);
      return { ...entry, profit: prize - investment };
    });
  }

  function saveData() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ baseTotal: state.baseTotal, entries: state.entries })
    );
  }

  function createId() {
    return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function formatDateLabel(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    return h >= 18 ? `${m}.${d}晚` : `${m}.${d}`;
  }

  function parseEntryDate(label) {
    const match = String(label).match(/^(\d{1,2})\.(\d{1,2})(晚)?$/);
    if (!match) return null;
    const year = new Date().getFullYear();
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    const date = new Date(year, month, day);
    if (match[3]) date.setHours(20, 0, 0, 0);
    return date;
  }

  function toNumber(value) {
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function calcPrize(entry) {
    return entry.investment + getProfit(entry);
  }

  function getProfit(entry) {
    return toNumber(entry.profit);
  }

  function isHit(entry) {
    return getProfit(entry) > entry.investment;
  }

  function getResultText(entry) {
    return isHit(entry) ? "中" : "不中";
  }

  function getSortedEntries() {
    return [...state.entries].sort((a, b) => {
      const da = parseEntryDate(a.date)?.getTime() ?? 0;
      const db = parseEntryDate(b.date)?.getTime() ?? 0;
      return da - db || state.entries.indexOf(a) - state.entries.indexOf(b);
    });
  }

  function getCumulativeMap() {
    const map = new Map();
    let total = state.baseTotal;
    getSortedEntries().forEach((entry) => {
      total += getProfit(entry);
      map.set(entry.id, total);
    });
    return map;
  }

  function getFinalTotal() {
    return state.baseTotal + getSortedEntries().reduce((sum, entry) => sum + getProfit(entry), 0);
  }

  function addEntry() {
    const entry = {
      id: createId(),
      date: formatDateLabel(new Date()),
      investment: 0,
      profit: 0,
    };
    state.entries.unshift(entry);
    saveData();
    render();
    const input = els.ledgerBody.querySelector(`tr[data-id="${entry.id}"] [data-field="date"]`);
    input?.focus();
    input?.select();
  }

  function deleteEntry(id) {
    if (!confirm("确定删除这条记录吗？")) return;
    state.entries = state.entries.filter((e) => e.id !== id);
    saveData();
    render();
  }

  function updateEntry(id, field, value) {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return;
    if (field === "investment" || field === "profit") {
      entry[field] = toNumber(value);
    } else {
      entry[field] = value;
    }
    saveData();
    render();
  }

  function render() {
    const cumulative = getCumulativeMap();
    const sorted = getSortedEntries().reverse();

    els.ledgerBody.innerHTML = "";
    els.emptyState.classList.toggle("hidden", sorted.length > 0);
    if (!sorted.length) {
      els.emptyState.innerHTML = `<p>暂无记录，起始总计 ${formatNum(state.baseTotal)}</p><p>点击「新增」添加每日方案</p>`;
    }

    sorted.forEach((entry) => {
      const profit = getProfit(entry);
      const prize = calcPrize(entry);
      const hit = isHit(entry);
      const row = document.createElement("tr");
      row.dataset.id = entry.id;

      row.innerHTML = `
        <td><input class="cell-input" data-field="date" value="${esc(entry.date)}" /></td>
        <td><input class="cell-input cell-num" data-field="investment" type="number" step="0.01" value="${entry.investment || ""}" placeholder="0" /></td>
        <td class="cell-result${hit ? " is-hit" : ""}">${getResultText(entry)}</td>
        <td class="cell-prize">${formatNum(prize)}</td>
        <td><input class="cell-input cell-num" data-field="profit" type="number" step="0.01" value="${entry.profit !== 0 ? entry.profit : ""}" placeholder="0" /></td>
        <td class="cell-cumulative">${formatNum(cumulative.get(entry.id) ?? 0)}</td>
        <td><button class="delete-btn" type="button" title="删除">×</button></td>
      `;

      bindRowEvents(row, entry);
      els.ledgerBody.appendChild(row);
    });

    if (state.activeTab === "chart") renderChart();
  }

  function bindRowEvents(row, entry) {
    row.querySelectorAll("[data-field]").forEach((input) => {
      const field = input.dataset.field;
      input.addEventListener("change", (e) => {
        const value = field === "date" ? e.target.value.trim() : e.target.value;
        updateEntry(entry.id, field, value);
      });
    });
    row.querySelector(".delete-btn").addEventListener("click", () => deleteEntry(entry.id));
  }

  function getRangeStart(range) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const map = { week: 7, month: 30, "3months": 90, "6months": 180, year: 365 };
    start.setDate(start.getDate() - (map[range] || 7) + 1);
    return start;
  }

  function getChartData() {
    const start = getRangeStart(state.chartRange);
    const sorted = getSortedEntries();
    const points = [];
    let cumulative = state.baseTotal;
    let rangeProfit = 0;

    sorted.forEach((entry) => {
      cumulative += getProfit(entry);
      const date = parseEntryDate(entry.date);
      if (!date || date < start) return;
      rangeProfit += getProfit(entry);
      points.push({ label: entry.date, value: cumulative });
    });

    return { points, totalCumulative: getFinalTotal(), rangeProfit };
  }

  function renderChart() {
    const { points, totalCumulative, rangeProfit } = getChartData();
    els.chartEmpty.classList.toggle("hidden", points.length > 0);
    els.rangeProfit.textContent = formatNum(rangeProfit);
    els.rangeProfit.className = rangeProfit >= 0 ? "positive" : "negative";
    els.totalProfit.textContent = formatNum(totalCumulative);
    els.totalProfit.className = totalCumulative >= 0 ? "positive" : "negative";

    const canvas = els.chartCanvas;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    if (!points.length) return;

    const padding = { top: 20, right: 16, bottom: 36, left: 48 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    const values = points.map((p) => p.value);
    let minV = Math.min(0, ...values);
    let maxV = Math.max(0, ...values);
    if (minV === maxV) { minV -= 100; maxV += 100; }
    const range = maxV - minV;

    const toX = (i) => padding.left + (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW);
    const toY = (v) => padding.top + chartH - ((v - minV) / range) * chartH;

    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();
    }

    if (minV < 0 && maxV > 0) {
      const zeroY = toY(0);
      ctx.strokeStyle = "#ccc";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(W - padding.right, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = "#e91e8c";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.value);
      ctx.fillStyle = "#e91e8c";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#888";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = maxV - (range / 4) * i;
      const y = padding.top + (chartH / 4) * i;
      ctx.fillText(formatNum(val), padding.left - 6, y + 4);
    }

    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.ceil(points.length / 6));
    points.forEach((p, i) => {
      if (i % labelStep !== 0 && i !== points.length - 1) return;
      ctx.fillText(p.label, toX(i), H - 8);
    });
  }

  function formatNum(n) {
    const num = toNumber(n);
    if (num === 0) return "0";
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  }

  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
})();
