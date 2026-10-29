// ---------- Shared reference data (same fish, same prices, across every gear type) ----------
const KG_PER_BOX = 300;

const DEFAULT_SPECIES = [
  "Þorskur", "Undirmálsþorskur", "Ýsa", "Undirmálsýsa", "Lýsa", "Ufsi",
  "Langa", "Blálanga", "Keila", "Stóra brosma", "Gullkarfi", "Steinbítur",
  "Hlýri", "Grálúða", "Skarkoli", "Sandkoli", "Skrápflúra", "Stórkjafta",
  "Langlúra", "Þykkvalúra", "Skötuselur", "Lúða", "Grásleppa", "Bleikjuflök",
  "Skata", "Náskata", "Tindaskata",
  "Þorskalifur", "Blönduð lifur", "Þorskhrogn", "Blönduð hrogn",
];

// One-time price snapshot (ISK/kg), pulled 2026-10-29.
// Þorskur, Ýsa, Ufsi use Verðlagsstofa skiptaverðs reference prices (slægt, largest size class):
// Þorskur 6kg, Ýsa 2.5kg, Ufsi 3.5kg og stærra. Everything else is the mbl.is/200milur market average.
// Liver/roe lines are left blank on purpose - those are priced manually.
const PRICE_SNAPSHOT = {
  "Þorskur": 567.73,
  "Ýsa": 397.86,
  "Ufsi": 313.55,
  "Undirmálsþorskur": 517.22,
  "Undirmálsýsa": 142.00,
  "Lýsa": 167.34,
  "Langa": 463.93,
  "Blálanga": 410.64,
  "Keila": 258.72,
  "Stóra brosma": 221.00,
  "Gullkarfi": 445.33,
  "Steinbítur": 612.99,
  "Hlýri": 592.60,
  "Grálúða": 651.61,
  "Skarkoli": 572.93,
  "Sandkoli": 68.97,
  "Skrápflúra": 10.00,
  "Stórkjafta": 350.00,
  "Langlúra": 240.00,
  "Þykkvalúra": 918.60,
  "Skötuselur": 470.86,
  "Lúða": 569.47,
  "Grásleppa": 10.00,
  "Skata": 67.08,
  "Náskata": 50.00,
  "Tindaskata": 37.39,
};

