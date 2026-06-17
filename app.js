(function () {
  "use strict";

  const STORAGE_KEY = "football-ledger-v2";
  const LEGACY_STORAGE_KEY = "football-ledger-v1";
  const SESSION_KEY = "football-ledger-current-user";
  const BEIJING_TZ = "Asia/Shanghai";

  const playGroups = [
    { type: "胜平负", options: ["主胜", "平", "客胜"] },
    { type: "让球胜平负", options: ["让胜", "让平", "让负"] },
    {
      type: "比分",
      options: [
        "1:0", "2:0", "2:1", "3:0", "3:1", "3:2", "4:0", "4:1", "4:2", "5:0", "5:1", "5:2", "胜其他",
        "0:0", "1:1", "2:2", "3:3", "平其他",
        "0:1", "0:2", "1:2", "0:3", "1:3", "2:3", "0:4", "1:4", "2:4", "0:5", "1:5", "2:5", "负其他",
      ],
    },
    { type: "总进球", options: ["0球", "1球", "2球", "3球", "4球", "5球", "6球", "7+球"] },
    { type: "半全场", options: ["胜胜", "胜平", "胜负", "平胜", "平平", "平负", "负胜", "负平", "负负"] },
  ];

  const schemeBetTypeOptions = ["单关", "2串1", "3串1", "4串1", "5串1", "6串1", "7串1", "8串1"];

  const worldCupMatches = [
    { code: "M01", league: "世界杯A组", homeTeam: "墨西哥", awayTeam: "南非", matchDate: "2026-06-12T03:00", note: "" },
    { code: "M02", league: "世界杯A组", homeTeam: "韩国", awayTeam: "捷克", matchDate: "2026-06-12T10:00", note: "" },
    { code: "M03", league: "世界杯B组", homeTeam: "加拿大", awayTeam: "波黑", matchDate: "2026-06-13T03:00", note: "" },
    { code: "M04", league: "世界杯D组", homeTeam: "美国", awayTeam: "巴拉圭", matchDate: "2026-06-13T09:00", note: "" },
    { code: "M05", league: "世界杯C组", homeTeam: "海地", awayTeam: "苏格兰", matchDate: "2026-06-14T09:00", note: "" },
    { code: "M06", league: "世界杯D组", homeTeam: "澳大利亚", awayTeam: "土耳其", matchDate: "2026-06-13T12:00", note: "" },
    { code: "M07", league: "世界杯C组", homeTeam: "巴西", awayTeam: "摩洛哥", matchDate: "2026-06-14T06:00", note: "" },
    { code: "M08", league: "世界杯B组", homeTeam: "卡塔尔", awayTeam: "瑞士", matchDate: "2026-06-14T03:00", note: "" },
    { code: "M09", league: "世界杯E组", homeTeam: "科特迪瓦", awayTeam: "厄瓜多尔", matchDate: "2026-06-15T07:00", note: "" },
    { code: "M10", league: "世界杯E组", homeTeam: "德国", awayTeam: "库拉索", matchDate: "2026-06-15T01:00", note: "" },
    { code: "M11", league: "世界杯F组", homeTeam: "荷兰", awayTeam: "日本", matchDate: "2026-06-15T04:00", note: "" },
    { code: "M12", league: "世界杯F组", homeTeam: "瑞典", awayTeam: "突尼斯", matchDate: "2026-06-15T10:00", note: "" },
    { code: "M13", league: "世界杯H组", homeTeam: "沙特", awayTeam: "乌拉圭", matchDate: "2026-06-16T06:00", note: "" },
    { code: "M14", league: "世界杯H组", homeTeam: "西班牙", awayTeam: "佛得角", matchDate: "2026-06-16T00:00", note: "" },
    { code: "M15", league: "世界杯G组", homeTeam: "伊朗", awayTeam: "新西兰", matchDate: "2026-06-16T09:00", note: "" },
    { code: "M16", league: "世界杯G组", homeTeam: "比利时", awayTeam: "埃及", matchDate: "2026-06-16T03:00", note: "" },
    { code: "M17", league: "世界杯I组", homeTeam: "法国", awayTeam: "塞内加尔", matchDate: "2026-06-17T03:00", note: "" },
    { code: "M18", league: "世界杯I组", homeTeam: "伊拉克", awayTeam: "挪威", matchDate: "2026-06-17T06:00", note: "" },
    { code: "M19", league: "世界杯J组", homeTeam: "阿根廷", awayTeam: "阿尔及利亚", matchDate: "2026-06-17T09:00", note: "" },
    { code: "M20", league: "世界杯J组", homeTeam: "奥地利", awayTeam: "约旦", matchDate: "2026-06-16T12:00", note: "" },
    { code: "M21", league: "世界杯L组", homeTeam: "加纳", awayTeam: "巴拿马", matchDate: "2026-06-18T07:00", note: "" },
    { code: "M22", league: "世界杯L组", homeTeam: "英格兰", awayTeam: "克罗地亚", matchDate: "2026-06-18T04:00", note: "" },
    { code: "M23", league: "世界杯K组", homeTeam: "葡萄牙", awayTeam: "刚果（金）", matchDate: "2026-06-18T01:00", note: "" },
    { code: "M24", league: "世界杯K组", homeTeam: "乌兹别克斯坦", awayTeam: "哥伦比亚", matchDate: "2026-06-18T10:00", note: "" },
    { code: "M25", league: "世界杯A组", homeTeam: "捷克", awayTeam: "南非", matchDate: "2026-06-19T00:00", note: "" },
    { code: "M26", league: "世界杯B组", homeTeam: "瑞士", awayTeam: "波黑", matchDate: "2026-06-19T03:00", note: "" },
    { code: "M27", league: "世界杯B组", homeTeam: "加拿大", awayTeam: "卡塔尔", matchDate: "2026-06-19T06:00", note: "" },
    { code: "M28", league: "世界杯A组", homeTeam: "墨西哥", awayTeam: "韩国", matchDate: "2026-06-19T09:00", note: "" },
    { code: "M29", league: "世界杯C组", homeTeam: "巴西", awayTeam: "海地", matchDate: "2026-06-20T09:00", note: "" },
    { code: "M30", league: "世界杯C组", homeTeam: "苏格兰", awayTeam: "摩洛哥", matchDate: "2026-06-20T06:00", note: "" },
    { code: "M31", league: "世界杯D组", homeTeam: "土耳其", awayTeam: "巴拉圭", matchDate: "2026-06-20T11:00", note: "" },
    { code: "M32", league: "世界杯D组", homeTeam: "美国", awayTeam: "澳大利亚", matchDate: "2026-06-20T03:00", note: "" },
    { code: "M33", league: "世界杯E组", homeTeam: "德国", awayTeam: "科特迪瓦", matchDate: "2026-06-21T04:00", note: "" },
    { code: "M34", league: "世界杯E组", homeTeam: "厄瓜多尔", awayTeam: "库拉索", matchDate: "2026-06-21T08:00", note: "" },
    { code: "M35", league: "世界杯F组", homeTeam: "荷兰", awayTeam: "瑞典", matchDate: "2026-06-21T01:00", note: "" },
    { code: "M36", league: "世界杯F组", homeTeam: "突尼斯", awayTeam: "日本", matchDate: "2026-06-20T12:00", note: "" },
    { code: "M37", league: "世界杯H组", homeTeam: "乌拉圭", awayTeam: "佛得角", matchDate: "2026-06-22T06:00", note: "" },
    { code: "M38", league: "世界杯H组", homeTeam: "西班牙", awayTeam: "沙特", matchDate: "2026-06-22T00:00", note: "" },
    { code: "M39", league: "世界杯G组", homeTeam: "比利时", awayTeam: "伊朗", matchDate: "2026-06-22T03:00", note: "" },
    { code: "M40", league: "世界杯G组", homeTeam: "新西兰", awayTeam: "埃及", matchDate: "2026-06-22T09:00", note: "" },
    { code: "M41", league: "世界杯I组", homeTeam: "挪威", awayTeam: "塞内加尔", matchDate: "2026-06-23T08:00", note: "" },
    { code: "M42", league: "世界杯I组", homeTeam: "法国", awayTeam: "伊拉克", matchDate: "2026-06-23T05:00", note: "" },
    { code: "M43", league: "世界杯J组", homeTeam: "阿根廷", awayTeam: "奥地利", matchDate: "2026-06-23T01:00", note: "" },
    { code: "M44", league: "世界杯J组", homeTeam: "约旦", awayTeam: "阿尔及利亚", matchDate: "2026-06-23T11:00", note: "" },
    { code: "M45", league: "世界杯L组", homeTeam: "英格兰", awayTeam: "加纳", matchDate: "2026-06-24T04:00", note: "" },
    { code: "M46", league: "世界杯L组", homeTeam: "巴拿马", awayTeam: "克罗地亚", matchDate: "2026-06-24T07:00", note: "" },
    { code: "M47", league: "世界杯K组", homeTeam: "葡萄牙", awayTeam: "乌兹别克斯坦", matchDate: "2026-06-24T01:00", note: "" },
    { code: "M48", league: "世界杯K组", homeTeam: "哥伦比亚", awayTeam: "刚果（金）", matchDate: "2026-06-24T10:00", note: "" },
    { code: "M49", league: "世界杯C组", homeTeam: "苏格兰", awayTeam: "巴西", matchDate: "2026-06-25T06:00", note: "" },
    { code: "M50", league: "世界杯C组", homeTeam: "摩洛哥", awayTeam: "海地", matchDate: "2026-06-25T06:00", note: "" },
    { code: "M51", league: "世界杯B组", homeTeam: "瑞士", awayTeam: "加拿大", matchDate: "2026-06-25T03:00", note: "" },
    { code: "M52", league: "世界杯B组", homeTeam: "波黑", awayTeam: "卡塔尔", matchDate: "2026-06-25T03:00", note: "" },
    { code: "M53", league: "世界杯A组", homeTeam: "捷克", awayTeam: "墨西哥", matchDate: "2026-06-25T09:00", note: "" },
    { code: "M54", league: "世界杯A组", homeTeam: "南非", awayTeam: "韩国", matchDate: "2026-06-25T09:00", note: "" },
    { code: "M55", league: "世界杯E组", homeTeam: "库拉索", awayTeam: "科特迪瓦", matchDate: "2026-06-26T04:00", note: "" },
    { code: "M56", league: "世界杯E组", homeTeam: "厄瓜多尔", awayTeam: "德国", matchDate: "2026-06-26T04:00", note: "" },
    { code: "M57", league: "世界杯F组", homeTeam: "日本", awayTeam: "瑞典", matchDate: "2026-06-26T07:00", note: "" },
    { code: "M58", league: "世界杯F组", homeTeam: "突尼斯", awayTeam: "荷兰", matchDate: "2026-06-26T07:00", note: "" },
    { code: "M59", league: "世界杯D组", homeTeam: "土耳其", awayTeam: "美国", matchDate: "2026-06-26T10:00", note: "" },
    { code: "M60", league: "世界杯D组", homeTeam: "巴拉圭", awayTeam: "澳大利亚", matchDate: "2026-06-26T10:00", note: "" },
    { code: "M61", league: "世界杯I组", homeTeam: "挪威", awayTeam: "法国", matchDate: "2026-06-27T03:00", note: "" },
    { code: "M62", league: "世界杯I组", homeTeam: "塞内加尔", awayTeam: "伊拉克", matchDate: "2026-06-27T03:00", note: "" },
    { code: "M63", league: "世界杯G组", homeTeam: "埃及", awayTeam: "伊朗", matchDate: "2026-06-27T11:00", note: "" },
    { code: "M64", league: "世界杯G组", homeTeam: "新西兰", awayTeam: "比利时", matchDate: "2026-06-27T11:00", note: "" },
    { code: "M65", league: "世界杯H组", homeTeam: "佛得角", awayTeam: "沙特", matchDate: "2026-06-27T08:00", note: "" },
    { code: "M66", league: "世界杯H组", homeTeam: "乌拉圭", awayTeam: "西班牙", matchDate: "2026-06-27T08:00", note: "" },
    { code: "M67", league: "世界杯L组", homeTeam: "巴拿马", awayTeam: "英格兰", matchDate: "2026-06-28T05:00", note: "" },
    { code: "M68", league: "世界杯L组", homeTeam: "克罗地亚", awayTeam: "加纳", matchDate: "2026-06-28T05:00", note: "" },
    { code: "M69", league: "世界杯J组", homeTeam: "阿尔及利亚", awayTeam: "奥地利", matchDate: "2026-06-28T10:00", note: "" },
    { code: "M70", league: "世界杯J组", homeTeam: "约旦", awayTeam: "阿根廷", matchDate: "2026-06-28T10:00", note: "" },
    { code: "M71", league: "世界杯K组", homeTeam: "哥伦比亚", awayTeam: "葡萄牙", matchDate: "2026-06-28T07:30", note: "" },
    { code: "M72", league: "世界杯K组", homeTeam: "刚果（金）", awayTeam: "乌兹别克斯坦", matchDate: "2026-06-28T07:30", note: "" },
  ];

  const legacyWorldCupSeedKeys = new Set([
    "周六001-巴西-韩国",
    "周六002-日本-澳大利亚",
    "周六003-法国-德国",
    "周六004-西班牙-意大利",
    "周日001-阿根廷-荷兰",
    "周日002-英格兰-葡萄牙",
    "周日003-克罗地亚-摩洛哥",
    "周日004-美国-墨西哥",
  ]);

  const teamNameEnMap = {
    墨西哥: ["Mexico"],
    南非: ["South Africa"],
    韩国: ["South Korea", "Korea Republic"],
    捷克: ["Czech Republic", "Czechia"],
    加拿大: ["Canada"],
    波黑: ["Bosnia and Herzegovina", "Bosnia-Herzegovina"],
    美国: ["United States", "USA"],
    巴拉圭: ["Paraguay"],
    海地: ["Haiti"],
    苏格兰: ["Scotland"],
    澳大利亚: ["Australia"],
    土耳其: ["Turkey", "Türkiye"],
    巴西: ["Brazil"],
    摩洛哥: ["Morocco"],
    卡塔尔: ["Qatar"],
    瑞士: ["Switzerland"],
    科特迪瓦: ["Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire"],
    厄瓜多尔: ["Ecuador"],
    德国: ["Germany"],
    库拉索: ["Curaçao", "Curacao"],
    荷兰: ["Netherlands"],
    日本: ["Japan"],
    瑞典: ["Sweden"],
    突尼斯: ["Tunisia"],
    沙特: ["Saudi Arabia"],
    乌拉圭: ["Uruguay"],
    西班牙: ["Spain"],
    佛得角: ["Cape Verde"],
    伊朗: ["Iran"],
    新西兰: ["New Zealand"],
    比利时: ["Belgium"],
    埃及: ["Egypt"],
    法国: ["France"],
    塞内加尔: ["Senegal"],
    伊拉克: ["Iraq"],
    挪威: ["Norway"],
    阿根廷: ["Argentina"],
    阿尔及利亚: ["Algeria"],
    奥地利: ["Austria"],
    约旦: ["Jordan"],
    加纳: ["Ghana"],
    巴拿马: ["Panama"],
    英格兰: ["England"],
    克罗地亚: ["Croatia"],
    葡萄牙: ["Portugal"],
    "刚果（金）": ["DR Congo", "Congo DR", "Congo-Kinshasa", "Democratic Republic of Congo"],
    乌兹别克斯坦: ["Uzbekistan"],
    哥伦比亚: ["Colombia"],
  };

  const state = {
    db: loadDb(),
    currentUser: localStorage.getItem(SESSION_KEY) || "",
    activeView: "matches",
    matchSubView: "active",
    search: "",
    profitFilter: "all",
    dataRange: "all",
    dataMatchId: "all",
    editingMatchId: "",
    editingResultMatchId: "",
    settlingSchemeId: "",
    editingSchemeId: "",
    schemeDraft: {},
    schemeBetTypes: [],
    schemeAddMatchId: "",
    schemeVisibleMatchIds: [],
    scrollYBeforeModal: 0,
    refreshInFlight: null,
    syncToastTimer: null,
  };

  const els = {
    authView: document.querySelector("#auth-view"),
    mainView: document.querySelector("#main-view"),
    loginTab: document.querySelector("#login-tab"),
    registerTab: document.querySelector("#register-tab"),
    loginForm: document.querySelector("#login-form"),
    registerForm: document.querySelector("#register-form"),
    loginUsername: document.querySelector("#login-username"),
    loginPassword: document.querySelector("#login-password"),
    registerNickname: document.querySelector("#register-nickname"),
    registerUsername: document.querySelector("#register-username"),
    registerPassword: document.querySelector("#register-password"),
    authMessage: document.querySelector("#auth-message"),
    welcomeTitle: document.querySelector("#welcome-title"),
    refreshMatchesBtn: document.querySelector("#refresh-matches-btn"),
    openSchemeModalBtn: document.querySelector("#open-scheme-modal"),
    matchesViewTab: document.querySelector("#matches-view-tab"),
    schemesViewTab: document.querySelector("#schemes-view-tab"),
    dataViewTab: document.querySelector("#data-view-tab"),
    matchesView: document.querySelector("#matches-view"),
    schemesView: document.querySelector("#schemes-view"),
    dataView: document.querySelector("#data-view"),
    filtersPanel: document.querySelector("#filters-panel"),
    filterRow: document.querySelector("#filter-row"),
    viewTitle: document.querySelector("#view-title"),
    matchViewSwitch: document.querySelector("#match-view-switch"),
    matchActiveBtn: document.querySelector("#match-active-btn"),
    matchHistoryBtn: document.querySelector("#match-history-btn"),
    totalCost: document.querySelector("#total-cost"),
    totalReturn: document.querySelector("#total-return"),
    totalProfit: document.querySelector("#total-profit"),
    totalCount: document.querySelector("#total-count"),
    searchInput: document.querySelector("#search-input"),
    profitFilter: document.querySelector("#scheme-profit-filter"),
    matchList: document.querySelector("#match-list"),
    schemeList: document.querySelector("#scheme-list"),
    matchEmptyState: document.querySelector("#match-empty-state"),
    matchEmptyTitle: document.querySelector("#match-empty-title"),
    schemeEmptyState: document.querySelector("#scheme-empty-state"),
    matchRowTemplate: document.querySelector("#match-row-template"),
    schemeCardTemplate: document.querySelector("#scheme-card-template"),
    dataRange: document.querySelector("#data-range"),
    dataMatchFilter: document.querySelector("#data-match-filter"),
    todaySchemeStat: document.querySelector("#today-scheme-stat"),
    weekSchemeStat: document.querySelector("#week-scheme-stat"),
    allProfitStat: document.querySelector("#all-profit-stat"),
    matchSchemeStat: document.querySelector("#match-scheme-stat"),
    dataFilterProfitStat: document.querySelector("#data-filter-profit-stat"),
    dataFilterLossStat: document.querySelector("#data-filter-loss-stat"),
    dataFilterPendingStat: document.querySelector("#data-filter-pending-stat"),
    dataSchemeList: document.querySelector("#data-scheme-list"),
    dataEmptyState: document.querySelector("#data-empty-state"),
    dataSchemeRowTemplate: document.querySelector("#data-scheme-row-template"),
    matchModal: document.querySelector("#match-modal"),
    schemeModal: document.querySelector("#scheme-modal"),
    resultModal: document.querySelector("#result-modal"),
    settleModal: document.querySelector("#settle-modal"),
    matchForm: document.querySelector("#match-form"),
    matchModalTitle: document.querySelector("#match-modal-title"),
    homeTeam: document.querySelector("#home-team"),
    awayTeam: document.querySelector("#away-team"),
    matchLeague: document.querySelector("#match-league"),
    matchCode: document.querySelector("#match-code"),
    matchDate: document.querySelector("#match-date"),
    matchNote: document.querySelector("#match-note"),
    schemeForm: document.querySelector("#scheme-form"),
    schemeModalTitle: document.querySelector("#scheme-modal-title"),
    schemeName: document.querySelector("#scheme-name"),
    schemeBetTypeGroup: document.querySelector("#scheme-bet-type-group"),
    schemeMatchSelect: document.querySelector("#scheme-match-select"),
    schemeAddMatchTrigger: document.querySelector("#scheme-add-match-trigger"),
    schemeAddMatchPanel: document.querySelector("#scheme-add-match-panel"),
    schemeMatchPicker: document.querySelector("#scheme-match-picker"),
    schemeAddMatchBtn: document.querySelector("#scheme-add-match-btn"),
    schemePickSummary: document.querySelector("#scheme-pick-summary"),
    schemeCost: document.querySelector("#scheme-cost"),
    schemeNote: document.querySelector("#scheme-note"),
    resultForm: document.querySelector("#result-form"),
    resultMatchTitle: document.querySelector("#result-match-title"),
    resultHomeScore: document.querySelector("#result-home-score"),
    resultAwayScore: document.querySelector("#result-away-score"),
    resultHalfHomeScore: document.querySelector("#result-half-home-score"),
    resultHalfAwayScore: document.querySelector("#result-half-away-score"),
    settleForm: document.querySelector("#settle-form"),
    settleSchemeTitle: document.querySelector("#settle-scheme-title"),
    settleReturn: document.querySelector("#settle-return"),
    syncToast: document.querySelector("#sync-toast"),
  };

  init();

  function init() {
    migrateAllUsers();
    bindEvents();
    warnIfStorageUnreliable();
    if (state.currentUser && state.db.users[state.currentUser]) {
      showMain();
    } else {
      state.currentUser = "";
      localStorage.removeItem(SESSION_KEY);
      showAuth();
    }
  }

  function bindEvents() {
    els.loginTab.addEventListener("click", () => switchAuthMode("login"));
    els.registerTab.addEventListener("click", () => switchAuthMode("register"));
    els.loginForm.addEventListener("submit", handleLogin);
    els.registerForm.addEventListener("submit", handleRegister);
    els.matchesViewTab.addEventListener("click", () => switchView("matches"));
    els.schemesViewTab.addEventListener("click", () => switchView("schemes"));
    els.dataViewTab.addEventListener("click", () => switchView("data"));
    els.openSchemeModalBtn.addEventListener("click", openSchemeModal);
    els.refreshMatchesBtn.addEventListener("click", handleRefreshMatches);
    els.matchActiveBtn.addEventListener("click", () => switchMatchSubView("active"));
    els.matchHistoryBtn.addEventListener("click", () => switchMatchSubView("history"));
    els.matchForm.addEventListener("submit", handleSaveMatch);
    els.schemeForm.addEventListener("submit", handleSaveScheme);
    els.schemeAddMatchBtn.addEventListener("click", handleAddSchemeMatch);
    els.schemeAddMatchTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleSchemeMatchSelectPanel();
    });
    els.schemeMatchPicker.addEventListener("click", handleSchemePickerClick);
    els.resultForm.addEventListener("submit", handleSaveResult);
    els.settleForm.addEventListener("submit", handleSaveSettlement);
    els.searchInput.addEventListener("input", () => {
      state.search = els.searchInput.value.trim().toLowerCase();
      render();
    });
    els.profitFilter.addEventListener("click", (event) => {
      const button = event.target.closest("[data-profit-filter]");
      if (!button || !els.profitFilter.contains(button)) return;
      const value = button.dataset.profitFilter;
      if (!value || state.profitFilter === value) return;
      state.profitFilter = value;
      syncProfitFilterButtons();
      render();
    });
    els.dataRange.addEventListener("change", () => {
      state.dataRange = els.dataRange.value;
      renderDataView(getCurrentUser());
    });
    els.dataMatchFilter.addEventListener("change", () => {
      state.dataMatchId = els.dataMatchFilter.value;
      renderDataView(getCurrentUser());
    });
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", closeAllModals);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllMatchMenus();
        closeAllModals();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".match-actions-menu")) closeAllMatchMenus();
      if (els.schemeAddMatchPanel.classList.contains("hidden")) return;
      if (!event.target.closest(".scheme-match-select")) closeSchemeMatchSelectPanel();
    });
    bindStorageSync();
  }

  function bindStorageSync() {
    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY && event.key !== SESSION_KEY && event.key !== null) return;
      syncFromStorageAndRender();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncFromStorageAndRender();
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) syncFromStorageAndRender();
    });
    window.addEventListener("focus", syncFromStorageAndRender);
  }

  function reloadDbFromStorage() {
    state.db = loadDb();
    const sessionUser = localStorage.getItem(SESSION_KEY) || "";
    if (sessionUser && state.db.users[sessionUser]) {
      state.currentUser = sessionUser;
      return;
    }
    if (state.currentUser && !state.db.users[state.currentUser]) {
      state.currentUser = "";
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function syncFromStorageAndRender() {
    reloadDbFromStorage();
    if (state.currentUser && state.db.users[state.currentUser]) {
      if (els.mainView.classList.contains("hidden")) {
        showMain();
        return;
      }
      render();
      return;
    }
    if (!els.authView.classList.contains("hidden")) return;
    showAuth();
  }

  function bindMatchActionMenu(node, match) {
    const trigger = node.querySelector(".match-menu-trigger");
    const popup = node.querySelector(".match-action-popup");
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = popup.classList.contains("hidden");
      closeAllMatchMenus();
      if (willOpen) {
        popup.classList.remove("hidden");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
    popup.querySelector(".edit-match").addEventListener("click", (event) => {
      event.stopPropagation();
      closeAllMatchMenus();
      openEditMatchModal(match);
    });
    popup.querySelector(".edit-result").addEventListener("click", (event) => {
      event.stopPropagation();
      closeAllMatchMenus();
      openResultModal(match);
    });
    popup.querySelector(".delete-match").addEventListener("click", (event) => {
      event.stopPropagation();
      closeAllMatchMenus();
      deleteMatch(match);
    });
  }

  function closeAllMatchMenus() {
    document.querySelectorAll(".match-action-popup").forEach((popup) => popup.classList.add("hidden"));
    document.querySelectorAll(".match-menu-trigger").forEach((button) => button.setAttribute("aria-expanded", "false"));
  }

  async function handleLogin(event) {
    event.preventDefault();
    const username = normalizeUsername(els.loginUsername.value);
    const user = state.db.users[username];
    if (!user || user.passwordHash !== (await hashPassword(els.loginPassword.value))) {
      setAuthMessage("账号或密码不正确。");
      return;
    }
    state.currentUser = username;
    localStorage.setItem(SESSION_KEY, username);
    els.loginForm.reset();
    showMain();
  }

  async function handleRegister(event) {
    event.preventDefault();
    const username = normalizeUsername(els.registerUsername.value);
    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
      setAuthMessage("账号需要 3-24 位，只能包含字母、数字、下划线或短横线。");
      return;
    }
    if (state.db.users[username]) {
      setAuthMessage("这个账号已经注册，请换一个账号。");
      return;
    }
    state.db.users[username] = {
      username,
      nickname: els.registerNickname.value.trim(),
      passwordHash: await hashPassword(els.registerPassword.value),
      createdAt: new Date().toISOString(),
      matches: createWorldCupMatches(),
      schemes: [],
    };
    saveDb();
    state.currentUser = username;
    localStorage.setItem(SESSION_KEY, username);
    els.registerForm.reset();
    showMain();
  }

  function switchAuthMode(mode) {
    const isLogin = mode === "login";
    els.loginTab.classList.toggle("active", isLogin);
    els.registerTab.classList.toggle("active", !isLogin);
    els.loginForm.classList.toggle("hidden", !isLogin);
    els.registerForm.classList.toggle("hidden", isLogin);
    setAuthMessage("");
  }

  function updateFilterControls() {
    const showSchemeFilters = state.activeView === "schemes";
    const showMatchHistorySearch = state.activeView === "matches" && state.matchSubView === "history";
    const showSearch = showSchemeFilters || showMatchHistorySearch;

    els.filterRow.classList.toggle("hidden", !showSearch);
    els.searchInput.classList.toggle("hidden", !showSearch);
    els.profitFilter.classList.toggle("hidden", !showSchemeFilters);
    els.searchInput.placeholder = showMatchHistorySearch
      ? "搜索球队、赛事或编号"
      : "搜索球队、赛事、方案或玩法";
  }

  function switchView(view) {
    state.activeView = view;
    els.matchesViewTab.classList.toggle("active", view === "matches");
    els.schemesViewTab.classList.toggle("active", view === "schemes");
    els.dataViewTab.classList.toggle("active", view === "data");
    els.matchesView.classList.toggle("hidden", view !== "matches");
    els.schemesView.classList.toggle("hidden", view !== "schemes");
    els.dataView.classList.toggle("hidden", view !== "data");
    els.filtersPanel.classList.toggle("hidden", view === "data");
    if (view === "matches" && state.matchSubView === "active") {
      state.search = "";
      els.searchInput.value = "";
    }
    syncProfitFilterButtons();
    els.matchViewSwitch.classList.toggle("hidden", view !== "matches");
    updateFilterControls();
    updateViewTitle();
    render();
  }

  function switchMatchSubView(subView) {
    state.matchSubView = subView;
    els.matchActiveBtn.classList.toggle("active", subView === "active");
    els.matchHistoryBtn.classList.toggle("active", subView === "history");
    if (subView === "active") {
      state.search = "";
      els.searchInput.value = "";
    }
    updateFilterControls();
    updateViewTitle();
    renderMatches(getCurrentUser());
  }

  function updateViewTitle() {
    if (state.activeView === "matches") {
      els.viewTitle.textContent = state.matchSubView === "history" ? "赛事历史" : "当前赛事";
      return;
    }
    els.viewTitle.textContent = state.activeView === "schemes" ? "方案管理" : "数据";
  }

  function showAuth() {
    els.authView.classList.remove("hidden");
    els.mainView.classList.add("hidden");
    switchAuthMode("login");
  }

  function showMain() {
    ensureCurrentUserShape();
    ensureWorldCupMatches();
    els.authView.classList.add("hidden");
    els.mainView.classList.remove("hidden");
    switchView(state.activeView);
    void refreshMatches({ auto: true });
  }

  function render() {
    const user = getCurrentUser();
    els.welcomeTitle.textContent = `${user.nickname || user.username} 的足球记账`;
    renderDashboard(user);
    renderMatches(user);
    renderSchemes(user);
    renderDataView(user);
  }

  function renderDashboard(user) {
    const totalCost = user.schemes.reduce((sum, scheme) => sum + scheme.cost, 0);
    const totalReturn = user.schemes.reduce(
      (sum, scheme) => sum + (isSchemeReturnFilled(scheme) ? scheme.returnAmount : 0),
      0
    );
    const totalProfit = totalReturn - totalCost;
    els.totalCost.textContent = formatMoney(totalCost);
    els.totalReturn.textContent = formatMoney(totalReturn);
    els.totalProfit.textContent = formatMoney(totalProfit);
    els.totalProfit.className = totalProfit >= 0 ? "profit" : "loss";
    els.totalCount.textContent = `${user.matches.length} / ${user.schemes.length}`;
  }

  function renderMatches(user) {
    if (state.activeView !== "matches") return;
    els.matchList.innerHTML = "";
    const subviewMatches = getMatchesForCurrentSubView(user);
    const nearestDayKey = getNearestMatchDayKey(subviewMatches);
    const matches = subviewMatches.filter(matchMatchesSearch);
    els.matchEmptyTitle.textContent = state.matchSubView === "history"
      ? (state.search ? "未找到匹配的历史赛事" : "暂无赛事历史")
      : "暂无未结束赛事";
    els.matchEmptyState.classList.toggle("hidden", matches.length > 0);
    const highlightNearestDay = state.matchSubView === "active" && nearestDayKey;
    let nearestDayGroup = null;

    matches.forEach((match) => {
      const isNearestDay = highlightNearestDay && getMatchDayKey(match) === nearestDayKey;
      let parent = els.matchList;

      if (isNearestDay) {
        if (!nearestDayGroup) {
          nearestDayGroup = document.createElement("div");
          nearestDayGroup.className = "match-day-group match-day-group-highlight";
          els.matchList.appendChild(nearestDayGroup);
        }
        parent = nearestDayGroup;
      } else {
        nearestDayGroup = null;
      }

      const node = els.matchRowTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector(".match-code").textContent = match.code || "";
      node.querySelector(".match-title").textContent = getMatchTitle(match, false);
      node.querySelector(".match-note").textContent = match.note || "";
      node.querySelector(".match-league").textContent = match.league || "-";
      node.querySelector(".match-date").textContent = match.matchDate ? formatDate(match.matchDate) : "-";
      const resultBtn = node.querySelector(".match-result-btn");
      const hasResult = hasMatchResult(match);
      const totalGoals = getTotalGoals(match);
      const halfFullText = getHalfFullText(match);
      node.querySelector(".match-score").textContent = hasResult ? getResultText(match) : "";
      node.querySelector(".match-goals").textContent = hasResult ? `总进球 ${totalGoals}` : "";
      node.querySelector(".match-half-full").textContent = hasResult && halfFullText ? `半全场 ${halfFullText}` : "";
      resultBtn.classList.toggle("has-result", hasResult);
      resultBtn.classList.toggle("is-empty", !hasResult);
      node.querySelector(".match-scheme-count").textContent = `${getSchemesByMatch(match.id).length} 个方案`;
      parent.appendChild(node);
    });
  }

  function getMatchesForCurrentSubView(user) {
    const unfinished = user.matches.filter((match) => !hasMatchResult(match));
    const finished = user.matches.filter((match) => hasMatchResult(match));
    if (state.matchSubView === "history") {
      return finished.sort((a, b) => getMatchTime(b) - getMatchTime(a));
    }
    return unfinished.sort((a, b) => getMatchTime(a) - getMatchTime(b));
  }

  function getMatchDayKey(match) {
    if (!match.matchDate) return "";
    const stored = parseStoredMatchDate(match.matchDate);
    if (stored) return stored.slice(0, 10);
    const utcMs = Date.parse(match.matchDate);
    if (Number.isNaN(utcMs)) return "";
    return utcMsToWallTimeLocalIso(utcMs, BEIJING_TZ).slice(0, 10);
  }

  function getNearestMatchDayKey(matches) {
    const firstMatchWithDay = matches.find((match) => getMatchDayKey(match));
    return firstMatchWithDay ? getMatchDayKey(firstMatchWithDay) : "";
  }

  async function handleRefreshMatches() {
    await refreshMatches({ manual: true });
  }

  async function refreshMatches({ auto = false, manual = false } = {}) {
    if (state.refreshInFlight) return state.refreshInFlight;

    const button = els.refreshMatchesBtn;
    const originalText = button.textContent;
    state.refreshInFlight = (async () => {
      button.disabled = true;
      button.textContent = "同步中...";
      showSyncToast("正在同步赛事数据，请稍候…", "loading");
      try {
        const remoteMatches = await fetchRemoteMatchData();
        const stats = applyRemoteMatchSync(remoteMatches);
        saveDb();
        render();
        const message = stats.updated || stats.resultsAdded
          ? `同步完成：更新 ${stats.updated} 场，新增赛果 ${stats.resultsAdded} 场`
          : "同步完成，赛事数据已是最新";
        showSyncToast(message, "success");
      } catch (error) {
        console.error("Match sync failed", error);
        showSyncToast("同步失败，当前显示本地数据，请检查网络后重试", "error");
        if (manual) {
          setTimeout(() => {
            showSyncToast("可点击右上角「刷新比赛列表」手动重试", "error", 5000);
          }, 4200);
        }
      } finally {
        button.disabled = false;
        button.textContent = originalText;
        state.refreshInFlight = null;
      }
    })();

    return state.refreshInFlight;
  }

  function showSyncToast(message, type = "info", duration = 3200) {
    clearTimeout(state.syncToastTimer);
    els.syncToast.textContent = message;
    els.syncToast.classList.remove("hidden", "is-loading", "is-success", "is-error");
    if (type === "loading") {
      els.syncToast.classList.add("is-loading");
      return;
    }
    if (type === "success") els.syncToast.classList.add("is-success");
    if (type === "error") els.syncToast.classList.add("is-error");
    state.syncToastTimer = setTimeout(() => {
      els.syncToast.classList.add("hidden");
    }, duration);
  }

  async function fetchRemoteMatchData() {
    const errors = [];
    let primaryMatches = [];
    try {
      const response = await fetch("https://worldcup26.ir/get/games");
      if (response.ok) {
        const data = await response.json();
        const parsed = await parseWorldCup26Games(data);
        if (parsed.length) primaryMatches = parsed;
      }
    } catch (error) {
      errors.push(error);
    }

    if (!primaryMatches.length) try {
      const response = await fetch("https://wc2026.moothz.win/get/games");
      if (response.ok) {
        const data = await response.json();
        const parsed = await parseWorldCup26Games(data);
        if (parsed.length) primaryMatches = parsed;
      }
    } catch (error) {
      errors.push(error);
    }

    let espnMatches = [];
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${buildEspnDateRange()}`);
      if (response.ok) {
        const data = await response.json();
        const parsed = await parseEspnScoreboard(data);
        if (parsed.length) espnMatches = parsed;
      }
    } catch (error) {
      errors.push(error);
    }

    if (primaryMatches.length && espnMatches.length) return mergeRemoteMatchData(primaryMatches, espnMatches);
    if (primaryMatches.length) return primaryMatches;
    if (espnMatches.length) return espnMatches;

    if (errors.length) console.warn("Remote sync errors", errors);
    throw new Error("No remote match data");
  }

  function mergeRemoteMatchData(primaryMatches, scoreMatches) {
    const scoresByCode = new Map(scoreMatches.filter((match) => match.code).map((match) => [match.code, match]));
    const usedScoreKeys = new Set();
    const merged = primaryMatches.map((match) => {
      const scoreMatch = scoresByCode.get(match.code) || findScoreMatchForRemote(match, scoreMatches);
      if (!scoreMatch) return match;
      usedScoreKeys.add(getRemoteMatchKey(scoreMatch));
      if (!scoreMatch.finished || scoreMatch.homeScore === "" || scoreMatch.awayScore === "") return match;
      return {
        ...match,
        homeScore: scoreMatch.homeScore,
        awayScore: scoreMatch.awayScore,
        halfHomeScore: scoreMatch.halfHomeScore,
        halfAwayScore: scoreMatch.halfAwayScore,
        finished: true,
      };
    });
    return [
      ...merged,
      ...scoreMatches.filter((match) => !usedScoreKeys.has(getRemoteMatchKey(match))),
    ];
  }

  function findScoreMatchForRemote(match, scoreMatches) {
    if (!match.code) return null;
    return scoreMatches.find((scoreMatch) =>
      findMatchCodeByTeams(scoreMatch.homeTeamEn, scoreMatch.awayTeamEn) === match.code
    ) || null;
  }

  function getRemoteMatchKey(match) {
    return match.code || match.eventId || `${match.homeTeamEn}-${match.awayTeamEn}-${match.matchDate}`;
  }

  async function parseWorldCup26Games(data) {
    if (!Array.isArray(data?.games)) return [];
    const stadiumTimeZones = await buildStadiumTimeZoneMap(data.games);
    return data.games.map((game) => {
      const finished = String(game.finished).toUpperCase() === "TRUE";
      const group = game.group ? String(game.group).toUpperCase() : "";
      const localDate = parseWorldCup26Date(game.local_date);
      const sourceTimeZone = stadiumTimeZones.get(String(game.stadium_id)) || "America/New_York";
      return {
        code: `M${String(game.id).padStart(2, "0")}`,
        homeTeamEn: game.home_team_name_en || "",
        awayTeamEn: game.away_team_name_en || "",
        homeScore: finished ? String(game.home_score ?? "") : "",
        awayScore: finished ? String(game.away_score ?? "") : "",
        ...extractWorldCupHalfScores(game),
        matchDate: localDate ? convertWallTimeToBeijing(localDate, sourceTimeZone) : "",
        league: group ? `世界杯${group}组` : "世界杯",
        finished,
      };
    });
  }

  async function parseEspnScoreboard(data) {
    if (!Array.isArray(data?.events)) return [];
    const matches = data.events.map((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
      const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
      const finished = competition?.status?.type?.state === "post";
      const homeTeamEn = home?.team?.displayName || "";
      const awayTeamEn = away?.team?.displayName || "";
      const halfScores = extractEspnHalfScores(competition, home, away);
      return {
        eventId: event.id || competition?.id || "",
        code: findMatchCodeByTeams(homeTeamEn, awayTeamEn),
        homeTeamEn,
        awayTeamEn,
        homeScore: finished ? String(home?.score ?? "") : "",
        awayScore: finished ? String(away?.score ?? "") : "",
        halfHomeScore: finished ? halfScores.halfHomeScore : "",
        halfAwayScore: finished ? halfScores.halfAwayScore : "",
        matchDate: event.date ? utcIsoToBeijingLocalIso(event.date) : "",
        league: findPresetLeagueByTeams(homeTeamEn, awayTeamEn),
        finished,
      };
    }).filter((item) => item.homeTeamEn && item.awayTeamEn);

    await hydrateEspnHalfScoresFromSummaries(matches);
    return matches;
  }

  async function hydrateEspnHalfScoresFromSummaries(matches) {
    const missingHalfScores = matches.filter((match) =>
      match.finished
      && match.eventId
      && match.homeScore !== ""
      && match.awayScore !== ""
      && (match.halfHomeScore === "" || match.halfAwayScore === "")
    );
    if (!missingHalfScores.length) return;

    await Promise.all(missingHalfScores.map(async (match) => {
      try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${match.eventId}`);
        if (!response.ok) return;
        const data = await response.json();
        const competition = data?.header?.competitions?.[0];
        const competitors = competition?.competitors || [];
        const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
        const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
        const halfScores = extractEspnHalfScores(competition, home, away);
        if (halfScores.halfHomeScore !== "" && halfScores.halfAwayScore !== "") {
          match.halfHomeScore = halfScores.halfHomeScore;
          match.halfAwayScore = halfScores.halfAwayScore;
        }
      } catch (error) {
        console.warn("ESPN summary half-time sync failed", match.eventId, error);
      }
    }));
  }

  function extractWorldCupHalfScores(game) {
    const home = firstPresentValue(game, [
      "half_home_score",
      "home_half_score",
      "home_score_half",
      "home_ht_score",
      "ht_home_score",
      "first_half_home_score",
    ]);
    const away = firstPresentValue(game, [
      "half_away_score",
      "away_half_score",
      "away_score_half",
      "away_ht_score",
      "ht_away_score",
      "first_half_away_score",
    ]);
    return {
      halfHomeScore: home == null ? "" : String(home),
      halfAwayScore: away == null ? "" : String(away),
    };
  }

  function extractEspnHalfScores(competition, home, away) {
    const details = competition?.details;
    if (!Array.isArray(details)) return { halfHomeScore: "", halfAwayScore: "" };

    const homeTeamId = String(home?.team?.id || home?.id || "");
    const awayTeamId = String(away?.team?.id || away?.id || "");
    let halfHomeScore = 0;
    let halfAwayScore = 0;
    let hasGoalDetails = false;

    details.forEach((detail) => {
      if (isGoalDetail(detail)) hasGoalDetails = true;
      if (!isFirstHalfGoal(detail)) return;
      const teamId = String(detail.team?.id || "");
      const value = Number(detail.scoreValue || 1);
      const scoreValue = Number.isFinite(value) ? value : 1;
      if (teamId === homeTeamId) halfHomeScore += scoreValue;
      if (teamId === awayTeamId) halfAwayScore += scoreValue;
    });

    const fullHomeScore = Number(home?.score);
    const fullAwayScore = Number(away?.score);
    if (!hasGoalDetails && (fullHomeScore > 0 || fullAwayScore > 0)) {
      return { halfHomeScore: "", halfAwayScore: "" };
    }

    return {
      halfHomeScore: String(halfHomeScore),
      halfAwayScore: String(halfAwayScore),
    };
  }

  function isFirstHalfGoal(detail) {
    if (!isGoalDetail(detail)) return false;
    const displayClock = String(detail.clock?.displayValue || "");
    const minuteMatch = displayClock.match(/^(\d+)/);
    if (minuteMatch) return Number(minuteMatch[1]) <= 45;
    const clockValue = Number(detail.clock?.value);
    return Number.isFinite(clockValue) && clockValue <= 45 * 60;
  }

  function isGoalDetail(detail) {
    return Boolean(detail?.scoringPlay && !detail.shootout);
  }

  function firstPresentValue(source, keys) {
    for (const key of keys) {
      if (source?.[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
    }
    return null;
  }

  function applyRemoteMatchSync(remoteMatches) {
    const user = getCurrentUser();
    const remoteByCode = new Map();
    remoteMatches.forEach((remote) => {
      if (remote.code) remoteByCode.set(remote.code, remote);
    });
    let updated = 0;
    let resultsAdded = 0;

    user.matches.forEach((match) => {
      const remote = remoteByCode.get(match.code) || findRemoteMatchForLocal(match, remoteMatches);
      if (!remote) return;

      let changed = false;
      if (remote.matchDate && remote.matchDate !== match.matchDate) {
        match.matchDate = remote.matchDate;
        changed = true;
      }
      if (remote.league && remote.league !== match.league) {
        match.league = remote.league;
        changed = true;
      }
      if (remote.finished && remote.homeScore !== "" && remote.awayScore !== "") {
        const hadResult = hasMatchResult(match);
        match.result = {
          ...(match.result || {}),
          homeScore: remote.homeScore,
          awayScore: remote.awayScore,
          halfHomeScore: remote.halfHomeScore || "",
          halfAwayScore: remote.halfAwayScore || "",
        };
        if (!hadResult) resultsAdded += 1;
        changed = true;
      }
      if (changed) updated += 1;
    });

    return { updated, resultsAdded };
  }

  function findRemoteMatchForLocal(match, remoteMatches) {
    return remoteMatches.find((remote) => {
      if (remote.code && remote.code === match.code) return true;
      const preset = worldCupMatches.find((item) => item.code === match.code);
      if (!preset) return false;
      return matchTeamsToPreset(remote.homeTeamEn, remote.awayTeamEn, preset);
    });
  }

  function findMatchCodeByTeams(homeEn, awayEn) {
    const preset = worldCupMatches.find((match) => matchTeamsToPreset(homeEn, awayEn, match));
    return preset?.code || "";
  }

  function findPresetLeagueByTeams(homeEn, awayEn) {
    const preset = worldCupMatches.find((match) => matchTeamsToPreset(homeEn, awayEn, match));
    return preset?.league || "世界杯";
  }

  function matchTeamsToPreset(homeEn, awayEn, preset) {
    const homeAliases = teamNameEnMap[preset.homeTeam] || [preset.homeTeam];
    const awayAliases = teamNameEnMap[preset.awayTeam] || [preset.awayTeam];
    const homeOk = homeAliases.some((alias) => teamNamesMatch(homeEn, alias));
    const awayOk = awayAliases.some((alias) => teamNamesMatch(awayEn, alias));
    return homeOk && awayOk;
  }

  function teamNamesMatch(nameA, nameB) {
    const normalize = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const left = normalize(nameA);
    const right = normalize(nameB);
    if (!left || !right) return false;
    return left === right || left.includes(right) || right.includes(left);
  }

  function parseWorldCup26Date(value) {
    const match = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (!match) return "";
    const [, month, day, year, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  async function buildStadiumTimeZoneMap(games) {
    const stadiumIds = [...new Set(games.map((game) => game.stadium_id).filter(Boolean))];
    const entries = await Promise.all(stadiumIds.map(async (stadiumId) => {
      try {
        const response = await fetch(`https://worldcup26.ir/get/stadium/${stadiumId}`);
        if (!response.ok) return [String(stadiumId), "America/New_York"];
        const data = await response.json();
        return [String(stadiumId), resolveStadiumTimeZone(data.stadium)];
      } catch (error) {
        return [String(stadiumId), "America/New_York"];
      }
    }));
    return new Map(entries);
  }

  function resolveStadiumTimeZone(stadium) {
    const country = String(stadium?.country_en || "").toLowerCase();
    const region = String(stadium?.region || "").toLowerCase();
    if (country.includes("mexico")) return "America/Mexico_City";
    if (country.includes("canada")) {
      return region.includes("western") ? "America/Vancouver" : "America/Toronto";
    }
    if (country.includes("united states") || country === "usa") {
      if (region.includes("western")) return "America/Los_Angeles";
      if (region.includes("central")) return "America/Chicago";
      if (region.includes("mountain")) return "America/Denver";
      return "America/New_York";
    }
    return "America/New_York";
  }

  function getDatePartsInTimeZone(utcMs, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = {};
    formatter.formatToParts(new Date(utcMs)).forEach((part) => {
      if (part.type !== "literal") parts[part.type] = part.value;
    });
    let hour = Number(parts.hour);
    if (hour === 24) hour = 0;
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour,
      minute: Number(parts.minute),
    };
  }

  function diffWallClockMinutes(actual, desired) {
    const actualMs = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute);
    const desiredMs = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute);
    return Math.round((desiredMs - actualMs) / 60000);
  }

  function wallTimeToUtcMs(localIso, timeZone) {
    const match = String(localIso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) return NaN;
    const desired = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4]),
      minute: Number(match[5]),
    };
    let utcMs = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const actual = getDatePartsInTimeZone(utcMs, timeZone);
      const deltaMinutes = diffWallClockMinutes(actual, desired);
      if (deltaMinutes === 0) return utcMs;
      utcMs += deltaMinutes * 60000;
    }
    return utcMs;
  }

  function utcMsToWallTimeLocalIso(utcMs, timeZone) {
    const parts = getDatePartsInTimeZone(utcMs, timeZone);
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  }

  function convertWallTimeToBeijing(localIso, sourceTimeZone) {
    const utcMs = wallTimeToUtcMs(localIso, sourceTimeZone);
    if (Number.isNaN(utcMs)) return "";
    return utcMsToWallTimeLocalIso(utcMs, BEIJING_TZ);
  }

  function utcIsoToBeijingLocalIso(value) {
    const utcMs = Date.parse(value);
    if (Number.isNaN(utcMs)) return "";
    return utcMsToWallTimeLocalIso(utcMs, BEIJING_TZ);
  }

  function parseStoredMatchDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) return null;
    return match[0];
  }

  function buildEspnDateRange() {
    const dates = worldCupMatches
      .map((match) => parseStoredMatchDate(match.matchDate)?.slice(0, 10).replaceAll("-", ""))
      .filter(Boolean)
      .sort();
    if (!dates.length) return "";
    return `${shiftCompactDate(dates[0], -1)}-${shiftCompactDate(dates[dates.length - 1], 1)}`;
  }

  function shiftCompactDate(value, offsetDays) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + offsetDays);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("");
  }

  function toDateTimeLocalValue(date) {
    if (Number.isNaN(date.getTime())) return "";
    return utcMsToWallTimeLocalIso(date.getTime(), BEIJING_TZ);
  }

  function renderSchemes(user) {
    els.schemeList.innerHTML = "";
    const schemes = user.schemes.filter(matchSchemeFilters);
    els.schemeEmptyState.classList.toggle("hidden", user.schemes.length > 0);
    schemes.forEach((scheme) => {
      const node = els.schemeCardTemplate.content.firstElementChild.cloneNode(true);
      const profit = getSchemeProfit(scheme);
      const filled = isSchemeReturnFilled(scheme);
      node.querySelector(".scheme-title").textContent = scheme.name;
      node.querySelector(".scheme-meta").textContent = [
        getSchemeBetTypeText(scheme),
        `${getSchemeMatchCount(scheme)} 场`,
        scheme.note,
      ]
        .filter(Boolean)
        .join(" · ");
      const statusEl = node.querySelector(".scheme-status");
      statusEl.textContent = filled ? "已填返回" : "未填返回";
      statusEl.classList.toggle("is-filled", filled);
      statusEl.classList.toggle("is-pending", !filled);
      node.querySelector(".scheme-money").innerHTML = `
        <span class="scheme-money-tag">消费 ${formatMoney(scheme.cost)}</span>
        <span class="scheme-money-tag">返回 ${formatSchemeReturnDisplay(scheme)}</span>
        <span class="scheme-money-tag ${filled && profit >= 0 ? "profit" : filled && profit < 0 ? "loss" : ""}">盈亏 ${formatSchemeProfitDisplay(scheme)}</span>
      `;
      appendGroupedSchemePicks(node.querySelector(".scheme-picks"), scheme.picks);
      node.querySelector(".edit-scheme").addEventListener("click", () => openEditSchemeModal(scheme));
      node.querySelector(".settle-scheme").addEventListener("click", () => openSettlementModal(scheme));
      node.querySelector(".delete-scheme").addEventListener("click", () => deleteScheme(scheme));
      els.schemeList.appendChild(node);
    });
  }

  function renderDataView(user) {
    if (state.activeView !== "data") return;

    els.dataRange.value = state.dataRange;
    renderDataMatchOptions(user);
    const todaySchemes = getSchemesByRange(user.schemes, "today");
    const weekSchemes = getSchemesByRange(user.schemes, "week");
    const allSchemes = user.schemes;
    const visibleSchemes = filterDataSchemes(user.schemes);

    els.todaySchemeStat.textContent = `${todaySchemes.length} 个 / ${formatMoney(sumProfit(todaySchemes))}`;
    els.weekSchemeStat.textContent = `${weekSchemes.length} 个 / ${formatMoney(sumProfit(weekSchemes))}`;
    els.allProfitStat.textContent = formatMoney(sumProfit(allSchemes));
    els.allProfitStat.className = sumProfit(allSchemes) >= 0 ? "profit" : "loss";
    els.matchSchemeStat.textContent = `${visibleSchemes.length} 个 / ${formatMoney(sumProfit(visibleSchemes))}`;
    renderDataFilterSummary(visibleSchemes);

    els.dataSchemeList.innerHTML = "";
    els.dataEmptyState.classList.toggle("hidden", visibleSchemes.length > 0);
    visibleSchemes.forEach((scheme) => {
      const node = els.dataSchemeRowTemplate.content.firstElementChild.cloneNode(true);
      const profit = getSchemeProfit(scheme);
      const filled = isSchemeReturnFilled(scheme);
      node.querySelector(".data-scheme-name").textContent = scheme.name;
      node.querySelector(".data-scheme-matches").textContent = getSchemeMatchNames(scheme).join(" / ") || "-";
      node.querySelector(".data-scheme-date").textContent = formatDate(scheme.createdAt);
      node.querySelector(".data-scheme-cost").textContent = formatMoney(scheme.cost);
      node.querySelector(".data-scheme-return").textContent = formatSchemeReturnDisplay(scheme);
      node.querySelector(".data-scheme-profit").textContent = formatSchemeProfitDisplay(scheme);
      node.querySelector(".data-scheme-profit").classList.toggle("profit", filled && profit >= 0);
      node.querySelector(".data-scheme-profit").classList.toggle("loss", filled && profit < 0);
      els.dataSchemeList.appendChild(node);
    });
  }

  function renderDataMatchOptions(user) {
    const currentValue = state.dataMatchId;
    const rangedSchemes = getSchemesByRange(user.schemes, state.dataRange);
    const matchIdsWithSchemes = new Set(rangedSchemes.flatMap((scheme) => scheme.picks.map((pick) => pick.matchId)));
    const matchOptions = user.matches.filter((match) => matchIdsWithSchemes.has(match.id));

    els.dataMatchFilter.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "全部比赛";
    els.dataMatchFilter.appendChild(allOption);
    matchOptions.forEach((match) => {
      const option = document.createElement("option");
      option.value = match.id;
      option.textContent = [match.code, getMatchTitle(match, true)].filter(Boolean).join(" ");
      els.dataMatchFilter.appendChild(option);
    });

    const validValues = new Set(["all", ...matchOptions.map((match) => match.id)]);
    els.dataMatchFilter.value = validValues.has(currentValue) ? currentValue : "all";
    state.dataMatchId = els.dataMatchFilter.value;
  }

  function filterDataSchemes(schemes) {
    return getSchemesByRange(schemes, state.dataRange).filter((scheme) => {
      return state.dataMatchId === "all" || scheme.picks.some((pick) => pick.matchId === state.dataMatchId);
    });
  }

  function summarizeFilteredSchemes(schemes) {
    const summary = {
      profit: { count: 0, amount: 0 },
      loss: { count: 0, amount: 0 },
      pending: { count: 0, cost: 0 },
    };
    schemes.forEach((scheme) => {
      if (!isSchemeReturnFilled(scheme)) {
        summary.pending.count += 1;
        summary.pending.cost += scheme.cost || 0;
        return;
      }
      const profit = scheme.returnAmount - scheme.cost;
      if (profit > 0) {
        summary.profit.count += 1;
        summary.profit.amount += profit;
      } else if (profit < 0) {
        summary.loss.count += 1;
        summary.loss.amount += profit;
      }
    });
    return summary;
  }

  function renderDataFilterSummary(schemes) {
    const summary = summarizeFilteredSchemes(schemes);
    els.dataFilterProfitStat.textContent = `${summary.profit.count} 个 / ${formatMoney(summary.profit.amount)}`;
    els.dataFilterLossStat.textContent = `${summary.loss.count} 个 / ${formatMoney(summary.loss.amount)}`;
    els.dataFilterPendingStat.textContent = `${summary.pending.count} 个 / 消费 ${formatMoney(summary.pending.cost)}`;
  }

  function getSchemesByRange(schemes, range) {
    if (range === "all") return schemes;
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (range === "week") {
      start.setDate(start.getDate() - 6);
    }
    return schemes.filter((scheme) => {
      const createdAt = new Date(scheme.createdAt);
      return !Number.isNaN(createdAt.getTime()) && createdAt >= start;
    });
  }

  function getSchemeProfit(scheme) {
    if (!isSchemeReturnFilled(scheme)) return null;
    return scheme.returnAmount - scheme.cost;
  }

  function sumProfit(schemes) {
    return schemes.reduce((sum, scheme) => sum + (getSchemeProfit(scheme) ?? 0), 0);
  }

  function isSchemeReturnFilled(scheme) {
    if (typeof scheme.returnFilled === "boolean") return scheme.returnFilled;
    return scheme.returnAmount !== null && scheme.returnAmount !== undefined;
  }

  function normalizeSchemeReturnState(scheme) {
    if (typeof scheme.returnFilled === "boolean") return;
    scheme.returnFilled = scheme.returnAmount !== null && scheme.returnAmount !== undefined;
  }

  function formatSchemeReturnDisplay(scheme) {
    return isSchemeReturnFilled(scheme) ? formatMoney(scheme.returnAmount) : "-";
  }

  function formatSchemeProfitDisplay(scheme) {
    const profit = getSchemeProfit(scheme);
    return profit === null ? "-" : formatMoney(profit);
  }

  function getSchemeMatchCount(scheme) {
    return new Set(scheme.picks.map((pick) => pick.matchId)).size;
  }

  function appendGroupedSchemePicks(container, picks) {
    container.innerHTML = "";
    const grouped = new Map();
    picks.forEach((pick) => {
      if (!grouped.has(pick.matchId)) grouped.set(pick.matchId, []);
      grouped.get(pick.matchId).push(pick);
    });
    grouped.forEach((matchPicks, matchId) => {
      const match = findMatchById(matchId);
      const group = document.createElement("div");
      group.className = "pick-match-group";
      const title = document.createElement("strong");
      title.className = "pick-match-title";
      title.textContent = match ? getMatchTitle(match, true) : "已删除比赛";
      const options = document.createElement("div");
      options.className = "pick-match-options";
      matchPicks.forEach((pick) => {
        const line = document.createElement("span");
        line.className = "pick-option-line";
        line.textContent = `${pick.playType}：${pick.options.join(" / ")}`;
        options.appendChild(line);
      });
      group.appendChild(title);
      group.appendChild(options);
      container.appendChild(group);
    });
  }

  function getSchemeMatchNames(scheme) {
    return [...new Set(scheme.picks.map((pick) => {
      const match = findMatchById(pick.matchId);
      return match ? getMatchTitle(match, true) : "已删除比赛";
    }))];
  }

  function openAddMatchModal() {
    state.editingMatchId = "";
    els.matchModalTitle.textContent = "新增比赛";
    els.matchForm.reset();
    els.matchLeague.value = "世界杯";
    openModal(els.matchModal);
  }

  function openEditMatchModal(match) {
    state.editingMatchId = match.id;
    els.matchModalTitle.textContent = "编辑比赛";
    els.homeTeam.value = match.homeTeam;
    els.awayTeam.value = match.awayTeam;
    els.matchLeague.value = match.league || "";
    els.matchCode.value = match.code || "";
    els.matchDate.value = match.matchDate || "";
    els.matchNote.value = match.note || "";
    openModal(els.matchModal);
  }

  function handleSaveMatch(event) {
    event.preventDefault();
    const user = getCurrentUser();
    const payload = {
      homeTeam: els.homeTeam.value.trim(),
      awayTeam: els.awayTeam.value.trim(),
      league: normalizeWorldCupLeague(els.matchLeague.value),
      code: els.matchCode.value.trim(),
      matchDate: els.matchDate.value,
      note: els.matchNote.value.trim(),
    };
    if (state.editingMatchId) {
      Object.assign(findMatchById(state.editingMatchId), payload);
    } else {
      user.matches.unshift({
        id: createId(),
        ...payload,
        result: { homeScore: "", awayScore: "", halfHomeScore: "", halfAwayScore: "" },
        createdAt: new Date().toISOString(),
      });
    }
    saveDb();
    closeAllModals();
    render();
  }

  function normalizeWorldCupLeague(value) {
    const league = value.trim();
    return league.includes("世界杯") ? league : `世界杯${league ? `-${league}` : ""}`;
  }

  function openSchemeModal() {
    const user = getCurrentUser();
    if (!user.matches.length) {
      alert("暂无比赛数据。");
      return;
    }
    state.editingSchemeId = "";
    state.schemeDraft = {};
    state.schemeBetTypes = [];
    state.schemeAddMatchId = "";
    state.schemeVisibleMatchIds = [];
    els.schemeForm.reset();
    els.schemeModalTitle.textContent = "新增方案";
    els.schemeName.value = formatSchemeNameDate(new Date());
    renderSchemeBetTypes();
    renderSchemeMatchPicker();
    renderSchemeAddMatchControl();
    openModal(els.schemeModal);
  }

  function openEditSchemeModal(scheme) {
    state.editingSchemeId = scheme.id;
    state.schemeAddMatchId = "";
    loadSchemeDraftFromScheme(scheme);
    els.schemeModalTitle.textContent = "编辑方案";
    renderSchemeBetTypes();
    renderSchemeMatchPicker();
    renderSchemeAddMatchControl();
    openModal(els.schemeModal);
  }

  function loadSchemeDraftFromScheme(scheme) {
    state.schemeDraft = {};
    scheme.picks.forEach((pick) => {
      state.schemeDraft[pick.matchId] ||= {};
      state.schemeDraft[pick.matchId][pick.playType] = [...pick.options];
    });
    state.schemeVisibleMatchIds = [...new Set(scheme.picks.map((pick) => pick.matchId))];
    if (Array.isArray(scheme.betTypes) && scheme.betTypes.length) {
      state.schemeBetTypes = [...scheme.betTypes];
    } else if (scheme.betType) {
      state.schemeBetTypes = scheme.betType.split("、").map((item) => item.trim()).filter(Boolean);
    } else {
      state.schemeBetTypes = ["单关"];
    }
    els.schemeName.value = scheme.name;
    els.schemeCost.value = scheme.cost;
    els.schemeNote.value = scheme.note || "";
  }

  function getSelectableMatches(user) {
    return user.matches.filter((match) => !hasMatchResult(match));
  }

  function getHiddenSchemeMatches(user) {
    return user.matches.filter((match) => !state.schemeVisibleMatchIds.includes(match.id));
  }

  function getNearestUnfinishedMatch(matches) {
    if (!matches.length) return null;
    const sorted = [...matches].sort((a, b) => getMatchTime(a) - getMatchTime(b));
    const nearestDayKey = getNearestMatchDayKey(sorted);
    if (!nearestDayKey) return sorted[0];

    const sameDayMatches = sorted.filter((match) => getMatchDayKey(match) === nearestDayKey);
    const now = Date.now();
    const upcoming = sameDayMatches.find((match) => getMatchTime(match) >= now);
    if (upcoming) return upcoming;

    const nextUpcoming = sorted.find((match) => getMatchTime(match) >= now);
    return nextUpcoming || sameDayMatches[0] || sorted[0];
  }

  function getMatchTime(match) {
    if (!match.matchDate) return Infinity;
    const stored = parseStoredMatchDate(match.matchDate);
    const utcMs = stored ? wallTimeToUtcMs(stored, BEIJING_TZ) : Date.parse(match.matchDate);
    return Number.isNaN(utcMs) ? Infinity : utcMs;
  }

  function getVisibleSchemeMatches() {
    const validIds = new Set(getCurrentUser().matches.map((match) => match.id));
    state.schemeVisibleMatchIds = [...new Set(state.schemeVisibleMatchIds.filter((id) => validIds.has(id)))];
    return state.schemeVisibleMatchIds
      .map((id) => findMatchById(id))
      .filter(Boolean);
  }

  function ensureMatchId(match) {
    if (!match.id) {
      match.id = createId();
      saveDb();
    }
    return match.id;
  }

  function ensureUniqueMatchIds(user) {
    const seen = new Set();
    let changed = false;
    user.matches.forEach((match) => {
      if (seen.has(match.id)) {
        match.id = createId();
        changed = true;
      }
      seen.add(match.id);
    });
    if (changed) saveDb();
  }

  function renderSchemeBetTypes() {
    els.schemeBetTypeGroup.innerHTML = "";
    schemeBetTypeOptions.forEach((type) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "selection-chip";
      button.textContent = type;
      button.classList.toggle("active", state.schemeBetTypes.includes(type));
      button.addEventListener("click", () => toggleSchemeBetType(type, button));
      els.schemeBetTypeGroup.appendChild(button);
    });
  }

  function toggleSchemeBetType(type, button) {
    const selected = state.schemeBetTypes.includes(type);
    if (selected) {
      state.schemeBetTypes = state.schemeBetTypes.filter((item) => item !== type);
    } else {
      state.schemeBetTypes = [...state.schemeBetTypes, type].sort(
        (a, b) => schemeBetTypeOptions.indexOf(a) - schemeBetTypeOptions.indexOf(b)
      );
    }
    button.classList.toggle("active", !selected);
  }

  function getSchemeBetTypeText(scheme) {
    if (Array.isArray(scheme.betTypes) && scheme.betTypes.length) {
      return scheme.betTypes.join("、");
    }
    return scheme.betType || "单关";
  }

  function closeSchemeMatchSelectPanel() {
    els.schemeAddMatchPanel.classList.add("hidden");
    els.schemeAddMatchTrigger.setAttribute("aria-expanded", "false");
  }

  function toggleSchemeMatchSelectPanel() {
    if (els.schemeAddMatchTrigger.disabled) return;
    const willOpen = els.schemeAddMatchPanel.classList.contains("hidden");
    closeSchemeMatchSelectPanel();
    if (willOpen) {
      els.schemeAddMatchPanel.classList.remove("hidden");
      els.schemeAddMatchTrigger.setAttribute("aria-expanded", "true");
      scrollSchemeMatchSelectToDefault();
    }
  }

  function scrollSchemeMatchSelectToDefault() {
    const panel = els.schemeAddMatchPanel;
    const unfinishedGroup = panel.querySelector('[data-group="unfinished"]');
    const target = unfinishedGroup || panel.querySelector(".scheme-match-select-group");
    if (!target) return;
    requestAnimationFrame(() => {
      panel.scrollTop = Math.max(0, target.offsetTop - 4);
    });
  }

  function selectSchemeAddMatch(matchId, label) {
    state.schemeAddMatchId = matchId;
    els.schemeAddMatchTrigger.textContent = label;
    els.schemeAddMatchTrigger.title = label;
    closeSchemeMatchSelectPanel();
  }

  function renderSchemeAddMatchControl() {
    const user = getCurrentUser();
    const hiddenMatches = getHiddenSchemeMatches(user);
    const finishedMatches = hiddenMatches
      .filter((match) => hasMatchResult(match))
      .sort((a, b) => getMatchTime(b) - getMatchTime(a));
    const unfinishedMatches = hiddenMatches
      .filter((match) => !hasMatchResult(match))
      .sort((a, b) => getMatchTime(a) - getMatchTime(b));

    state.schemeAddMatchId = "";
    els.schemeAddMatchTrigger.textContent = "请选择赛事";
    els.schemeAddMatchTrigger.removeAttribute("title");
    els.schemeAddMatchPanel.innerHTML = "";
    closeSchemeMatchSelectPanel();

    if (!hiddenMatches.length) {
      els.schemeAddMatchPanel.innerHTML = '<p class="scheme-match-select-empty muted">已无更多可选赛事</p>';
      els.schemeAddMatchTrigger.disabled = true;
      els.schemeAddMatchBtn.disabled = true;
      return;
    }

    if (finishedMatches.length) {
      appendSchemeMatchSelectGroup("已结束", finishedMatches, els.schemeAddMatchPanel);
    }
    if (unfinishedMatches.length) {
      appendSchemeMatchSelectGroup("未结束", unfinishedMatches, els.schemeAddMatchPanel);
    }
    els.schemeAddMatchTrigger.disabled = false;
    els.schemeAddMatchBtn.disabled = false;
  }

  function appendSchemeMatchSelectGroup(label, matches, parent) {
    const group = document.createElement("div");
    group.className = "scheme-match-select-group";
    group.dataset.group = label === "未结束" ? "unfinished" : "finished";
    const title = document.createElement("div");
    title.className = "scheme-match-select-group-label";
    title.textContent = label;
    group.appendChild(title);
    matches.forEach((match) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "scheme-match-select-option";
      option.dataset.matchId = match.id;
      option.textContent = formatSchemeMatchOption(match);
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        selectSchemeAddMatch(match.id, formatSchemeMatchOption(match));
      });
      group.appendChild(option);
    });
    parent.appendChild(group);
  }

  function formatSchemeMatchOption(match) {
    const parts = [
      match.code,
      getMatchTitle(match, hasMatchResult(match)),
      match.league,
      match.matchDate ? formatDate(match.matchDate) : "",
    ].filter(Boolean);
    return parts.join(" · ");
  }

  function handleAddSchemeMatch() {
    const matchId = state.schemeAddMatchId;
    if (!matchId) {
      alert("请先选择赛事。");
      return;
    }
    if (state.schemeVisibleMatchIds.includes(matchId)) return;
    const match = findMatchById(matchId);
    if (!match) return;
    ensureMatchId(match);
    state.schemeVisibleMatchIds.push(match.id);
    els.schemeMatchPicker.appendChild(buildBuilderMatchRow(match));
    renderSchemeAddMatchControl();
    updatePickSummary();
  }

  function handleSchemePickerClick(event) {
    const removeBtn = event.target.closest(".builder-match-remove");
    if (removeBtn) {
      const row = removeBtn.closest(".builder-match");
      removeSchemeMatchBlock(row?.dataset.matchId);
      return;
    }
    const chip = event.target.closest(".selection-chip");
    if (!chip) return;
    const row = chip.closest(".builder-match");
    const matchId = row?.dataset.matchId;
    const playType = chip.dataset.playType;
    const option = chip.dataset.option;
    if (!matchId || !playType || !option) return;
    togglePick(matchId, playType, option, chip);
  }

  function removeSchemeMatchBlock(matchId) {
    if (!matchId) return;
    state.schemeVisibleMatchIds = state.schemeVisibleMatchIds.filter((id) => id !== matchId);
    delete state.schemeDraft[matchId];
    renderSchemeMatchPicker();
  }

  function buildBuilderMatchRow(match) {
    ensureMatchId(match);
    const row = document.createElement("article");
    row.className = "builder-match";
    row.dataset.matchId = match.id;
    row.innerHTML = `
      <div class="builder-match-side">
        <div class="builder-match-head">
          <div class="builder-match-info">
            <strong>${[match.code, getMatchTitle(match, false)].filter(Boolean).join(" ")}</strong>
            <span>${[match.league || "", match.matchDate ? formatDate(match.matchDate) : ""].filter(Boolean).join(" · ")}</span>
          </div>
          <button class="builder-match-remove ghost-btn" type="button">移除</button>
        </div>
      </div>
      <div class="builder-options"></div>
    `;
    const optionsWrap = row.querySelector(".builder-options");
    const draft = state.schemeDraft[match.id] || {};
    playGroups.forEach((group) => {
      const groupEl = document.createElement("div");
      groupEl.className = "play-group";
      groupEl.innerHTML = `<span>${group.type}</span>`;
      group.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "selection-chip";
        button.textContent = option;
        button.dataset.playType = group.type;
        button.dataset.option = option;
        if (draft[group.type]?.includes(option)) {
          button.classList.add("active");
        }
        groupEl.appendChild(button);
      });
      optionsWrap.appendChild(groupEl);
    });
    return row;
  }

  function renderSchemeMatchPicker() {
    els.schemeMatchPicker.innerHTML = "";
    const visibleMatches = getVisibleSchemeMatches();
    if (!visibleMatches.length) {
      const hint = document.createElement("p");
      hint.className = "scheme-picker-empty muted";
      hint.textContent = "请选择比赛并点击「添加赛事」";
      els.schemeMatchPicker.appendChild(hint);
    } else {
      visibleMatches.forEach((match) => {
        els.schemeMatchPicker.appendChild(buildBuilderMatchRow(match));
      });
    }
    renderSchemeAddMatchControl();
    updatePickSummary();
  }

  function togglePick(matchId, playType, option, button) {
    if (!matchId) return;
    state.schemeDraft[matchId] ||= {};
    const selected = state.schemeDraft[matchId][playType]?.includes(option);
    if (selected) {
      state.schemeDraft[matchId][playType] = state.schemeDraft[matchId][playType].filter((item) => item !== option);
      if (!state.schemeDraft[matchId][playType].length) delete state.schemeDraft[matchId][playType];
      if (!Object.keys(state.schemeDraft[matchId]).length) delete state.schemeDraft[matchId];
    } else {
      state.schemeDraft[matchId][playType] ||= [];
      state.schemeDraft[matchId][playType] = [...state.schemeDraft[matchId][playType], option];
    }
    button.classList.toggle("active", !selected);
    updatePickSummary();
  }

  function updatePickSummary() {
    const matchCount = Object.keys(state.schemeDraft).length;
    els.schemePickSummary.textContent = `已选 ${matchCount} 场`;
  }

  function handleSaveScheme(event) {
    event.preventDefault();
    const validMatchIds = new Set(getCurrentUser().matches.map((match) => match.id));
    const picks = Object.entries(state.schemeDraft).flatMap(([matchId, groups]) =>
      Object.entries(groups).map(([playType, options]) => ({ matchId, playType, options }))
    ).filter((pick) => validMatchIds.has(pick.matchId));
    if (!picks.length) {
      alert("请至少选择一场比赛的投注项。");
      return;
    }
    if (!state.schemeBetTypes.length) {
      alert("请至少选择一种投注方式。");
      return;
    }
    const payload = {
      name: els.schemeName.value.trim(),
      betTypes: [...state.schemeBetTypes],
      betType: state.schemeBetTypes.join("、"),
      picks,
      cost: toMoneyNumber(els.schemeCost.value),
      note: els.schemeNote.value.trim(),
    };
    if (state.editingSchemeId) {
      const scheme = findSchemeById(state.editingSchemeId);
      if (!scheme) return;
      Object.assign(scheme, payload);
    } else {
      getCurrentUser().schemes.unshift({
        id: createId(),
        ...payload,
        returnAmount: null,
        returnFilled: false,
        createdAt: new Date().toISOString(),
      });
    }
    saveDb();
    closeAllModals();
    switchView("schemes");
  }

  function openResultModal(match) {
    state.editingResultMatchId = match.id;
    els.resultMatchTitle.textContent = getMatchTitle(match, false);
    els.resultHomeScore.value = getScoreInputValue(match.result?.homeScore);
    els.resultAwayScore.value = getScoreInputValue(match.result?.awayScore);
    els.resultHalfHomeScore.value = match.result?.halfHomeScore ?? "";
    els.resultHalfAwayScore.value = match.result?.halfAwayScore ?? "";
    openModal(els.resultModal);
  }

  function handleSaveResult(event) {
    event.preventDefault();
    const match = findMatchById(state.editingResultMatchId);
    if (match) {
      match.result = {
        ...(match.result || {}),
        homeScore: els.resultHomeScore.value.trim(),
        awayScore: els.resultAwayScore.value.trim(),
        halfHomeScore: els.resultHalfHomeScore.value.trim(),
        halfAwayScore: els.resultHalfAwayScore.value.trim(),
      };
      saveDb();
    }
    closeAllModals();
    render();
  }

  function openSettlementModal(scheme) {
    state.settlingSchemeId = scheme.id;
    els.settleSchemeTitle.textContent = scheme.name;
    els.settleReturn.value = isSchemeReturnFilled(scheme) ? scheme.returnAmount : "";
    openModal(els.settleModal);
  }

  function handleSaveSettlement(event) {
    event.preventDefault();
    const scheme = findSchemeById(state.settlingSchemeId);
    if (scheme) {
      const raw = els.settleReturn.value.trim();
      if (raw === "") {
        scheme.returnFilled = false;
        scheme.returnAmount = null;
      } else {
        scheme.returnFilled = true;
        scheme.returnAmount = toMoneyNumber(raw);
      }
      saveDb();
    }
    closeAllModals();
    render();
  }

  function deleteMatch(match) {
    const relatedCount = getSchemesByMatch(match.id).length;
    const message = relatedCount
      ? `这场比赛关联 ${relatedCount} 个方案，删除后会从这些方案中移除。确定删除吗？`
      : `确定删除 ${getMatchTitle(match, false)} 吗？`;
    if (!confirm(message)) return;
    const user = getCurrentUser();
    user.matches = user.matches.filter((item) => item.id !== match.id);
    user.schemes.forEach((scheme) => {
      scheme.picks = scheme.picks.filter((pick) => pick.matchId !== match.id);
    });
    user.schemes = user.schemes.filter((scheme) => scheme.picks.length > 0);
    saveDb();
    render();
  }

  function deleteScheme(scheme) {
    if (!confirm(`确定删除方案「${scheme.name}」吗？`)) return;
    const user = getCurrentUser();
    user.schemes = user.schemes.filter((item) => item.id !== scheme.id);
    saveDb();
    render();
  }

  function ensureWorldCupMatches() {
    const user = getCurrentUser();
    user.matches = user.matches.filter((match) => {
      const key = `${match.code}-${match.homeTeam}-${match.awayTeam}`;
      return !legacyWorldCupSeedKeys.has(key) || getSchemesByMatch(match.id).length > 0;
    });
    const existingKeys = new Set(user.matches.map((match) => `${match.code}-${match.homeTeam}-${match.awayTeam}`));
    const additions = createWorldCupMatches().filter(
      (match) => !existingKeys.has(`${match.code}-${match.homeTeam}-${match.awayTeam}`)
    );
    if (additions.length) {
      user.matches.push(...additions);
      saveDb();
    }
  }

  function closeAllModals() {
    closeSchemeMatchSelectPanel();
    [els.matchModal, els.schemeModal, els.resultModal, els.settleModal].forEach((modal) => modal.classList.add("hidden"));
    document.body.classList.remove("modal-open");
    document.body.style.top = "";
    window.scrollTo(0, state.scrollYBeforeModal);
    state.editingMatchId = "";
    state.editingResultMatchId = "";
    state.settlingSchemeId = "";
    state.editingSchemeId = "";
  }

  function openModal(modal) {
    [els.matchModal, els.schemeModal, els.resultModal, els.settleModal].forEach((item) => item.classList.add("hidden"));
    state.scrollYBeforeModal = document.body.classList.contains("modal-open") ? state.scrollYBeforeModal : window.scrollY;
    document.body.style.top = `-${state.scrollYBeforeModal}px`;
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function matchMatchesSearch(match) {
    if (!state.search) return true;
    return [match.homeTeam, match.awayTeam, match.league, match.code, match.note].join(" ").toLowerCase().includes(state.search);
  }

  function syncProfitFilterButtons() {
    els.profitFilter.querySelectorAll("[data-profit-filter]").forEach((button) => {
      button.classList.toggle("active", button.dataset.profitFilter === state.profitFilter);
    });
  }

  function matchSchemeFilters(scheme) {
    const filled = isSchemeReturnFilled(scheme);
    if (state.profitFilter === "pending" && filled) return false;
    if (state.profitFilter === "profit" && (!filled || scheme.returnAmount - scheme.cost <= 0)) return false;
    if (state.profitFilter === "loss" && (!filled || scheme.returnAmount - scheme.cost >= 0)) return false;
    if (!state.search) return true;
    const matchText = scheme.picks
      .map((pick) => {
        const match = findMatchById(pick.matchId);
        return `${match ? getMatchTitle(match, false) : ""} ${pick.playType} ${pick.options.join(" ")}`;
      })
      .join(" ");
    return `${scheme.name} ${getSchemeBetTypeText(scheme)} ${scheme.note} ${matchText}`.toLowerCase().includes(state.search);
  }

  function getCurrentUser() {
    return state.db.users[state.currentUser];
  }

  function ensureCurrentUserShape() {
    const user = getCurrentUser();
    user.matches ||= [];
    const legacySchemes = migrateLegacySchemes(user.matches);
    if (!Array.isArray(user.schemes) || (!user.schemes.length && legacySchemes.length)) {
      user.schemes = legacySchemes;
    }
    user.matches.forEach((match) => {
      ensureMatchId(match);
      match.result ||= { homeScore: "", awayScore: "" };
      delete match.schemes;
    });
    user.schemes.forEach((scheme) => {
      normalizeSchemeReturnState(scheme);
    });
    ensureUniqueMatchIds(user);
    removeNonWorldCupMatches(user);
    saveDb();
  }

  function removeNonWorldCupMatches(user) {
    const worldCupMatchIds = new Set(
      user.matches.filter((match) => String(match.league || "").includes("世界杯")).map((match) => match.id)
    );
    user.matches = user.matches.filter((match) => worldCupMatchIds.has(match.id));
    user.schemes = user.schemes
      .map((scheme) => ({
        ...scheme,
        picks: scheme.picks.filter((pick) => worldCupMatchIds.has(pick.matchId)),
      }))
      .filter((scheme) => scheme.picks.length > 0);
  }

  function findMatchById(id) {
    return getCurrentUser().matches.find((match) => match.id === id);
  }

  function findSchemeById(id) {
    return getCurrentUser().schemes.find((scheme) => scheme.id === id);
  }

  function getSchemesByMatch(matchId) {
    return getCurrentUser().schemes.filter((scheme) => scheme.picks.some((pick) => pick.matchId === matchId));
  }

  function getMatchTitle(match, withResult = true) {
    const result = withResult && hasMatchResult(match) ? ` ${getResultText(match)}` : "";
    return `${match.homeTeam} vs ${match.awayTeam}${result}`;
  }

  function hasMatchResult(match) {
    const home = match.result?.homeScore;
    const away = match.result?.awayScore;
    return home !== "" && home != null && away !== "" && away != null;
  }

  function getResultText(match) {
    if (!hasMatchResult(match)) return "";
    return `${match.result.homeScore}:${match.result.awayScore}`;
  }

  function getTotalGoals(match) {
    if (!hasMatchResult(match)) return "-";
    const home = Number(match.result.homeScore);
    const away = Number(match.result.awayScore);
    if (!Number.isFinite(home) || !Number.isFinite(away)) return "-";
    return home + away;
  }

  function getHalfFullText(match) {
    if (!hasHalfTimeResult(match) || !hasMatchResult(match)) return "";
    return `${getOutcomeText(match.result.halfHomeScore, match.result.halfAwayScore)}${getOutcomeText(match.result.homeScore, match.result.awayScore)}`;
  }

  function hasHalfTimeResult(match) {
    const home = match.result?.halfHomeScore;
    const away = match.result?.halfAwayScore;
    return home !== "" && home != null && away !== "" && away != null;
  }

  function getOutcomeText(homeScore, awayScore) {
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (!Number.isFinite(home) || !Number.isFinite(away)) return "-";
    if (home > away) return "胜";
    if (home < away) return "负";
    return "平";
  }

  function getScoreInputValue(score) {
    if (score === "" || score == null) return 0;
    return score;
  }

  function loadDb() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed?.users) return parsed;
    } catch (error) {
      console.warn("Failed to parse v2 data", error);
    }
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
      if (legacy?.users) return legacy;
    } catch (error) {
      console.warn("Failed to parse legacy data", error);
    }
    return { users: {} };
  }

  function migrateAllUsers() {
    Object.values(state.db.users).forEach((user) => {
      user.matches ||= [];
      const legacySchemes = migrateLegacySchemes(user.matches);
      if (!Array.isArray(user.schemes) || (!user.schemes.length && legacySchemes.length)) {
        user.schemes = legacySchemes;
      }
      user.matches.forEach((match) => {
        match.result ||= { homeScore: "", awayScore: "" };
        match.result.halfHomeScore ??= "";
        match.result.halfAwayScore ??= "";
        delete match.schemes;
      });
    });
    saveDb();
  }

  function migrateLegacySchemes(matches) {
    return matches.flatMap((match) =>
      (match.schemes || []).map((scheme) => ({
        id: scheme.id || createId(),
        name: scheme.name,
        betType: scheme.betType || "单关",
        picks: [
          {
            matchId: match.id,
            playType: scheme.playType || "自定义",
            options: String(scheme.selections || "")
              .split(/[；;\n]/)
              .map((item) => item.trim())
              .filter(Boolean),
          },
        ],
        cost: scheme.cost || 0,
        returnAmount: scheme.returnAmount ?? null,
        returnFilled: scheme.returnAmount !== null && scheme.returnAmount !== undefined,
        note: scheme.note || "",
        createdAt: scheme.createdAt || new Date().toISOString(),
      }))
    );
  }

  function saveDb() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
    } catch (error) {
      console.error("Failed to save data", error);
      alert("本地存储失败，请检查浏览器是否禁用了网站数据，或不要使用无痕模式。");
    }
  }

  function warnIfStorageUnreliable() {
    if (location.protocol !== "file:") return;
    console.warn("当前通过 file:// 打开页面，浏览器可能无法稳定保存数据。请使用 http://localhost 或 GitHub Pages 访问。");
  }

  function createWorldCupMatches() {
    return worldCupMatches.map((match) => ({
      id: createId(),
      ...match,
      result: { homeScore: "", awayScore: "", halfHomeScore: "", halfAwayScore: "" },
      createdAt: new Date().toISOString(),
    }));
  }

  function setAuthMessage(message) {
    els.authMessage.textContent = message;
  }

  function normalizeUsername(value) {
    return value.trim().toLowerCase();
  }

  function createId() {
    return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function hashPassword(password) {
    if (!window.crypto?.subtle) return password;
    const data = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function toMoneyNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
  }

  function emptyToNull(value) {
    return value === "" || value === null || value === undefined ? null : toMoneyNumber(value);
  }

  function formatMoney(value) {
    return `¥${Number(value || 0).toFixed(2)}`;
  }

  function formatDate(value) {
    const stored = parseStoredMatchDate(value);
    if (stored) {
      const [, year, month, day, hour, minute] = stored.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/) || [];
      if (month && day && hour && minute) {
        return `${month}/${day} ${hour}:${minute}`;
      }
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("zh-CN", {
      timeZone: BEIJING_TZ,
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatSchemeNameDate(date) {
    return date.toLocaleString("zh-CN", {
      timeZone: BEIJING_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
})();
