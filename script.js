const SUBJECTS = ["Science", "SST", "Maths", "English", "Hindi", "Sanskrit"];
const STORAGE_KEY = "examTracker.v1";

const CAPS = { pt1: 40, hye: 60, pt2: 40, see: 60 };
const WEIGHT_MAX = { pt1: 10, hye: 40, pt2: 10, see: 40 };

const state = {
  profile: { name: "", grade: "", section: "", roll: "" },
  marks: {}
};

SUBJECTS.forEach(s => {
  state.marks[s] = { pt1: null, hye: null, pt2: null, see: null };
});

function clampValue(raw, cap) {
  if (raw === "" || raw === null || raw === undefined) return null;
  let n = Number(raw);
  if (Number.isNaN(n)) return null;
  if (n < 0) n = 0;
  if (n > cap) n = cap;
  return n;
}

function weightedFrom(raw, cap, weight) {
  if (raw === null) return null;
  return (raw / cap) * weight;
}

function computeSubject(subj) {
  const m = state.marks[subj];
  const pt1w = weightedFrom(m.pt1, CAPS.pt1, WEIGHT_MAX.pt1);
  const hyew = weightedFrom(m.hye, CAPS.hye, WEIGHT_MAX.hye);
  const pt2w = weightedFrom(m.pt2, CAPS.pt2, WEIGHT_MAX.pt2);
  const seew = weightedFrom(m.see, CAPS.see, WEIGHT_MAX.see);
  const sector1 = (pt1w || 0) + (hyew || 0);
  const sector2 = (pt2w || 0) + (seew || 0);
  const anyTerm1 = m.pt1 !== null || m.hye !== null;
  const anyTerm2 = m.pt2 !== null || m.see !== null;
  const total = sector1 + sector2;
  return { pt1w, hyew, pt2w, seew, sector1, sector2, total, anyTerm1, anyTerm2 };
}

function gradeFor(pct) {
  if (pct >= 91) return { label: "A1", cls: "grade-good" };
  if (pct >= 81) return { label: "A2", cls: "grade-good" };
  if (pct >= 71) return { label: "B1", cls: "grade-good" };
  if (pct >= 61) return { label: "B2", cls: "grade-mid" };
  if (pct >= 51) return { label: "C1", cls: "grade-mid" };
  if (pct >= 41) return { label: "C2", cls: "grade-mid" };
  if (pct >= 33) return { label: "D", cls: "grade-warn" };
  if (pct >= 21) return { label: "E1", cls: "grade-warn" };
  return { label: "E2", cls: "grade-warn" };
}

function fmt(n) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function buildRows() {
  const tbody = document.getElementById("marksBody");
  tbody.innerHTML = "";
  SUBJECTS.forEach(subj => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-subject">${subj}</td>
      <td class="col-input"><input class="mark-input" type="number" min="0" max="${CAPS.pt1}" data-subject="${subj}" data-field="pt1" placeholder="/${CAPS.pt1}"></td>
      <td class="col-input"><input class="mark-input" type="number" min="0" max="${CAPS.hye}" data-subject="${subj}" data-field="hye" placeholder="/${CAPS.hye}"></td>
      <td class="col-pct" data-cell="sector1-${subj}">0.0%</td>
      <td class="col-input"><input class="mark-input" type="number" min="0" max="${CAPS.pt2}" data-subject="${subj}" data-field="pt2" placeholder="/${CAPS.pt2}"></td>
      <td class="col-input"><input class="mark-input" type="number" min="0" max="${CAPS.see}" data-subject="${subj}" data-field="see" placeholder="/${CAPS.see}"></td>
      <td class="col-pct" data-cell="sector2-${subj}">0.0%</td>
      <td class="col-total" data-cell="total-${subj}">0.0%</td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".mark-input").forEach(input => {
    input.addEventListener("input", onMarkInput);
    input.addEventListener("blur", onMarkBlur);
  });
}

function onMarkInput(e) {
  const { subject, field } = e.target.dataset;
  const cap = CAPS[field];
  const val = e.target.value;
  if (val !== "" && Number(val) > cap) {
    e.target.classList.add("field-error");
  } else {
    e.target.classList.remove("field-error");
  }
  const clamped = clampValue(val, cap);
  state.marks[subject][field] = clamped;
  recompute();
}