// ---------- Per gear-type tab configuration ----------
// "net" is locked to this specific boat's agreed numbers. Every other tab is a reasonable
// starting point pulled straight from the current (chapter 2/5/7, not the legacy viðauki 1
// brl-based annex) 2024 SFS/SSÍ agreement — editable so a crew on a different bracket can
// match their own contract. All percentages below are Leið A.
const TAB_CONFIGS = {
  net: {
    label: "Net",
    locked: false,
    // ch. 3.02, by registered length. Defaults to this boat's confirmed bracket (40m+, 19.38%)
    // but stays a selector so other crews can pick their own vessel length.
    brackets: {
      options: [
        { label: "Undir 15 m", percent: 22.84, men: 6 },
        { label: "15 - 23,99 m", percent: 20.41, men: 8 },
        { label: "24 - 39,99 m", percent: 19.38, men: 12 },
        { label: "40 m og lengri", percent: 19.38, men: 13 },
      ],
      defaultIndex: 3,
    },
    splitPercent: 19.38, // ch. 3.02, 40m+ / 301-500 rúml, 13 menn
    crew: [
      { role: "2 shares", shares: 2, count: 1 },
      { role: "1.5 shares", shares: 1.5, count: 2 },
      { role: "1.25 shares", shares: 1.25, count: 3 },
      { role: "1.125 shares", shares: 1.125, count: 0 },
      { role: "1 share", shares: 1, count: 8 },
    ],
  },
  longline: {
    label: "Lína",
    locked: false,
    // ch. 2.05 (landróðrar / day boats) and 2.06 (útilegur / extended trips), by registered length.
    brackets: {
      tripTypes: ["Landróðrar (day boats)", "Útilegur (extended trips)"],
      landrodrar: [
        { label: "Undir 15 m", percent: 22.07, men: 5 },
        { label: "15 - 23,99 m", percent: 22.07, men: 7 },
        { label: "24 m og lengri", percent: 21.11, men: 11 },
      ],
      utilegur: [
        { label: "Undir 15 m", percent: 22.82, men: 6 },
        { label: "15 - 23,99 m", percent: 22.82, men: 8 },
        { label: "24 - 39,99 m", percent: 21.98, men: 14 },
        { label: "40 m og lengri", percent: 21.98, men: 14 },
      ],
      defaultTripType: "utilegur",
      defaultIndex: 3,
    },
    splitPercent: 21.98, // útilegur, 40m+, 14 menn
    crew: [
      { role: "2 shares", shares: 2, count: 1 },
      { role: "1.5 shares", shares: 1.5, count: 1 },
      { role: "1.25 shares", shares: 1.25, count: 3 },
      { role: "1.125 shares", shares: 1.125, count: 1 },
      { role: "1 share", shares: 1, count: 8 },
    ],
  },
  trawl: {
    label: "Troll",
    locked: false,
    // ch. 5.01/5.11, by vessel category - tonnage and length thresholds differ per category.
    brackets: {
      options: [
        { label: "Bátar/togarar undir 300 brt, undir 29 m", percent: 20.76, men: 11 },
        { label: "Skuttogarar 300 brt og stærri, undir 29 m", percent: 19.79, men: 12 },
        { label: "Skuttogarar 29 - 39,99 m", percent: 19.31, men: "11-14" },
        { label: "Skuttogarar 40 m og lengri", percent: 19.31, men: 15 },
        { label: "Frystitogarar (freezer, grunntala)", percent: 21.71, men: 20 },
      ],
      defaultIndex: 3,
    },
    splitPercent: 19.31, // ch. 5.11, skuttogarar 40m+, 15 menn
    crew: [
      { role: "2 shares", shares: 2, count: 1 },
      { role: "1.5 shares", shares: 1.5, count: 1 },
      { role: "1.25 shares", shares: 1.25, count: 2 },
      { role: "1.125 shares", shares: 1.125, count: 1 },
      { role: "1 share", shares: 1, count: 10 },
    ],
  },
  dragnet: {
    label: "Dragnót",
    locked: false,
    // ch. 4.01, by registered length (boats first registered after 1 Jan 2023, or new to dragnet fishing).
    brackets: {
      options: [
        { label: "Undir 15 m", percent: 22.40, men: 4 },
        { label: "15 - 23,99 m", percent: 22.40, men: "7-8" },
        { label: "24 - 39,99 m", percent: 22.40, men: "8-9" },
        { label: "40 m og lengri", percent: 21.98, men: "12-14" },
      ],
      defaultIndex: 3,
    },
    splitPercent: 21.98, // ch. 4.01, 40m+, 12-14 menn
    crew: [
      { role: "2 shares", shares: 2, count: 1 },
      { role: "1.5 shares", shares: 1.5, count: 1 },
      { role: "1.25 shares", shares: 1.25, count: 2 },
      { role: "1.125 shares", shares: 1.125, count: 0 },
      { role: "1 share", shares: 1, count: 10 },
    ],
  },
};

let idCounter = 1;
function nextId() { return idCounter++; }

function formatISK(n) {
  return new Intl.NumberFormat("is-IS", { maximumFractionDigits: 0 }).format(Math.round(n));
}

// Accepts either "," or "." as the decimal separator (Icelandic keyboards use ",").
function parseNum(str) {
  return parseFloat(String(str).replace(",", ".")) || 0;
}

// ---------- Per-tab state ----------
const tabStates = {}; // tabId -> state object
const tabContainers = {}; // tabId -> built DOM container (cached so inputs aren't lost on switching)

function storageKey(tabId, part) { return `fwc_${tabId}_${part}`; }

