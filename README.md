# PrepStride 🐦

**Your Quiet, Cheerful UPSC CSE Preparation & Timesheet Companion** — featuring **Pip the Stride Bird**.

> 🌐 **Live app:** https://abhijeetk97.github.io/prepstride/
>
> 100% offline · local-first (IndexedDB) · zero backend · installable PWA · $0/month

## What's inside (13 modules)

| # | Module | Where |
|---|--------|-------|
| 1 | Hybrid timesheet — Pomodoro/stopwatch (survives app switch & refresh) + 3-second retro quick-log | Study tab |
| 2 | Consistency analytics — 365-day GitHub-style heatmap, weekly/monthly views, 7/30-day rolling averages | Analytics |
| 3 | Micro-syllabus checklist — complete Prelims & Mains GS 1–4 + CSAT pre-loaded, 6-state topics, optional templates (PSIR, Sociology, Geography, Anthropology, PubAd, History) + custom topics | Syllabus |
| 4 | Spaced revision engine — Rev1 +3d · Rev2 +7d · Rev3 +21d · Rev4+ +60d, due queue, 30-day stale alerts | Syllabus → Revision queue |
| 5 | Daily UPSC rituals — newspaper, editorial notes, MCQs, answer writing, CSAT, CA magazine | Home |
| 6 | Mock analyzer — Prelims score `(correct×2) − (incorrect×0.666)` + accuracy + trend vs 100-mark target; Mains records with feedback tags | Tests |
| 7 | Prelims mistake diary — 4 categories, search, takeaways | Tests → Mistakes |
| 8 | Booklist tracker — Laxmikanth, Spectrum, Shankar IAS & more with chapter progress + revision passes | Analytics → Books |
| 9 | 1-tap partner share — beautiful PNG card with Pip via html-to-image + Web Share API / WhatsApp fallback | Home → Share digest |
| 10 | Mental health — D-Day countdown, energy/focus stars, reflection, 5 zen themes | Home / Settings |
| 11 | Data sovereignty — 1-click JSON backup/restore, weekly backup nudge | Settings |
| 12 | Gamification — 7 Civil Services ranks with Pip evolution, 8 Badges of Honor, Streak Shields (rest-day grace, max 3), Treat Box couple coupons with custom builder & redemption share | Rewards |
| 13 | Weekly planner — syllabus topic selection, custom targets, reading/revision/MCQ/answer/mock outcomes, day assignments, weekly hours goal, carry-forward, and timer handoff | Home → Your weekly plan / More → Weekly planner |

## Weekly planning

Open **Home → Your weekly plan** (also available in More). Weeks run Monday–Sunday.

1. Set an hours goal for the selected week; six daily goals is an editable suggestion, leaving a catch-up day.
2. Add syllabus topics across papers or a custom target for current affairs, essays, CSAT or a test series. Search by topic/category or filter revisions due by Sunday.
3. Choose an activity, a clear outcome, an estimated duration per target, and a day (or leave it flexible).
4. Use **Study this target** to open a timer prefilled with its subject and topic. Check off completed outcomes separately; actual hours come only from saved study sessions.
5. Review unfinished work from the previous week and carry only what still matters. Copies retain the previous week's history and are not offered twice.

Targets can be edited, rescheduled or removed with Undo. Weekly plans are stored offline in IndexedDB and included in JSON backups. Restoring older backups remains supported. Completing a planner target does not alter syllabus status or manufacture study time.

## Install as an app (100% offline)

- **iPhone/iPad:** Safari → Share → **Add to Home Screen**
- **Android:** Chrome → menu → **Install app**
- **Desktop:** Chrome/Edge install icon in the address bar

After first load, the service worker pre-caches everything — airplane mode works flawlessly.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
```

**Stack:** React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3.4 · Dexie.js 4 (`prepstride_db`) · vite-plugin-pwa (Workbox) · html-to-image · Lucide icons.

## Deployment (no CI/CD — one command)

The production bundle is published from the `gh-pages` branch; GitHub Pages serves it directly. To ship a new version:

```bash
npm run deploy   # builds, pushes dist/ to gh-pages, live in ~30s
```

The app also shows an **Add to Home Screen** popup (native install prompt on Android/Chrome, step-by-step guide on iOS Safari) — also available anytime from **More → Add to Home Screen**.

## Data & privacy

All data stays in the browser's IndexedDB (`prepstride_db`). Nothing is sent anywhere unless *you* tap Share. Use **Settings → Export JSON** weekly (the app gently reminds you every 7 days).

---

Made with 💛 for a future officer · *PRD & TRD live in `PRD.md` and `TRD.md`*