function onMarkBlur(e) {
  const { subject, field } = e.target.dataset;
  const stored = state.marks[subject][field];
  e.target.value = stored === null ? "" : stored;
  e.target.classList.remove("field-error");
}

function recompute() {
  let sumSector1 = 0, sumSector2 = 0, sumTotal = 0;
  let rawPt1 = 0, rawHye = 0, rawPt2 = 0, rawSee = 0;
  let cntPt1 = 0, cntHye = 0, cntPt2 = 0, cntSee = 0;

  SUBJECTS.forEach(subj => {
    const c = computeSubject(subj);
    sumSector1 += c.sector1;
    sumSector2 += c.sector2;
    sumTotal += c.total;

    const m = state.marks[subj];
    if (m.pt1 !== null) { rawPt1 += m.pt1; cntPt1++; }
    if (m.hye !== null) { rawHye += m.hye; cntHye++; }
    if (m.pt2 !== null) { rawPt2 += m.pt2; cntPt2++; }
    if (m.see !== null) { rawSee += m.see; cntSee++; }

    const s1cell = document.querySelector(`[data-cell="sector1-${subj}"]`);
    const s2cell = document.querySelector(`[data-cell="sector2-${subj}"]`);
    const totCell = document.querySelector(`[data-cell="total-${subj}"]`);
    s1cell.textContent = `${fmt(c.sector1)}%`;
    s2cell.textContent = `${fmt(c.sector2)}%`;

    if (c.anyTerm1 && c.anyTerm2) {
      const g = gradeFor(c.total);
      totCell.innerHTML = `${fmt(c.total)}%<span class="grade-chip ${g.cls}">${g.label}</span>`;
    } else {
      totCell.textContent = `${fmt(c.total)}%`;
    }
  });

  const n = SUBJECTS.length;
  const avgSector1 = sumSector1 / n;
  const avgSector2 = sumSector2 / n;
  const grand = sumTotal / n;

  const avgPt1 = cntPt1 ? (rawPt1 / cntPt1 / CAPS.pt1) * WEIGHT_MAX.pt1 : 0;
  const avgHye = cntHye ? (rawHye / cntHye / CAPS.hye) * WEIGHT_MAX.hye : 0;
  const avgPt2 = cntPt2 ? (rawPt2 / cntPt2 / CAPS.pt2) * WEIGHT_MAX.pt2 : 0;
  const avgSee = cntSee ? (rawSee / cntSee / CAPS.see) * WEIGHT_MAX.see : 0;

  setStat("pt1", avgPt1, 10);
  setStat("hye", avgHye, 40);
  setStat("sector1", avgSector1, 50);
  setStat("pt2", avgPt2, 10);
  setStat("see", avgSee, 40);
  setStat("sector2", avgSector2, 50);
  setStat("grand", grand, 100, true);

  document.querySelector('[data-footer="pt1raw"]').textContent = cntPt1 ? `${rawPt1}/${cntPt1 * CAPS.pt1}` : "–";
  document.querySelector('[data-footer="hyeraw"]').textContent = cntHye ? `${rawHye}/${cntHye * CAPS.hye}` : "–";
  document.querySelector('[data-footer="pt2raw"]').textContent = cntPt2 ? `${rawPt2}/${cntPt2 * CAPS.pt2}` : "–";
  document.querySelector('[data-footer="seeraw"]').textContent = cntSee ? `${rawSee}/${cntSee * CAPS.see}` : "–";
  document.querySelector('[data-footer="sector1pct"]').textContent = `${fmt(avgSector1)}%`;
  document.querySelector('[data-footer="sector2pct"]').textContent = `${fmt(avgSector2)}%`;
  document.querySelector('[data-footer="grandpct"]').textContent = `${fmt(grand)}%`;

  const grandChip = document.getElementById("grandGradeChip");
  const anyEntered = cntPt1 || cntHye || cntPt2 || cntSee;
  if (anyEntered) {
    const g = gradeFor(grand);
    grandChip.textContent = g.label;
    grandChip.className = `grade-chip ${g.cls}`;
    grandChip.hidden = false;
  } else {
    grandChip.hidden = true;
  }

  const periodicPct = ((avgPt1 / 10) + (avgPt2 / 10)) / 2 * 100;
  const examPct = ((avgHye / 40) + (avgSee / 40)) / 2 * 100;
  updateLogo(periodicPct, examPct, grand, anyEntered);

  updateSimulator(grand);
  updateCharts();
}

