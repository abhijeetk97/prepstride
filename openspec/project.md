# PrepStride — Project Context

## Purpose
Personal, single-user UPSC CSE 2027 preparation companion (PWA), used daily on a phone by one aspirant. No backend, no accounts: all data lives locally in IndexedDB (Dexie, `src/db/index.ts`) with JSON export/restore as the only safety net.

## North star (from the 2026-10 product review)
The app must reduce cognitive load, not add a second job to a 14-hour study day. Every number shown to the user — day total, streak, revision due dates, mock scores — must be exactly true before any new feature is built. Never invent data the user did not enter (times, dates, counts).

## Tech & conventions
- React 18 + TypeScript + Vite + Tailwind. Screens in `src/screens/*`, shared hooks in `src/hooks/*`, pure logic in `src/utils/*` (`scores.ts`, `gamification.ts`, `dates.ts`).
- Phone-first: designed at ~390px. Desktop renders a centered 512px column — intentional; do not redesign for desktop.
- Five themes via Tailwind tokens (`tailwind.config.js`); active theme in settings.
- No test runner yet. Pure functions in `src/utils` are where unit tests belong (add vitest when first needed — see change `p0-fix-prelims-scoring`).
- All touch controls target ≥ 44×44px hit areas (see change `p1-meet-touch-targets`).

## Non-goals (from review — do not build)
- More ranks, badges, confetti, cosmetics, or XP-grinding mechanics.
- PYQ question banks, newspaper scrapers, AI answer checkers.
- Accounts, cloud sync, feeds, coaching marketplace. JSON backup stays the safety net; multi-device only if she actually studies on two devices.
- More optional-subject templates beyond the one she takes; weekly planner; desktop redesign.

## Change folder conventions
- Change IDs are prefixed `p0-`, `p1-`, `p2-` matching the review's priority. Implement in order within a priority.
- Each change has `proposal.md`, `tasks.md`, and spec deltas under `specs/<capability>/spec.md`.
- Changes that alter arithmetic (scoring, streaks, scheduling) must state the exact arithmetic in the delta.