function loadTabState(tabId) {
  const config = TAB_CONFIGS[tabId];

  const storedCrew = localStorage.getItem(storageKey(tabId, "crew"));
  const crew = (storedCrew ? JSON.parse(storedCrew) : config.crew).map(c => ({ id: nextId(), ...c }));

  const storedSplit = localStorage.getItem(storageKey(tabId, "split"));
  const splitPercent = storedSplit !== null ? parseFloat(storedSplit) : config.splitPercent;

  const storedDeductions = localStorage.getItem(storageKey(tabId, "deductions"));
  const deductions = storedDeductions ? JSON.parse(storedDeductions) : [];
  deductions.forEach(d => { d.id = nextId(); });

  const catches = DEFAULT_SPECIES.map(species => ({
    id: nextId(), species, boxes: 0, pricePerKg: PRICE_SNAPSHOT[species] || 0, locked: true,
  }));

  return { tabId, config, crew, splitPercent, deductions, catches, lastResult: null };
}

function saveCrew(state) { localStorage.setItem(storageKey(state.tabId, "crew"), JSON.stringify(state.crew)); }
function saveSplit(state) { localStorage.setItem(storageKey(state.tabId, "split"), String(state.splitPercent)); }
function saveDeductions(state) { localStorage.setItem(storageKey(state.tabId, "deductions"), JSON.stringify(state.deductions)); }

function getSettlements(tabId) {
  const stored = localStorage.getItem(storageKey(tabId, "settlements"));
  return stored ? JSON.parse(stored) : [];
}
function saveSettlements(tabId, list) { localStorage.setItem(storageKey(tabId, "settlements"), JSON.stringify(list)); }

