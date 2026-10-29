// ---------- Storage keys ----------
const STORAGE_DEDUCTIONS = "fwc_deductions";
const STORAGE_SETTLEMENTS = "fwc_settlements";

// ---------- Locked contract values ----------
const LOCKED_SPLIT_PERCENT = 19.38;
const KG_PER_BOX = 300;

const LOCKED_CREW = [
  { role: "Skipper", shares: 2, count: 1 },
  { role: "First mate / Chief engineer", shares: 1.5, count: 2 },
  { role: "Second mate / Second engineer / Cook", shares: 1.25, count: 3 },
  { role: "Deckhand", shares: 1, count: 8 },
];

const DEFAULT_SPECIES = [
  "Þorskur",
  "Undirmálsþorskur",
  "Ýsa",
  "Undirmálsýsa",
  "Lýsa",
  "Ufsi",
  "Langa",
  "Blálanga",
  "Keila",
  "Stóra brosma",
  "Gullkarfi",
  "Steinbítur",
  "Hlýri",
  "Grálúða",
  "Skarkoli",
  "Sandkoli",
  "Skrápflúra",
  "Stórkjafta",
  "Langlúra",
  "Þykkvalúra",
  "Skötuselur",
  "Lúða",
  "Grásleppa",
  "Bleikjuflök",
  "Skata",
  "Náskata",
  "Tindaskata",
  "Þorskalifur",
  "Blönduð lifur",
  "Þorskhrogn",
  "Blönduð hrogn",
];

// One-time snapshot of prices (ISK/kg), pulled 2026-10-29.
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

let crew = LOCKED_CREW;
let deductions = [];
let catches = [];
let idCounter = 1;

function nextId() { return idCounter++; }

// ---------- Persistence ----------
function loadState() {
  const storedDeductions = localStorage.getItem(STORAGE_DEDUCTIONS);
  deductions = storedDeductions ? JSON.parse(storedDeductions) : [];

  catches = DEFAULT_SPECIES.map(species => ({ id: nextId(), species, boxes: 0, pricePerKg: PRICE_SNAPSHOT[species] || 0, locked: true }));

  // make sure id counter is ahead of any loaded ids
  deductions.forEach(d => { if (d.id >= idCounter) idCounter = d.id + 1; });
}

function saveDeductions() { localStorage.setItem(STORAGE_DEDUCTIONS, JSON.stringify(deductions)); }

function getSettlements() {
  const stored = localStorage.getItem(STORAGE_SETTLEMENTS);
  return stored ? JSON.parse(stored) : [];
}
function saveSettlements(list) { localStorage.setItem(STORAGE_SETTLEMENTS, JSON.stringify(list)); }

// ---------- Crew table rendering ----------
const crewBody = document.getElementById("crew-body");

function renderCrew() {
  crewBody.innerHTML = "";
  crew.forEach(member => {
    const tr = document.createElement("tr");
    const roleTd = document.createElement("td"); roleTd.textContent = member.role;
    const sharesTd = document.createElement("td"); sharesTd.textContent = member.shares;
    const countTd = document.createElement("td"); countTd.textContent = member.count;
    tr.append(roleTd, sharesTd, countTd);
    crewBody.appendChild(tr);
  });
}

// ---------- Deductions table rendering ----------
const deductionsBody = document.getElementById("deductions-body");

function renderDeductions() {
  deductionsBody.innerHTML = "";
  deductions.forEach(ded => {
    const tr = document.createElement("tr");

    const labelTd = document.createElement("td");
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.value = ded.label;
    labelInput.placeholder = "e.g. Auction fee";
    labelInput.addEventListener("input", () => { ded.label = labelInput.value; saveDeductions(); });
    labelTd.appendChild(labelInput);

    const amountTd = document.createElement("td");
    const amountInput = document.createElement("input");
    amountInput.type = "text";
    amountInput.inputMode = "decimal";
    amountInput.value = ded.amount;
    amountInput.addEventListener("input", () => { ded.amount = parseNum(amountInput.value); saveDeductions(); });
    amountTd.appendChild(amountInput);

    const actionTd = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "danger";
    removeBtn.addEventListener("click", () => {
      deductions = deductions.filter(d => d.id !== ded.id);
      saveDeductions();
      renderDeductions();
    });
    actionTd.appendChild(removeBtn);

    tr.append(labelTd, amountTd, actionTd);
    deductionsBody.appendChild(tr);
  });
}

document.getElementById("add-deduction-btn").addEventListener("click", () => {
  deductions.push({ id: nextId(), label: "", amount: 0 });
  saveDeductions();
  renderDeductions();
});

// ---------- Catch entries rendering (not persisted between sessions, cleared after save) ----------
const catchBody = document.getElementById("catch-body");

function formatISK(n) {
  return new Intl.NumberFormat("is-IS", { maximumFractionDigits: 0 }).format(Math.round(n));
}

// Accepts either "," or "." as the decimal separator (Icelandic keyboards use ",").
function parseNum(str) {
  return parseFloat(String(str).replace(",", ".")) || 0;
}

