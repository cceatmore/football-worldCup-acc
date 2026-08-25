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
    normalizeRemark,
    getRemarkChartSeries,
    REMARK_OPTIONS,
    DEFAULT_REMARK,
  } = window.Ledger;

  const REMARK_COLORS = {
    ch: "#1a73e8",
    hy: "#43a047",
    hz: "#fb8c00",
    me: "",
  };

  const state = {
    baseTotal: DEFAULT_BASE_TOTAL,
    entries: [],
    foldedBefore: [],
    title: DEFAULT_TITLE,
    themeColor: DEFAULT_THEME_COLOR,
    activeTab: "ledger",
    chartRange: "week",
    remarkChartRange: "month",
    chartRemarks: { ch: true, hy: true, hz: true, me: true },
    addRemark: DEFAULT_REMARK,
  };

  const els = {
    ledgerView: document.querySelector("#ledger-view"),
    chartView: document.querySelector("#chart-view"),
    ledgerBody: document.querySelector("#ledger-body"),
    emptyState: document.querySelector("#empty-state"),
    addEntryBtn: document.querySelector("#add-entry-btn"),
    addModal: document.querySelector("#add-modal"),
    addInvestmentInput: document.querySelector("#add-investment-input"),
    addRemarkPicks: document.querySelector("#add-remark-picks"),
    addConfirmBtn: document.querySelector("#add-confirm-btn"),
    remarkPopover: document.querySelector("#remark-popover"),
    tableWrap: document.querySelector(".table-wrap"),
    remarkBtns: document.querySelectorAll(".remark-btn"),
    appTitle: document.querySelector("#app-title"),
    settingsBtn: document.querySelector("#settings-btn"),
    settingsModal: document.querySelector("#settings-modal"),
    settingsTitleInput: document.querySelector("#settings-title-input"),
    settingsColorInput: document.querySelector("#settings-color-input"),
    settingsConfirmBtn: document.querySelector("#settings-confirm-btn"),
    tabLedger: document.querySelector("#tab-ledger"),
    tabChart: document.querySelector("#tab-chart"),
    chartCanvas: document.querySelector("#profit-chart"),
    chartEmpty: document.querySelector("#chart-empty"),
    remarkChartCanvas: document.querySelector("#remark-chart"),
    remarkChartEmpty: document.querySelector("#remark-chart-empty"),
    rangeProfit: document.querySelector("#range-profit"),
    totalProfit: document.querySelector("#total-profit"),
    rangeBtns: document.querySelectorAll(".chart-range-bar:not(.remark-range-bar) .range-btn"),
    remarkRangeBtns: document.querySelectorAll(".remark-range-bar .range-btn"),
  };

  init();

  function init() {
    bindMobileLock();
    loadData();
    applySettings();
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
    els.addRemarkPicks?.querySelectorAll(".remark-pick").forEach((btn) => {
      btn.addEventListener("click", () => setAddRemark(btn.dataset.remark));
    });
    document.addEventListener("pointerdown", (e) => {
      if (els.remarkPopover.classList.contains("hidden")) return;
      if (els.remarkPopover.contains(e.target) || e.target.closest(".cell-remark")) return;
      closeRemarkPopover();
    });
    els.tableWrap?.addEventListener("scroll", closeRemarkPopover, { passive: true });
    els.settingsBtn.addEventListener("click", openSettingsModal);
    els.settingsConfirmBtn.addEventListener("click", confirmSettings);
    els.settingsModal.querySelectorAll("[data-close-settings]").forEach((el) => {
      el.addEventListener("click", closeSettingsModal);
    });
    els.settingsTitleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmSettings();
      }
    });
    els.settingsColorInput.addEventListener("input", (e) => {
      previewTheme(e.target.value);
      markActivePreset(e.target.value);
    });
    els.settingsModal.querySelectorAll(".color-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        els.settingsColorInput.value = btn.dataset.color;
        previewTheme(btn.dataset.color);
        markActivePreset(btn.dataset.color);
      });
    });
    els.tabLedger.addEventListener("click", () => switchTab("ledger"));
    els.tabChart.addEventListener("click", () => switchTab("chart"));
    els.remarkBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const remark = btn.dataset.remark;
        state.chartRemarks[remark] = !state.chartRemarks[remark];
        btn.classList.toggle("active", state.chartRemarks[remark]);
        renderRemarkChart();
      });
    });
    els.rangeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.chartRange = btn.dataset.range;
        els.rangeBtns.forEach((b) => b.classList.toggle("active", b === btn));
        renderTotalChart();
      });
    });
    els.remarkRangeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.remarkChartRange = btn.dataset.range;
        els.remarkRangeBtns.forEach((b) => b.classList.toggle("active", b === btn));
        renderRemarkChart();
      });
    });
    window.addEventListener("resize", () => {
      closeRemarkPopover();
      if (state.activeTab === "chart") renderChart();
    });
  }

  function switchTab(tab) {
    closeRemarkPopover();
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
        applyStoredSettings(raw);
        saveData();
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
      const date = normalizeDateLabel(entry.date);
      const investment = toNumber(entry.investment);
      const remark = normalizeRemark(entry.remark);
      if (entry.prize !== undefined) {
        return { ...entry, id, date, investment, prize: toNumber(entry.prize), remark };
      }
      if (entry.profit !== undefined) {
        return { ...entry, id, date, investment, prize: investment + toNumber(entry.profit), remark };
      }
      return { ...entry, id, date, investment, prize: 0, remark };
    });
  }

  function applyStoredSettings(raw) {
    const settings = normalizeSettings(raw);
    state.title = settings.title;
    state.themeColor = settings.themeColor;
  }

  function applyTheme(hex) {
    const theme = themeFromColor(hex);
    const root = document.documentElement;
    root.style.setProperty("--pink", theme.color);
    root.style.setProperty("--pink-dark", theme.dark);
    root.style.setProperty("--pink-light", theme.light);
    return theme;
  }

  function applySettings() {
    applyTheme(state.themeColor);
    if (els.appTitle) els.appTitle.textContent = state.title;
    document.title = state.title;
  }

  function previewTheme(hex) {
    applyTheme(hex);
  }

  function markActivePreset(hex) {
    const color = normalizeSettings({ themeColor: hex }).themeColor;
    els.settingsModal.querySelectorAll(".color-swatch").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.color === color);
    });
  }

  function openSettingsModal() {
    els.settingsTitleInput.value = state.title;
    els.settingsColorInput.value = state.themeColor;
    markActivePreset(state.themeColor);
    els.settingsModal.classList.remove("hidden");
    requestAnimationFrame(() => els.settingsTitleInput.focus());
  }

  function closeSettingsModal() {
    els.settingsModal.classList.add("hidden");
    applySettings();
  }

  function confirmSettings() {
    const settings = normalizeSettings({
      title: els.settingsTitleInput.value,
      themeColor: els.settingsColorInput.value,
    });
    state.title = settings.title;
    state.themeColor = settings.themeColor;
    saveData();
    applySettings();
    els.settingsModal.classList.add("hidden");
    if (state.activeTab === "chart") renderChart();
  }

  function saveData() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        baseTotal: state.baseTotal,
        entries: state.entries,
        foldedBefore: state.foldedBefore,
        title: state.title,
        themeColor: state.themeColor,
      })
    );
  }

  function createId() {
    return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

  function setAddRemark(remark) {
    state.addRemark = normalizeRemark(remark) || DEFAULT_REMARK;
    els.addRemarkPicks?.querySelectorAll(".remark-pick").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.remark === state.addRemark);
    });
  }

  function openAddModal() {
    closeRemarkPopover();
    els.addInvestmentInput.value = "";
    setAddRemark(DEFAULT_REMARK);
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
      ...createEntryFromInvestment(raw, formatDateLabel(new Date()), state.addRemark),
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
    } else if (field === "remark") {
      entry.remark = normalizeRemark(value);
    } else {
      entry[field] = value;
    }
    if (!options.skipSave) saveData();
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

  function formatSigned(n) {
    const num = toNumber(n);
    if (num > 0) return `+${formatNum(num)}`;
    return formatNum(num);
  }

  function remarkLabel(current) {
    return normalizeRemark(current) || "—";
  }

  function closeRemarkPopover() {
    if (!els.remarkPopover) return;
    els.remarkPopover.classList.add("hidden");
    els.remarkPopover.innerHTML = "";
    delete els.remarkPopover.dataset.entryId;
  }

  function positionRemarkPopover(anchor) {
    const pop = els.remarkPopover;
    const rect = anchor.getBoundingClientRect();
    const pad = 8;
    const width = Math.min(168, window.innerWidth - pad * 2);
    pop.style.width = `${width}px`;
    pop.style.visibility = "hidden";
    pop.classList.remove("hidden");
    const height = pop.offsetHeight;
    let left = rect.left + rect.width / 2 - width / 2;
    let top = rect.bottom + 4;
    left = Math.min(Math.max(pad, left), window.innerWidth - width - pad);
    if (top + height > window.innerHeight - pad) {
      top = Math.max(pad, rect.top - height - 4);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.visibility = "";
  }

  function openRemarkPopover(anchor, entry) {
    const selected = normalizeRemark(entry.remark);
    const items = ["", ...REMARK_OPTIONS].map((item) => {
      const on = item === selected ? " is-on" : "";
      const label = item || "清空";
      return `<button type="button" class="remark-pop-item${on}" data-remark="${item}" role="option">${label}</button>`;
    });
    els.remarkPopover.dataset.entryId = entry.id;
    els.remarkPopover.innerHTML = items.join("");
    els.remarkPopover.querySelectorAll(".remark-pop-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateEntry(entry.id, "remark", btn.dataset.remark);
        const trigger = document.querySelector(`tr[data-id="${entry.id}"] .cell-remark`);
        if (trigger) trigger.textContent = remarkLabel(btn.dataset.remark);
        closeRemarkPopover();
      });
    });
    positionRemarkPopover(anchor);
  }

  function remarkColor(remark) {
    if (remark === "me") return state.themeColor || "#e91e8c";
    return REMARK_COLORS[remark] || "#888";
  }

  function getEnabledRemarks() {
    return REMARK_OPTIONS.filter((item) => state.chartRemarks[item]);
  }

  function toggleFoldAt(key) {
    state.foldedBefore = toggleFold(state.foldedBefore, key);
    saveData();
    render();
  }

  function renderFoldRow(segment, cumulative) {
    const last = segment.entries[segment.entries.length - 1];
    const summary = getFoldSummary(segment, cumulative.get(last.id) ?? 0);
    const rangeClass = summary.rangeProfit >= 0 ? "positive" : "negative";
    const row = document.createElement("tr");
    row.className = "fold-row";
    row.innerHTML = `
      <td class="cell-date">
        <div class="date-cell">
          <button type="button" class="fold-btn is-on" data-fold-key="${esc(segment.key)}" title="展开">▼</button>
          <span class="date-text">${esc(summary.time)}</span>
        </div>
      </td>
      <td class="cell-count">${summary.count}条</td>
      <td class="cell-result">—</td>
      <td class="cell-range-label">区间</td>
      <td class="cell-profit ${rangeClass}">${formatSigned(summary.rangeProfit)}</td>
      <td class="cell-cumulative">${formatNum(summary.total)}</td>
      <td></td>
      <td></td>
    `;
    row.querySelector(".fold-btn").addEventListener("click", () => toggleFoldAt(segment.key));
    els.ledgerBody.appendChild(row);
  }

  function renderEntryRow(entry, cumulative) {
    const profit = getProfit(entry);
    const row = document.createElement("tr");
    row.dataset.id = entry.id;
    if (profit > 0) row.classList.add("is-hit");

    row.innerHTML = `
      <td class="cell-date">
        <div class="date-cell">
          <button type="button" class="fold-btn" data-fold-key="${esc(entry.id)}" title="折叠至本行（含本行）">▲</button>
          <span class="date-text">${esc(entry.date)}</span>
        </div>
      </td>
      <td><input class="cell-input cell-num" data-field="investment" type="text" inputmode="decimal" value="${entry.investment || ""}" placeholder="0" /></td>
      <td class="cell-result">${getResultText(entry)}</td>
      <td><input class="cell-input cell-num" data-field="prize" type="text" inputmode="decimal" value="${entry.prize !== 0 ? entry.prize : ""}" placeholder="0" /></td>
      <td class="cell-profit">${formatNum(profit)}</td>
      <td class="cell-cumulative">${formatNum(cumulative.get(entry.id) ?? 0)}</td>
      <td>
        <button type="button" class="cell-remark" data-field="remark">${esc(remarkLabel(entry.remark))}</button>
      </td>
      <td><button class="delete-btn" type="button" title="删除">×</button></td>
    `;

    bindRowEvents(row, entry);
    row.querySelector(".fold-btn").addEventListener("click", () => toggleFoldAt(entry.id));
    els.ledgerBody.appendChild(row);
  }

  function render() {
    closeRemarkPopover();
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
      segment.entries.forEach((entry) => {
        renderEntryRow(entry, cumulative);
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
    row.querySelector(".cell-remark")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (els.remarkPopover.dataset.entryId === entry.id && !els.remarkPopover.classList.contains("hidden")) {
        closeRemarkPopover();
        return;
      }
      openRemarkPopover(e.currentTarget, entry);
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

  function prepareCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { ctx, W: rect.width, H: rect.height };
  }

  function drawChartBase(ctx, W, H, labels, values) {
    const padding = { top: 20, right: 16, bottom: 36, left: 48 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    let minV = Math.min(0, ...values);
    let maxV = Math.max(0, ...values);
    if (minV === maxV) {
      minV -= 100;
      maxV += 100;
    }
    const range = maxV - minV;
    const toX = (i) => padding.left + (labels.length === 1 ? chartW / 2 : (i / (labels.length - 1)) * chartW);
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

    ctx.fillStyle = "#888";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = maxV - (range / 4) * i;
      const y = padding.top + (chartH / 4) * i;
      ctx.fillText(formatNum(val), padding.left - 6, y + 4);
    }

    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.ceil(labels.length / 6));
    labels.forEach((label, i) => {
      if (i % labelStep !== 0 && i !== labels.length - 1) return;
      ctx.fillText(label, toX(i), H - 8);
    });

    return { toX, toY };
  }

  function drawSeries(ctx, values, toX, toY, color, radius) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = toX(i);
      const y = toY(value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    values.forEach((value, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(toX(i), toY(value), radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function renderTotalChart() {
    const { points, totalCumulative, rangeProfit } = getChartData();
    els.chartEmpty.classList.toggle("hidden", points.length > 0);
    els.rangeProfit.textContent = formatNum(rangeProfit);
    els.rangeProfit.className = rangeProfit >= 0 ? "positive" : "negative";
    els.totalProfit.textContent = formatNum(totalCumulative);
    els.totalProfit.className = totalCumulative >= 0 ? "positive" : "negative";

    const { ctx, W, H } = prepareCanvas(els.chartCanvas);
    if (!points.length) return;
    const { toX, toY } = drawChartBase(
      ctx,
      W,
      H,
      points.map((p) => p.label),
      points.map((p) => p.value)
    );
    drawSeries(ctx, points.map((p) => p.value), toX, toY, state.themeColor, 4);
  }

  function renderRemarkChart() {
    const start = getRangeStart(state.remarkChartRange);
    const enabled = getEnabledRemarks();
    const { series } = getRemarkChartSeries(getSortedEntries(), start, enabled);
    const labelSet = [];
    const seen = new Set();
    enabled.forEach((remark) => {
      (series[remark] || []).forEach((point) => {
        if (seen.has(point.label)) return;
        seen.add(point.label);
        labelSet.push(point.label);
      });
    });
    labelSet.sort((a, b) => (parseEntryDate(a)?.getTime() ?? 0) - (parseEntryDate(b)?.getTime() ?? 0));

    const aligned = {};
    enabled.forEach((remark) => {
      const map = new Map((series[remark] || []).map((point) => [point.label, point.value]));
      let last = 0;
      aligned[remark] = labelSet.map((label) => {
        if (map.has(label)) last = map.get(label);
        return last;
      });
    });

    const drawable = enabled.filter((remark) => (series[remark] || []).length);
    els.remarkChartEmpty.classList.toggle("hidden", drawable.length > 0);

    const { ctx, W, H } = prepareCanvas(els.remarkChartCanvas);
    if (!drawable.length) return;

    const { toX, toY } = drawChartBase(
      ctx,
      W,
      H,
      labelSet,
      drawable.flatMap((remark) => aligned[remark])
    );
    drawable.forEach((remark) => {
      drawSeries(ctx, aligned[remark], toX, toY, remarkColor(remark), 3);
    });
  }

  function renderChart() {
    renderTotalChart();
    renderRemarkChart();
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