function setStat(key, value, max, isGrand) {
  const el = document.querySelector(`.stat[data-key="${key}"] .stat-value`);
  if (isGrand) {
    el.childNodes[0].nodeValue = fmt(value);
    el.querySelector("small").textContent = `/${max}`;
  } else {
    el.innerHTML = `${fmt(value)}<small>/${max}</small>`;
  }
}

const LOGO_BASELINE = 30;
const LOGO_MIN_HEIGHT = 4;
const LOGO_MAX_HEIGHT = 19;

function setLogoBar(id, pct) {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  const height = LOGO_MIN_HEIGHT + (clamped / 100) * (LOGO_MAX_HEIGHT - LOGO_MIN_HEIGHT);
  const bar = document.getElementById(id);
  bar.setAttribute("y", LOGO_BASELINE - height);
  bar.setAttribute("height", height);
  return LOGO_BASELINE - height;
}

function updateLogo(periodicPct, examPct, overallPct, anyEntered) {
  setLogoBar("logoBar1", periodicPct);
  setLogoBar("logoBar2", examPct);
  const bar3Top = setLogoBar("logoBar3", overallPct);
  document.getElementById("logoDot").setAttribute("cy", bar3Top - 2.6);

  const badge = document.getElementById("logoGradeBadge");
  if (anyEntered) {
    const g = gradeFor(overallPct);
    badge.textContent = g.label;
    badge.className = `logo-grade-badge logo-grade-${g.cls.replace("grade-", "")}`;
  } else {
    badge.textContent = "\u2013";
    badge.className = "logo-grade-badge logo-grade-neutral";
  }
}

function updateScopeNote() {
  const note = document.getElementById("scopeNote");
  const grade = state.profile.grade;
  if (grade && (Number(grade) < 6 || Number(grade) > 8)) {
    note.textContent = `Class ${grade} typically follows a different weightage than KVS Classes 6–8 — the percentages below assume the 6–8 scheme, so treat them as indicative only.`;
  } else {
    note.textContent = "Calculations follow the KVS Classes 6–8 scheme: PT 10% and the term exam 40% per term.";
  }
  const subtitle = document.getElementById("subtitleText");
  subtitle.textContent = grade
    ? `KVS Class ${grade} Assessment Record \u00B7 Terms 1 & 2`
    : "KVS Assessment Record \u00B7 Classes 6\u20138";
}

