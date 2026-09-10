<div align="center">

# 📊 Result Tracker

### Your marks, your math, your device — nothing leaves the browser.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

![No Build Step](https://img.shields.io/badge/build%20step-none-2E9F6E?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-3E5C89?style=flat-square)
![Works Offline](https://img.shields.io/badge/works-offline-F2994A?style=flat-square)
![Data Storage](https://img.shields.io/badge/data-stays%20on%20device-2E9F6E?style=flat-square)
![Made by Arnav Pathi](https://img.shields.io/badge/made%20by-Arnav%20Pathi-6C63FF?style=flat-square)

</div>

---

### 🎬 See it in action

<!--
  👋 ARNAV — drop your screenshots/GIFs here! Easiest way on GitHub:
  just drag an image file into this README while editing on github.com
  and it'll auto-upload and paste the markdown for you.
  Suggested shots: the marks register mid-entry, the target simulator
  doing its thing, and the two charts with a few subjects filled in.
-->

<div align="center">

<!-- 🖼️ PLACEHOLDER — replace with your own screenshot -->
`[ screenshot goes here — dashboard overview ]`

<!-- 🖼️ PLACEHOLDER — replace with your own screenshot -->
`[ screenshot goes here — target simulator in action ]`

<!-- 🎥 PLACEHOLDER — replace with a GIF for extra flair -->
`[ gif goes here — typing marks and watching everything recalculate live ]`

</div>

---

## 🧭 What is this thing

A single-page result tracker built around the **KVS Classes 6–8** evaluation scheme. You punch in raw marks as they get declared, and every percentage, grade, and chart updates *instantly* — no page reloads, no backend, no account, no ads. Just you, your marks, and some honest math.

## 📚 Table of contents

- [✨ Features](#-features)
- [🚀 Getting started](#-getting-started)
- [🗂️ File structure](#️-file-structure)
- [🧮 How the scoring works](#-how-the-scoring-works)
- [⚠️ Limitations — read this one](#️-limitations--read-this-one)
- [👤 Credits](#-credits)

## ✨ Features

- 🈳 **Starts blank.** No fake sample student, no pre-filled marks — just friendly placeholders telling you what to type.
- 🎯 **Live recalculation.** Every number on the page — table cells, the summary strip, the header logo's mini bar chart, the badge next to it — updates the instant you type a mark.
- 🚦 **Grade chips** (A1 down to E2) pop in automatically once a subject's got both terms filled in, color-coded so you can scan for trouble spots at a glance.
- 🎮 **Target simulator.** Set a goal percentage (or tap an A1 / A2 / B1 / B2 preset) and it tells you exactly what average you need across whatever's still blank — and calls it out plainly if the target's already locked in or already out of reach.
- 📈 **Two live charts** — a bar chart comparing subjects side by side, and a radar chart you can point at any single subject to see its PT vs. exam shape.
- 💾 **Save / Reset, no cloud required.** "Save data" tucks everything into your browser's local storage; "Reset" double-checks with you before wiping it.
- 🖨️ **Print-ready.** Hit "Print report" and every button and control politely disappears, leaving a clean report card.
- 🔒 **Actually private.** No network calls except loading Chart.js and the fonts once. Your marks never leave your device.

## 🚀 Getting started

No `npm install`, no build tools, no drama.

1. Keep `index.html`, `styles.css`, and `script.js` in the same folder.
2. Double-click `index.html` (or open it from your browser).
3. Start typing marks.

That's genuinely it. 🎉

> First load needs the internet once, to fetch Chart.js and the fonts from a CDN. After that, it's happy fully offline.

## 🗂️ File structure

```
result-tracker/
├── index.html    → page structure: profile, register, simulator, charts
├── styles.css     → every pixel of styling + the print layout
├── script.js      → the brains: formulas, validation, storage, charts
└── README.md      → you are here 👋
```

## 🧮 How the scoring works

<details>
<summary><strong>Click to expand the full formula breakdown</strong> (it's just weighted percentages, promise)</summary>

<br>

Each of the six subjects — Science, SST, Maths, English, Hindi, Sanskrit — is scored identically:

**Term 1**

| Component | Raw max | Weight | Formula |
|---|---|---|---|
| PT‑1 | 40 | 10% | `(PT1 ÷ 40) × 10` |
| Half Yearly Exam | 60 | 40% | `(HYE ÷ 60) × 40` |

`Term 1 % = PT‑1 weighted + HYE weighted` → out of **50%**

**Term 2**

| Component | Raw max | Weight | Formula |
|---|---|---|---|
| PT‑2 | 40 | 10% | `(PT2 ÷ 40) × 10` |
| Session Ending Exam | 60 | 40% | `(SEE ÷ 60) × 40` |

`Term 2 % = PT‑2 weighted + SEE weighted` → out of **50%**

**Subject total % = Term 1 % + Term 2 %** → out of **100%**

**Cumulative % = average of all six subject totals**

A subject only earns a grade chip once *both* terms have at least one mark in — a half-filled subject shows its running percentage, no grade, because the number isn't final yet.

</details>

## ⚠️ Limitations — read this one

> **This tracker is hard-wired for the KVS Classes 6–8 scheme** — PT‑1 (10%), Half Yearly (40%), PT‑2 (10%), Session Ending (40%). Nothing else.

It will **not** correctly score:
- 🎓 Senior classes (9–12) — different KVS structure with internals, practicals, and a different split.
- 🏫 Non-KVS CBSE schools — many run their own periodic-test count or weightage.
- 🌍 Any non-CBSE board (ICSE, state boards, IB, etc.) — structurally different entirely.

Feed it a different scheme's marks and it'll cheerfully produce a percentage that *looks* legit and isn't. To adapt it, tweak the `CAPS` and `WEIGHT_MAX` constants near the top of `script.js` to match your scheme, and update the table headers in `index.html` to match.

Also: data lives only in that browser's `localStorage` on that device. Switch browsers, go incognito, or clear site data, and the saved register won't follow you.

## 👤 Credits

<div align="center">

**Built by Arnav Pathi**

[![GitHub](https://img.shields.io/badge/GitHub-arnavpathi1472013--tech-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/arnavpathi1472013-tech)
[![Gmail](https://img.shields.io/badge/Gmail-arnav.pathi1472013%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:arnav.pathi1472013@gmail.com)
[![Instagram](https://img.shields.io/badge/Instagram-%40arnav__pathi__147-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/arnav_pathi_147)

© 2026 Arnav Pathi · Made with 🧠, ☕, and way too much percentage math.

</div>