function renderCatches() {
  catchBody.innerHTML = "";
  catches.forEach(line => {
    const tr = document.createElement("tr");

    const speciesTd = document.createElement("td");
    if (line.locked) {
      speciesTd.textContent = line.species;
    } else {
      const speciesInput = document.createElement("input");
      speciesInput.type = "text";
      speciesInput.value = line.species;
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
    boxesInput.type = "text";
    boxesInput.inputMode = "decimal";
    boxesInput.value = line.boxes;
    boxesInput.addEventListener("input", () => { line.boxes = parseNum(boxesInput.value); refreshRow(); });
    boxesTd.appendChild(boxesInput);

    const priceTd = document.createElement("td");
    const priceInput = document.createElement("input");
    priceInput.type = "text";
    priceInput.inputMode = "decimal";
    priceInput.value = line.pricePerKg;
    priceInput.addEventListener("input", () => { line.pricePerKg = parseNum(priceInput.value); refreshRow(); });
    priceTd.appendChild(priceInput);

    refreshRow();

    const actionTd = document.createElement("td");
    if (!line.locked) {
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "danger";
      removeBtn.addEventListener("click", () => {
        catches = catches.filter(c => c.id !== line.id);
        renderCatches();
      });
      actionTd.appendChild(removeBtn);
    }

    tr.append(speciesTd, boxesTd, weightTd, priceTd, valueTd, actionTd);
    catchBody.appendChild(tr);
  });
}

document.getElementById("add-catch-btn").addEventListener("click", () => {
  catches.push({ id: nextId(), species: "", boxes: 0, pricePerKg: 0, locked: false });
  renderCatches();
});

document.getElementById("clear-boxes-btn").addEventListener("click", () => {
  catches.forEach(line => { line.boxes = 0; });
  renderCatches();
});

// ---------- Calculation ----------
let lastResult = null;

function calculateSettlement() {
  const totalCatchValue = catches.reduce((sum, c) => sum + (c.boxes * KG_PER_BOX * c.pricePerKg), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const splitPercent = LOCKED_SPLIT_PERCENT;

  const netValue = totalCatchValue - totalDeductions;
  const pool = netValue * (splitPercent / 100);
  const totalShares = crew.reduce((sum, c) => sum + c.count, 0); // base shares = headcount; extra multipliers ride on top, not diluting the divisor
  const shareValue = totalShares > 0 ? pool / totalShares : 0;

  const payouts = crew.map(c => ({
    role: c.role,
    shares: c.shares,
    count: c.count,
    payPerPerson: shareValue * c.shares,
    payTotal: shareValue * c.shares * c.count,
  }));

  lastResult = {
    totalCatchValue, totalDeductions, netValue,
    splitPercent, pool, totalShares, shareValue, payouts,
    catches: JSON.parse(JSON.stringify(catches)),
  };
  return lastResult;
}

function renderResult(result) {
  const out = document.getElementById("result-output");

  const tiles = [
    ["Total catch value", formatISK(result.totalCatchValue) + " ISK"],
    ["Deductions", formatISK(result.totalDeductions) + " ISK"],
    ["Net value", formatISK(result.netValue) + " ISK"],
    ["Crew pool (" + result.splitPercent + "%)", formatISK(result.pool) + " ISK"],
    ["Total shares", result.totalShares.toFixed(2)],
    ["Value per 1 share", formatISK(result.shareValue) + " ISK"],
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

  out.innerHTML = html;
  document.getElementById("save-row").classList.remove("hidden");
}

document.getElementById("calc-btn").addEventListener("click", () => {
  const result = calculateSettlement();
  renderResult(result);
});

// ---------- Save settlement to history ----------
document.getElementById("save-settlement-btn").addEventListener("click", () => {
  if (!lastResult) return;
  const date = document.getElementById("settlement-date").value || new Date().toISOString().slice(0, 10);
  const settlements = getSettlements();
  settlements.push({ id: nextId(), date, ...lastResult });
  saveSettlements(settlements);
  renderHistory();
});

// ---------- History ----------
function renderHistory() {
  const list = document.getElementById("history-list");
  const settlements = getSettlements().sort((a, b) => b.date.localeCompare(a.date));

  if (settlements.length === 0) {
    list.innerHTML = '<p class="empty-msg">No settlements saved yet.</p>';
    return;
  }

  list.innerHTML = "";
  settlements.forEach(s => {
    const card = document.createElement("div");
    card.className = "history-card";

    const info = document.createElement("div");
    const totalPay = s.payouts.reduce((sum, p) => sum + p.payTotal, 0);
    info.innerHTML = `<strong>${s.date}</strong><div class="meta">Catch value: ${formatISK(s.totalCatchValue)} ISK &middot; Paid out: ${formatISK(totalPay)} ISK</div>`;

    const actions = document.createElement("div");
    actions.className = "actions";
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.className = "secondary";
    viewBtn.addEventListener("click", () => {
      lastResult = s;
      renderResult(s);
      document.getElementById("result-section").scrollIntoView({ behavior: "smooth" });
    });
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "danger";
    delBtn.addEventListener("click", () => {
      const remaining = getSettlements().filter(x => x.id !== s.id);
      saveSettlements(remaining);
      renderHistory();
    });
    actions.append(viewBtn, delBtn);

    card.append(info, actions);
    list.appendChild(card);
  });
}

// ---------- Init ----------
loadState();
renderCrew();
renderDeductions();
renderCatches();
renderHistory();
document.getElementById("settlement-date").value = new Date().toISOString().slice(0, 10);