function updateSimulator(currentGrand) {
  const readout = document.getElementById("simReadout");
  const targetInput = document.getElementById("targetInput");
  const target = Number(targetInput.value);

  if (!targetInput.value || Number.isNaN(target) || target <= 0) {
    readout.innerHTML = `<p class="sim-placeholder">Enter marks and a target to see what's still needed.</p>`;
    return;
  }

  let remainingWeight = 0;
  let remainingPt1Slots = 0, remainingHyeSlots = 0, remainingPt2Slots = 0, remainingSeeSlots = 0;
  let achieved = 0;

  SUBJECTS.forEach(subj => {
    const c = computeSubject(subj);
    achieved += c.total;
    const m = state.marks[subj];
    if (m.pt1 === null) { remainingWeight += WEIGHT_MAX.pt1; remainingPt1Slots++; }
    if (m.hye === null) { remainingWeight += WEIGHT_MAX.hye; remainingHyeSlots++; }
    if (m.pt2 === null) { remainingWeight += WEIGHT_MAX.pt2; remainingPt2Slots++; }
    if (m.see === null) { remainingWeight += WEIGHT_MAX.see; remainingSeeSlots++; }
  });

  const totalMax = SUBJECTS.length * 100;
  const needed = (target / 100) * totalMax;
  const requiredWeighted = needed - achieved;

  if (remainingWeight === 0) {
    if (requiredWeighted <= 0) {
      readout.innerHTML = `
        <p class="sim-headline status-good">Target already secured</p>
        <p class="sim-detail">Every assessment is entered and the cumulative is ${fmt(currentGrand)}%, at or above your ${fmt(target)}% target.</p>`;
    } else {
      readout.innerHTML = `
        <p class="sim-headline status-warn">Target out of reach</p>
        <p class="sim-detail">All assessments are already entered, so the final cumulative is fixed at ${fmt(currentGrand)}% — it can't reach ${fmt(target)}% now.</p>`;
    }
    return;
  }

  const requiredEfficiency = (requiredWeighted / remainingWeight) * 100;

  if (requiredEfficiency <= 0) {
    readout.innerHTML = `
      <p class="sim-headline status-good">Already on track</p>
      <p class="sim-detail">Marks entered so far already cover your ${fmt(target)}% target. Anything from here is a bonus.</p>`;
    return;
  }

  if (requiredEfficiency > 100) {
    readout.innerHTML = `
      <p class="sim-headline status-warn">Not mathematically possible</p>
      <p class="sim-detail">Even full marks in every remaining assessment top out below ${fmt(target)}%. The highest reachable cumulative is ${fmt((achieved + remainingWeight) / SUBJECTS.length)}%.</p>`;
    return;
  }

  const statusClass = requiredEfficiency > 85 ? "status-warn" : "status-good";
  const items = [];
  if (remainingPt1Slots) items.push({ label: "PT\u20111 avg", value: (requiredEfficiency / 100) * CAPS.pt1, max: CAPS.pt1 });
  if (remainingHyeSlots) items.push({ label: "Half yearly avg", value: (requiredEfficiency / 100) * CAPS.hye, max: CAPS.hye });
  if (remainingPt2Slots) items.push({ label: "PT\u20112 avg", value: (requiredEfficiency / 100) * CAPS.pt2, max: CAPS.pt2 });
  if (remainingSeeSlots) items.push({ label: "Session ending avg", value: (requiredEfficiency / 100) * CAPS.see, max: CAPS.see });

  readout.innerHTML = `
    <p class="sim-headline ${statusClass}">Need to average ${fmt(requiredEfficiency)}% across what's left</p>
    <p class="sim-detail">${remainingPt1Slots + remainingHyeSlots + remainingPt2Slots + remainingSeeSlots} assessment slot(s) are still blank across ${SUBJECTS.length} subjects. Hitting ${fmt(target)}% overall means averaging that percentage across every one of them.</p>
    <div class="sim-required-grid">
      ${items.map(i => `<div class="sim-required-item">${i.label}<strong>${fmt(i.value)}/${i.max}</strong></div>`).join("")}
    </div>`;
}

let barChart = null;
let radarChart = null;

function populateRadarSelect() {
  const select = document.getElementById("radarSubjectSelect");
  select.innerHTML = `<option value="__avg">All subjects (average)</option>` +
    SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join("");
  select.addEventListener("change", updateCharts);
}

function radarDataFor(key) {
  const pct = (raw, cap) => (raw === null ? 0 : (raw / cap) * 100);
  if (key === "__avg") {
    const totals = { pt1: 0, hye: 0, pt2: 0, see: 0 };
    SUBJECTS.forEach(s => {
      const m = state.marks[s];
      totals.pt1 += pct(m.pt1, CAPS.pt1);
      totals.hye += pct(m.hye, CAPS.hye);
      totals.pt2 += pct(m.pt2, CAPS.pt2);
      totals.see += pct(m.see, CAPS.see);
    });
    const n = SUBJECTS.length;
    return [totals.pt1 / n, totals.hye / n, totals.pt2 / n, totals.see / n];
  }
  const m = state.marks[key];
  return [pct(m.pt1, CAPS.pt1), pct(m.hye, CAPS.hye), pct(m.pt2, CAPS.pt2), pct(m.see, CAPS.see)];
}