// ---------- Build the full UI for one tab ----------
function buildTab(state) {
  const root = document.createElement("div");

  if (state.config.unconfirmed) {
    const warning = document.createElement("p");
    warning.className = "hint";
    warning.style.color = "#c0392b";
    warning.textContent = state.config.unconfirmed;
    root.appendChild(warning);
  }

  // Crew & shares
  const crewSection = document.createElement("section");
  crewSection.innerHTML = `<h2>Crew &amp; Shares</h2>
    <p class="hint">${state.config.locked
      ? 'Locked to the contract tiers. "Shares" is the multiplier of one regular deckhand share. "Count" is how many crew members currently hold that tier.'
      : 'Starting point from the union agreement\'s mid-range bracket for this gear type — edit roles, shares, and counts to match your own boat\'s contract.'}</p>
    <table><thead><tr><th>Role / tier</th><th>Shares</th><th>Count</th><th></th></tr></thead><tbody class="crew-body"></tbody></table>`;
  const crewBody = crewSection.querySelector(".crew-body");
  if (!state.config.locked) {
    const addCrewBtn = document.createElement("button");
    addCrewBtn.textContent = "+ Add share tier";
    addCrewBtn.className = "secondary";
    addCrewBtn.addEventListener("click", () => {
      state.crew.push({ id: nextId(), role: "Deckhand", shares: 1, count: 1 });
      saveCrew(state);
      renderCrew();
    });
    crewSection.appendChild(addCrewBtn);
  }

  function renderCrew() {
    crewBody.innerHTML = "";
    state.crew.forEach(member => {
      const tr = document.createElement("tr");

      if (state.config.locked) {
        const roleTd = document.createElement("td"); roleTd.textContent = member.role;
        const sharesTd = document.createElement("td"); sharesTd.textContent = member.shares;
        const countTd = document.createElement("td"); countTd.textContent = member.count;
        tr.append(roleTd, sharesTd, countTd, document.createElement("td"));
      } else {
        const roleTd = document.createElement("td");
        const roleInput = document.createElement("input");
        roleInput.type = "text"; roleInput.value = member.role;
        roleInput.addEventListener("input", () => { member.role = roleInput.value; saveCrew(state); });
        roleTd.appendChild(roleInput);

        const sharesTd = document.createElement("td");
        const sharesInput = document.createElement("input");
        sharesInput.type = "text"; sharesInput.inputMode = "decimal"; sharesInput.value = member.shares;
        sharesInput.addEventListener("input", () => { member.shares = parseNum(sharesInput.value); saveCrew(state); });
        sharesTd.appendChild(sharesInput);

        const countTd = document.createElement("td");
        const countInput = document.createElement("input");
        countInput.type = "text"; countInput.inputMode = "numeric"; countInput.value = member.count;
        countInput.addEventListener("input", () => { member.count = parseInt(parseNum(countInput.value)) || 0; saveCrew(state); });
        countTd.appendChild(countInput);

        const actionTd = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove"; removeBtn.className = "danger";
        removeBtn.addEventListener("click", () => {
          state.crew = state.crew.filter(c => c.id !== member.id);
          saveCrew(state);
          renderCrew();
        });
        actionTd.appendChild(removeBtn);

        tr.append(roleTd, sharesTd, countTd, actionTd);
      }
      crewBody.appendChild(tr);
    });
  }
  renderCrew();

  // Split settings
  const settingsSection = document.createElement("section");
  settingsSection.innerHTML = `<h2>Split Settings</h2>
    <div class="settings-grid">
      <label>Crew split percentage ${state.config.locked ? "(locked)" : ""}
        <input type="text" class="split-input" inputmode="decimal" ${state.config.locked ? "disabled" : ""}>
        <span class="unit">%</span>
      </label>
    </div>
    <p class="hint">Fuel/oil is already baked into the split percentage above. Any other deductions below are subtracted from the total catch value before the crew's percentage is applied.</p>
    <table><thead><tr><th>Deduction</th><th>Amount (ISK)</th><th></th></tr></thead><tbody class="deductions-body"></tbody></table>`;
  const splitInput = settingsSection.querySelector(".split-input");
  splitInput.value = state.splitPercent;
  splitInput.addEventListener("input", () => { state.splitPercent = parseNum(splitInput.value); saveSplit(state); });

  if (state.config.brackets) {
    const b = state.config.brackets;
    const bracketDiv = document.createElement("div");
    bracketDiv.className = "settings-grid";

    function optionLabel(bracket) {
      return `${bracket.label} (${bracket.men} menn, ${bracket.percent}%)`;
    }

    if (b.tripTypes) {
      // Two-dimension selector: trip type x vessel length (longline).
      bracketDiv.innerHTML = `
        <label>Trip type
          <select class="trip-type-select"></select>
        </label>
        <label>Vessel length
          <select class="length-select"></select>
        </label>`;
      settingsSection.insertBefore(bracketDiv, settingsSection.querySelector(".hint"));

      const tripSelect = bracketDiv.querySelector(".trip-type-select");
      const lengthSelect = bracketDiv.querySelector(".length-select");
      const tripKeys = ["landrodrar", "utilegur"];

      b.tripTypes.forEach((label, i) => {
        const opt = document.createElement("option");
        opt.value = tripKeys[i];
        opt.textContent = label;
        tripSelect.appendChild(opt);
      });

      function populateLengths(tripKey, selectIndex) {
        lengthSelect.innerHTML = "";
        b[tripKey].forEach((bracket, i) => {
          const opt = document.createElement("option");
          opt.value = i;
          opt.textContent = optionLabel(bracket);
          lengthSelect.appendChild(opt);
        });
        lengthSelect.value = selectIndex;
      }

      function applyBracket() {
        const bracket = b[tripSelect.value][lengthSelect.value];
        state.splitPercent = bracket.percent;
        splitInput.value = bracket.percent;
        saveSplit(state);
      }

      tripSelect.value = b.defaultTripType;
      populateLengths(b.defaultTripType, b.defaultIndex);

      tripSelect.addEventListener("change", () => { populateLengths(tripSelect.value, 0); applyBracket(); });
      lengthSelect.addEventListener("change", applyBracket);
    } else {
      // Single-dimension selector: one list of vessel categories/lengths (net, trawl).
      bracketDiv.innerHTML = `
        <label>Vessel category / length
          <select class="bracket-select"></select>
        </label>`;
      settingsSection.insertBefore(bracketDiv, settingsSection.querySelector(".hint"));

      const bracketSelect = bracketDiv.querySelector(".bracket-select");
      b.options.forEach((bracket, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = optionLabel(bracket);
        bracketSelect.appendChild(opt);
      });
      bracketSelect.value = b.defaultIndex;

      bracketSelect.addEventListener("change", () => {
        const bracket = b.options[bracketSelect.value];
        state.splitPercent = bracket.percent;
        splitInput.value = bracket.percent;
        saveSplit(state);
      });
    }
  }

  const deductionsBody = settingsSection.querySelector(".deductions-body");
  const addDeductionBtn = document.createElement("button");
  addDeductionBtn.textContent = "+ Add deduction"; addDeductionBtn.className = "secondary";
  addDeductionBtn.addEventListener("click", () => {
    state.deductions.push({ id: nextId(), label: "", amount: 0 });
    saveDeductions(state);
    renderDeductions();
  });
  settingsSection.appendChild(addDeductionBtn);

  function renderDeductions() {
    deductionsBody.innerHTML = "";
    state.deductions.forEach(ded => {
      const tr = document.createElement("tr");

      const labelTd = document.createElement("td");
      const labelInput = document.createElement("input");
      labelInput.type = "text"; labelInput.value = ded.label; labelInput.placeholder = "e.g. Auction fee";
      labelInput.addEventListener("input", () => { ded.label = labelInput.value; saveDeductions(state); });
      labelTd.appendChild(labelInput);

      const amountTd = document.createElement("td");
      const amountInput = document.createElement("input");
      amountInput.type = "text"; amountInput.inputMode = "decimal"; amountInput.value = ded.amount;
      amountInput.addEventListener("input", () => { ded.amount = parseNum(amountInput.value); saveDeductions(state); });
      amountTd.appendChild(amountInput);

      const actionTd = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove"; removeBtn.className = "danger";
      removeBtn.addEventListener("click", () => {
        state.deductions = state.deductions.filter(d => d.id !== ded.id);
        saveDeductions(state);
        renderDeductions();
      });
      actionTd.appendChild(removeBtn);

      tr.append(labelTd, amountTd, actionTd);
      deductionsBody.appendChild(tr);
    });
  }
  renderDeductions();

  // Catch / sale entries
  const catchSection = document.createElement("section");
  catchSection.innerHTML = `<h2>Catch / Sale Entries</h2>
    <p class="hint">Species list is fixed — fill in boxes (300 kg each) for whichever species you landed. Weight fills in automatically. Cod, haddock, and saithe are pre-filled with the Verðlagsstofa skiptaverðs reference price for the largest size class; everything else uses the latest public market average (as of 29 Oct 2026). All prices are editable — the liver/roe lines are left blank for you to enter your own agreed price. Use "+ Add other line" only for something not on the list.</p>
    <table><thead><tr><th>Species / note</th><th>Boxes (&times;300kg)</th><th>Weight (kg)</th><th>Price per kg (ISK)</th><th>Value</th><th></th></tr></thead><tbody class="catch-body"></tbody></table>`;
  const catchBody = catchSection.querySelector(".catch-body");

  const addCatchBtn = document.createElement("button");
  addCatchBtn.textContent = "+ Add other line"; addCatchBtn.className = "secondary";
  addCatchBtn.addEventListener("click", () => {
    state.catches.push({ id: nextId(), species: "", boxes: 0, pricePerKg: 0, locked: false });
    renderCatches();
  });
  const clearBoxesBtn = document.createElement("button");
  clearBoxesBtn.textContent = "Clear all boxes"; clearBoxesBtn.className = "secondary";
  clearBoxesBtn.addEventListener("click", () => {
    state.catches.forEach(line => { line.boxes = 0; });
    renderCatches();
  });
  catchSection.append(addCatchBtn, clearBoxesBtn);

  function renderCatches() {
    catchBody.innerHTML = "";
    state.catches.forEach(line => {
      const tr = document.createElement("tr");

      const speciesTd = document.createElement("td");
      if (line.locked) {
        speciesTd.textContent = line.species;
      } else {
        const speciesInput = document.createElement("input");
        speciesInput.type = "text"; speciesInput.value = line.species;
        speciesInput.placeholder = "e.g. other / company price note";
        speciesInput.addEventListener("input", () => { line.species = speciesInput.value; });
        speciesTd.appendChild(speciesInput);
      }

      const weightTd = document.createElement("td");
      const valueTd = document.createElement("td");
      function refreshRow() {
        const weightKg = line.boxes * KG_PER_BOX;
        weightTd.textContent = formatISK(weightKg);
        valueTd.textContent = formatISK(weightKg * line.pricePerKg);
      }

      const boxesTd = document.createElement("td");
      const boxesInput = document.createElement("input");
      boxesInput.type = "text"; boxesInput.inputMode = "decimal"; boxesInput.value = line.boxes;
      boxesInput.addEventListener("input", () => { line.boxes = parseNum(boxesInput.value); refreshRow(); });
      boxesTd.appendChild(boxesInput);

      const priceTd = document.createElement("td");
      const priceInput = document.createElement("input");
      priceInput.type = "text"; priceInput.inputMode = "decimal"; priceInput.value = line.pricePerKg;
      priceInput.addEventListener("input", () => { line.pricePerKg = parseNum(priceInput.value); refreshRow(); });
      priceTd.appendChild(priceInput);

      refreshRow();

      const actionTd = document.createElement("td");
      if (!line.locked) {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove"; removeBtn.className = "danger";
        removeBtn.addEventListener("click", () => {
          state.catches = state.catches.filter(c => c.id !== line.id);
          renderCatches();
        });
        actionTd.appendChild(removeBtn);
      }

      tr.append(speciesTd, boxesTd, weightTd, priceTd, valueTd, actionTd);
      catchBody.appendChild(tr);
    });
  }
  renderCatches();

  // Settlement
  const resultSection = document.createElement("section");
  resultSection.innerHTML = `<h2>Settlement</h2>
    <button class="calc-btn primary">Calculate settlement</button>
    <div class="result-output"></div>
    <div class="save-row hidden">
      <label>Settlement date <input type="date" class="settlement-date"></label>
      <button class="save-settlement-btn primary">Save this settlement</button>
    </div>`;
  const resultOutput = resultSection.querySelector(".result-output");
  const saveRow = resultSection.querySelector(".save-row");
  const settlementDate = resultSection.querySelector(".settlement-date");
  settlementDate.value = new Date().toISOString().slice(0, 10);

  function calculateSettlement() {
    const totalCatchValue = state.catches.reduce((sum, c) => sum + (c.boxes * KG_PER_BOX * c.pricePerKg), 0);
    const totalDeductions = state.deductions.reduce((sum, d) => sum + d.amount, 0);
    const splitPercent = state.splitPercent;

    const netValue = totalCatchValue - totalDeductions;
    const pool = netValue * (splitPercent / 100);
    const totalShares = state.crew.reduce((sum, c) => sum + c.count, 0); // base shares = headcount; extra multipliers ride on top
    const shareValue = totalShares > 0 ? pool / totalShares : 0;

    const payouts = state.crew.map(c => ({
      role: c.role, shares: c.shares, count: c.count,
      payPerPerson: shareValue * c.shares,
      payTotal: shareValue * c.shares * c.count,
    }));

    state.lastResult = {
      totalCatchValue, totalDeductions, netValue, splitPercent, pool, totalShares, shareValue, payouts,
    };
    return state.lastResult;
  }

  function renderResult(result) {
    const tiles = [
      ["Total catch value", formatISK(result.totalCatchValue) + " ISK"],
      ["Deductions", formatISK(result.totalDeductions) + " ISK"],
      ["Net value", formatISK(result.netValue) + " ISK"],
      ["Crew pool (" + result.splitPercent + "%)", formatISK(result.pool) + " ISK"],
      ["Crew headcount", result.totalShares],
      ["Value per 1 base share", formatISK(result.shareValue) + " ISK"],
    ];
    let html = '<div class="summary-grid">';
    tiles.forEach(([label, value]) => {
      html += `<div class="summary-tile"><div class="label">${label}</div><div class="value">${value}</div></div>`;
    });
    html += '</div>';

    html += '<table><thead><tr><th>Role / tier</th><th>Shares</th><th>Count</th><th>Pay per person (ISK)</th><th>Tier total (ISK)</th></tr></thead><tbody>';
    result.payouts.forEach(p => {
      html += `<tr><td>${p.role}</td><td>${p.shares}</td><td>${p.count}</td><td>${formatISK(p.payPerPerson)}</td><td>${formatISK(p.payTotal)}</td></tr>`;
    });
    const totalPay = result.payouts.reduce((s, p) => s + p.payTotal, 0);
    html += `<tr class="payout-row total"><td colspan="4">Total paid out</td><td>${formatISK(totalPay)}</td></tr>`;
    html += '</tbody></table>';

    resultOutput.innerHTML = html;
    saveRow.classList.remove("hidden");
  }

  resultSection.querySelector(".calc-btn").addEventListener("click", () => {
    renderResult(calculateSettlement());
  });

  // History
  const historySection = document.createElement("section");
  historySection.innerHTML = `<h2>Past Settlements</h2><div class="history-list"></div>`;
  const historyList = historySection.querySelector(".history-list");

  function renderHistory() {
    const settlements = getSettlements(state.tabId).sort((a, b) => b.date.localeCompare(a.date));
    if (settlements.length === 0) {
      historyList.innerHTML = '<p class="empty-msg">No settlements saved yet.</p>';
      return;
    }
    historyList.innerHTML = "";
    settlements.forEach(s => {
      const card = document.createElement("div");
      card.className = "history-card";
      const totalPay = s.payouts.reduce((sum, p) => sum + p.payTotal, 0);
      const info = document.createElement("div");
      info.innerHTML = `<strong>${s.date}</strong><div class="meta">Catch value: ${formatISK(s.totalCatchValue)} ISK &middot; Paid out: ${formatISK(totalPay)} ISK</div>`;

      const actions = document.createElement("div");
      actions.className = "actions";
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View"; viewBtn.className = "secondary";
      viewBtn.addEventListener("click", () => {
        renderResult(s);
        resultSection.scrollIntoView({ behavior: "smooth" });
      });
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete"; delBtn.className = "danger";
      delBtn.addEventListener("click", () => {
        saveSettlements(state.tabId, getSettlements(state.tabId).filter(x => x.id !== s.id));
        renderHistory();
      });
      actions.append(viewBtn, delBtn);
      card.append(info, actions);
      historyList.appendChild(card);
    });
  }
  renderHistory();

  resultSection.querySelector(".save-settlement-btn").addEventListener("click", () => {
    if (!state.lastResult) return;
    const date = settlementDate.value || new Date().toISOString().slice(0, 10);
    const settlements = getSettlements(state.tabId);
    settlements.push({ id: nextId(), date, ...state.lastResult });
    saveSettlements(state.tabId, settlements);
    renderHistory();
  });

  root.append(crewSection, settingsSection, catchSection, resultSection, historySection);
  return root;
}

// ---------- Tab switching ----------
function showTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tabId));
  const content = document.getElementById("tab-content");
  content.innerHTML = "";
  if (!tabContainers[tabId]) {
    tabStates[tabId] = loadTabState(tabId);
    tabContainers[tabId] = buildTab(tabStates[tabId]);
  }
  content.appendChild(tabContainers[tabId]);
}

function initTabs() {
  const bar = document.getElementById("tab-bar");
  Object.keys(TAB_CONFIGS).forEach((tabId, i) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.textContent = TAB_CONFIGS[tabId].label;
    btn.dataset.tab = tabId;
    btn.addEventListener("click", () => showTab(tabId));
    bar.appendChild(btn);
    if (i === 0) showTab(tabId);
  });
}

initTabs();
