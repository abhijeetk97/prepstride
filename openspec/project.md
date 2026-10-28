# PrepStride — Project Context

## Purpose
Personal, single-user UPSC CSE 2027 preparation companion (PWA), used daily on a phone by one aspirant. No backend, no accounts: all data lives locally in IndexedDB (Dexie, `src/db/index.ts`) with JSON export/restore as the only safety net.

## North star (from the 2026-10 product review)
The app must reduce cognitive load, not add a second job to a 14-hour study day. Every number shown to the user — day total, streak, revision due dates, mock scores — must be exactly true before any new feature is built. Never invent data the user did not enter (times, dates, counts).

## Tech & conventions
- React 18 + TypeScript + Vite + Tailwind. Screens in `src/screens/*`, shared hooks in `src/hooks/*`, pure logic in `src/utils/*` (`scores.ts`, `gamification.ts`, `dates.ts`).
- Phone-first: designed at ~390px. Desktop renders a centered 512px column — intentional; do not redesign for desktop.
- Five themes via Tailwind tokens (`tailwind.config.js`); active theme in settings.
- Vitest covers pure functions in `src/utils` (`npm test`).
- All touch controls target ≥ 44×44px hit areas. Icon-only controls use the `hit` class; chips and text buttons use a 44px minimum height.

## Non-goals (from review — do not build)
- More ranks, badges, confetti, cosmetics, or XP-grinding mechanics.
- PYQ question banks, newspaper scrapers, AI answer checkers.
- Accounts, cloud sync, feeds, coaching marketplace. JSON backup stays the safety net; multi-device only if she actually studies on two devices.
- More optional-subject templates beyond the one she takes; desktop redesign.
- A weekly planner was explicitly requested on 2026-10-28 and is now in scope; keep it lightweight and connected to the existing syllabus and study timer.

## Change folder conventions
- Change IDs are prefixed `p0-`, `p1-`, `p2-` matching the review's priority. Implement in order within a priority.
- Each change has `proposal.md`, `tasks.md`, and spec deltas under `specs/<capability>/spec.md`.
- Changes that alter arithmetic (scoring, streaks, scheduling) must state the exact arithmetic in the delta.