function updateCharts() {
  const barLabels = SUBJECTS;
  const barData = SUBJECTS.map(s => computeSubject(s).total);

  if (!barChart) {
    barChart = new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: {
        labels: barLabels,
        datasets: [{
          label: "Subject total %",
          data: barData,
          backgroundColor: "#1B2A4A",
          borderRadius: 3,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => v + "%" }, grid: { color: "#E7E5D9" } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  } else {
    barChart.data.datasets[0].data = barData;
    barChart.update();
  }

  const select = document.getElementById("radarSubjectSelect");
  const radarValues = radarDataFor(select.value || "__avg");
  const radarLabels = ["PT\u20111", "Half yearly", "PT\u20112", "Session ending"];

  if (!radarChart) {
    radarChart = new Chart(document.getElementById("radarChart"), {
      type: "radar",
      data: {
        labels: radarLabels,
        datasets: [{
          label: "% of max",
          data: radarValues,
          backgroundColor: "rgba(184,134,43,0.25)",
          borderColor: "#B8862B",
          pointBackgroundColor: "#B8862B"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false },
            grid: { color: "#E7E5D9" },
            angleLines: { color: "#E7E5D9" },
            pointLabels: { font: { size: 11 } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  } else {
    radarChart.data.datasets[0].data = radarValues;
    radarChart.update();
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2400);
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showToast("Saved to this device");
  } catch (err) {
    showToast("Couldn't save — storage may be full or blocked");
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed.profile) Object.assign(state.profile, parsed.profile);
    if (parsed.marks) {
      SUBJECTS.forEach(s => {
        if (parsed.marks[s]) Object.assign(state.marks[s], parsed.marks[s]);
      });
    }
    return true;
  } catch (err) {
    return false;
  }
}

function applyProfileToDom() {
  document.getElementById("studentName").value = state.profile.name || "";
  document.getElementById("studentClass").value = state.profile.grade || "";
  document.getElementById("studentSection").value = state.profile.section || "";
  document.getElementById("studentRoll").value = state.profile.roll || "";
}

function applyMarksToDom() {
  document.querySelectorAll(".mark-input").forEach(input => {
    const { subject, field } = input.dataset;
    const val = state.marks[subject][field];
    input.value = val === null ? "" : val;
  });
}

function bindProfileInputs() {
  document.getElementById("studentName").addEventListener("input", e => {
    state.profile.name = e.target.value;
  });
  document.getElementById("studentClass").addEventListener("change", e => {
    state.profile.grade = e.target.value;
    updateScopeNote();
  });
  document.getElementById("studentSection").addEventListener("input", e => {
    state.profile.section = e.target.value.toUpperCase().slice(0, 2);
    e.target.value = state.profile.section;
  });
  document.getElementById("studentRoll").addEventListener("input", e => {
    let v = e.target.value;
    if (v !== "" && Number(v) > 99) v = "99";
    if (v !== "" && Number(v) < 1) v = "1";
    e.target.value = v;
    state.profile.roll = v;
  });
}

function populateRollDatalist() {
  const list = document.getElementById("rollOptions");
  let html = "";
  for (let i = 1; i <= 99; i++) {
    const padded = String(i).padStart(2, "0");
    html += `<option value="${i}">${padded}</option>`;
  }
  list.innerHTML = html;
}

function resetAll() {
  const confirmed = window.confirm("This clears the profile and every mark entered. Continue?");
  if (!confirmed) return;
  state.profile = { name: "", grade: "", section: "", roll: "" };
  SUBJECTS.forEach(s => { state.marks[s] = { pt1: null, hye: null, pt2: null, see: null }; });
  localStorage.removeItem(STORAGE_KEY);
  applyProfileToDom();
  applyMarksToDom();
  document.getElementById("targetInput").value = "";
  updateScopeNote();
  recompute();
  showToast("Register cleared");
}

function init() {
  buildRows();
  populateRollDatalist();
  populateRadarSelect();
  bindProfileInputs();

  loadFromStorage();
  applyProfileToDom();
  applyMarksToDom();
  updateScopeNote();
  recompute();

  document.getElementById("saveBtn").addEventListener("click", saveToStorage);
  document.getElementById("resetBtn").addEventListener("click", resetAll);
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("targetInput").addEventListener("input", () => recompute());
  document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("targetInput").value = btn.dataset.target;
      recompute();
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
