# PCCS — Packaged Commodity Compliance System

**Smart India Hackathon 2026 — Problem Statement 26034**
Software System to check compliance of Packaged Commodities under the Legal Metrology (Packaged Commodities) Rules, 2011.

An enforcement officer (or a consumer) photographs a product label. The system reads the label with **free, local OCR**, structures the text into the statutory fields, and a **deterministic rule engine** — not AI — decides whether the label complies with rules LM-001 through LM-009. Results come with a compliance score, per-rule evidence, a printable statutory report, a consumer-facing self-check flow, and an analytics dashboard for enforcement trends.

## Why AI only extracts, and rules decide

The OCR layer reads what's printed on the label into plain text and structures it into fields (manufacturer, net quantity, MRP, dates, etc.). It never judges compliance. A separate, fixed set of rules in `backend/src/rules/ruleEngine.js` decides PASS / FAIL / REVIEW / N/A for each requirement, from that structured data. This keeps every verdict traceable to a specific rule and a specific piece of evidence — important since a verdict could lead to real enforcement action, and "the AI said so" isn't an acceptable audit trail for that.

## Architecture

```
[Label photo] → [Tesseract.js OCR] → [Regex field extractor] → [Deterministic rule engine LM-001..009] → [Verdict + score + evidence] → [Report / History / Analytics]
```

- **OCR**: [Tesseract.js](https://github.com/naptha/tesseract.js) — open-source, runs entirely on your machine, **no API key, no cost, no external calls at inference time**.
- **Field extraction**: hand-written regex/heuristics in `backend/src/services/extractor.js` — deterministic and explainable, same philosophy as the rule engine.
- **Rule engine**: `backend/src/rules/ruleEngine.js`, driven by the rule catalog in `backend/src/config/rules.json`. Add/edit rules there without touching code.
- **Storage**: flat JSON files (`backend/data/*.json`) — zero setup, good for a hackathon demo. Swap for Postgres/Mongo later if you need concurrent multi-user writes.

## Project structure

```
sih26034/
├── backend/                  Node.js + Express API
│   ├── src/
│   │   ├── server.js         App entrypoint
│   │   ├── config/rules.json The 9 LM rules — edit this to change what's checked
│   │   ├── rules/ruleEngine.js
│   │   ├── services/
│   │   │   ├── ocrService.js     Tesseract.js OCR wrapper
│   │   │   ├── extractor.js      Raw text → structured fields
│   │   │   └── store.js          JSON file storage
│   │   ├── routes/
│   │   │   ├── inspections.js    Upload → OCR → rules → verdict
│   │   │   ├── complaints.js     Consumer complaint intake
│   │   │   ├── analytics.js      Aggregated stats
│   │   │   └── auth.js           Demo officer login + rule catalog
│   │   └── middleware/upload.js
│   └── uploads/               Label images land here
│
└── frontend/                  React + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Login.jsx           Officer login (+ 1-click demo login)
        │   ├── Dashboard.jsx       Stats + recent inspections
        │   ├── NewInspection.jsx   Upload label, run pipeline
        │   ├── Results.jsx         Per-rule verdict + evidence
        │   ├── History.jsx         Searchable inspection log
        │   ├── Report.jsx          Printable statutory report
        │   ├── Analytics.jsx       Charts: trends, top failed rules
        │   ├── RuleCatalog.jsx     The 9 rules, explained
        │   └── ConsumerScan.jsx    Public self-check + complaint flow
        └── components/             Sidebar, StatusBadge, ScoreGauge, CheckRow
```

## Setup

Requires **Node.js 18+**.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:8000`. First OCR request downloads Tesseract's English language model (~15MB) once and caches it — after that it works fully offline.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` and `/uploads` to the backend.

### 3. Try it

- Open `http://localhost:5173/login` → click **Demo Login**.
- Go to **New Inspection**, upload a photo of any packaged product label, pick a category, run the check.
- See the per-rule verdict on **Results**, print a report from **Report**, browse **History**, and check **Analytics** after a few inspections.
- Visit `http://localhost:5173/scan` (no login) for the consumer-facing self-check + complaint flow.

## Demo credentials

- Officer ID: `officer1`
- Password: `demo123`
- Or just click **Demo Login** — no typing needed for judges.

## Known limitations (be upfront about these when presenting)

- Field extraction uses regex heuristics tuned for common label phrasing (English). Handwritten or heavily stylized labels, and non-English-only labels, will need review-status fallbacks or a bigger training pass.
- Generic-name detection (LM-003) is the weakest heuristic — it often needs officer confirmation, which is why it defaults to REVIEW rather than guessing.
- Storage is JSON files for zero-setup demoing; move to Postgres before any real multi-officer deployment.
- Auth is a single demo account — replace with real officer accounts + JWT before production use.

## Next steps if you have more build time

- Barcode/GS1 lookup to cross-check declared net quantity against registered product data.
- Multilingual OCR (Tesseract supports Hindi/regional language packs — just add them to `createWorker`).
- Offline-first mobile capture for inspectors with poor connectivity, syncing when back online.
- Confidence-weighted REVIEW queue so officers triage low-confidence extractions first.
