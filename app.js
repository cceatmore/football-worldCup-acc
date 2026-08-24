(function () {
  "use strict";

  const STORAGE_KEY = "football-ledger-simple-v1";
  const DEFAULT_BASE_TOTAL = -10000;
  const {
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
  } = window.Ledger;

  const state = {
    baseTotal: DEFAULT_BASE_TOTAL,
    entries: [],
    foldedBefore: [],
    activeTab: "ledger",
    chartRange: "week",
  };

  const els = {
    ledgerView: document.querySelector("#ledger-view"),
    chartView: document.querySelector("#chart-view"),
    ledgerBody: document.querySelector("#ledger-body"),
    emptyState: document.querySelector("#empty-state"),
    addEntryBtn: document.querySelector("#add-entry-btn"),
    addModal: document.querySelector("#add-modal"),
    addInvestmentInput: document.querySelector("#add-investment-input"),
    addConfirmBtn: document.querySelector("#add-confirm-btn"),
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
    bindMobileLock();
    loadData();
    bindEvents();
    render();
  }

  function bindMobileLock() {
    ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
      document.addEventListener(eventName, (e) => e.preventDefault(), { passive: false });
    });

    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 1) e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener("dblclick", (e) => e.preventDefault());
  }

  function bindEvents() {
    els.addEntryBtn.addEventListener("click", openAddModal);
    els.addConfirmBtn.addEventListener("click", confirmAddEntry);
    els.addModal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeAddModal);
    });
    els.addInvestmentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAddEntry();
      }
    });
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
        state.foldedBefore = normalizeFoldedBefore(raw.foldedBefore);
        return;
      }
      if (Array.isArray(raw)) {
        state.baseTotal = DEFAULT_BASE_TOTAL;
        state.entries = normalizeEntries(raw);
        state.foldedBefore = [];
      }
    } catch (_) {}
  }

  function normalizeEntries(entries) {
    return entries.map((entry) => {
      const id = entry.id || createId();
      const investment = toNumber(entry.investment);
      if (entry.prize !== undefined) {
        return { ...entry, id, investment, prize: toNumber(entry.prize) };
      }
      if (entry.profit !== undefined) {
        return { ...entry, id, investment, prize: investment + toNumber(entry.profit) };
      }
      return { ...entry, id, investment, prize: 0 };
    });
  }

  function saveData() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        baseTotal: state.baseTotal,
        entries: state.entries,
        foldedBefore: state.foldedBefore,
      })
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

  function getCumulativeMap() {
    const sorted = getSortedEntries();
    const totals = computeRunningTotals(state.baseTotal, sorted);
    const map = new Map();
    sorted.forEach((entry, i) => map.set(entry.id, totals[i]));
    return map;
  }

  function isHit(entry) {
    return getPrize(entry) > 0;
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

  function getFinalTotal() {
    const sorted = getSortedEntries();
    const totals = computeRunningTotals(state.baseTotal, sorted);
    return totals.length ? totals[totals.length - 1] : state.baseTotal;
  }

  function openAddModal() {
    els.addInvestmentInput.value = "";
    els.addModal.classList.remove("hidden");
    requestAnimationFrame(() => els.addInvestmentInput.focus());
  }

  function closeAddModal() {
    els.addModal.classList.add("hidden");
  }

  function confirmAddEntry() {
    const raw = els.addInvestmentInput.value.trim();
    if (!raw) {
      els.addInvestmentInput.focus();
      return;
    }
    const entry = {
      id: createId(),
      ...createEntryFromInvestment(raw, formatDateLabel(new Date())),
    };
    state.entries.push(entry);
    saveData();
    closeAddModal();
    render();
  }

  function deleteEntry(id) {
    if (!confirm("确定删除这条记录吗？")) return;
    state.entries = state.entries.filter((e) => e.id !== id);
    saveData();
    render();
  }

  function updateEntry(id, field, value, options = {}) {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return;
    if (field === "investment" || field === "prize") {
      entry[field] = toNumber(value);
    } else {
      entry[field] = value;
    }
    if (!options.skipSave) saveData();
    if (field === "date") {
      render();
      return;
    }
    updateComputedCells();
  }

  function updateComputedCells() {
    const cumulative = getCumulativeMap();
    els.ledgerBody.querySelectorAll("tr[data-id]").forEach((row) => {
      const entry = state.entries.find((e) => e.id === row.dataset.id);
      if (!entry) return;
      const profit = getProfit(entry);
      row.classList.toggle("is-hit", profit > 0);
      const resultCell = row.querySelector(".cell-result");
      const profitCell = row.querySelector(".cell-profit");
      const totalCell = row.querySelector(".cell-cumulative");
      if (resultCell) resultCell.textContent = getResultText(entry);
      if (profitCell) profitCell.textContent = formatNum(profit);
      if (totalCell) totalCell.textContent = formatNum(cumulative.get(entry.id) ?? 0);
    });
  }

  function canFoldAt(sorted, date) {
    const cutoff = parseEntryDate(date)?.getTime() ?? 0;
    return sorted.some((entry) => (parseEntryDate(entry.date)?.getTime() ?? 0) < cutoff);
  }

  function toggleFoldAt(key) {
    state.foldedBefore = toggleFold(state.foldedBefore, key);
    saveData();
    render();
  }

  function renderFoldRow(segment, cumulative) {
    const last = segment.entries[segment.entries.length - 1];
    const summary = getFoldSummary(segment, cumulative.get(last.id) ?? 0);
    const row = document.createElement("tr");
    row.className = "fold-row";
    row.innerHTML = `
      <td colspan="7">
        <button type="button" class="fold-summary" data-fold-key="${esc(segment.key)}">
          <span class="fold-arrow">▶</span>
          <span class="fold-item"><em>时间</em>${esc(summary.time)}</span>
          <span class="fold-item"><em>数量</em>${summary.count}</span>
          <span class="fold-item fold-total"><em>总计</em>${formatNum(summary.total)}</span>
        </button>
      </td>
    `;
    row.querySelector(".fold-summary").addEventListener("click", () => toggleFoldAt(segment.key));
    els.ledgerBody.appendChild(row);
  }

  function renderEntryRow(entry, cumulative, sorted, showFoldBtn) {
    const profit = getProfit(entry);
    const row = document.createElement("tr");
    row.dataset.id = entry.id;
    if (profit > 0) row.classList.add("is-hit");
    const folded = state.foldedBefore.includes(entry.date);

    row.innerHTML = `
      <td>
        <div class="date-cell">
          ${
            showFoldBtn
              ? `<button class="fold-btn${folded ? " is-on" : ""}" type="button" data-fold-key="${esc(entry.date)}" title="向上折叠 ${esc(entry.date)} 之前">▲</button>`
              : `<span class="fold-spacer"></span>`
          }
          <input class="cell-input" data-field="date" value="${esc(entry.date)}" />
        </div>
      </td>
      <td><input class="cell-input cell-num" data-field="investment" type="text" inputmode="decimal" value="${entry.investment || ""}" placeholder="0" /></td>
      <td class="cell-result">${getResultText(entry)}</td>
      <td><input class="cell-input cell-num" data-field="prize" type="text" inputmode="decimal" value="${entry.prize !== 0 ? entry.prize : ""}" placeholder="0" /></td>
      <td class="cell-profit">${formatNum(profit)}</td>
      <td class="cell-cumulative">${formatNum(cumulative.get(entry.id) ?? 0)}</td>
      <td><button class="delete-btn" type="button" title="删除">×</button></td>
    `;

    bindRowEvents(row, entry);
    row.querySelector(".fold-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      toggleFoldAt(entry.date);
    });
    els.ledgerBody.appendChild(row);
  }

  function render() {
    const cumulative = getCumulativeMap();
    const sorted = getSortedEntries();

    els.ledgerBody.innerHTML = "";
    els.emptyState.classList.toggle("hidden", sorted.length > 0);
    if (!sorted.length) {
      els.emptyState.innerHTML = `<p>暂无记录，起始总计 ${formatNum(state.baseTotal)}</p><p>点击「新增」添加每日方案</p>`;
    }

    const segments = getFoldSegments(sorted, state.foldedBefore);
    segments.forEach((segment) => {
      if (segment.type === "fold") {
        renderFoldRow(segment, cumulative);
        return;
      }
      segment.entries.forEach((entry, index) => {
        const firstOfDate = index === 0 || entry.date !== segment.entries[index - 1].date;
        renderEntryRow(entry, cumulative, sorted, firstOfDate && canFoldAt(sorted, entry.date));
      });
    });

    if (state.activeTab === "chart") renderChart();
  }

  function bindRowEvents(row, entry) {
    row.querySelectorAll("[data-field]").forEach((input) => {
      const field = input.dataset.field;
      input.addEventListener("input", (e) => {
        if (field === "investment" || field === "prize") {
          updateEntry(entry.id, field, e.target.value, { skipSave: true });
        }
      });
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
