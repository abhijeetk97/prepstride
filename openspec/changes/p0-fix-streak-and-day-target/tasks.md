## 1. Single definition of a study day
- [x] In `src/utils/gamification.ts`, replace the streak rule at lines ~115–148 (`mins >= Math.min(target, 240)`) with: streak day = day with ≥ 30 min total logged study.
- [x] Keep a `targetMetDay` helper for shields, computed against the real target with no 240-min cap.
- [x] Verify via `useAppData` that today's target reads current Settings (a mid-day change applies today, not tomorrow).

## 2. Home surface
- [x] Ring keeps showing progress vs target; label reads as progress (e.g. "2h today · target 4h"), not shortfall-as-failure.
- [x] Streak chip shows 1 after the day's first qualifying session; remove "start today" copy for any day with study logged.
- [x] Target quick-chips on Home (`DashboardScreen.tsx`) expose the Settings range (2–10h) and stay in sync with it.

## 3. Verify
- [x] Fresh state, 8h target: log a 2h session → streak 1, ring 2h/8h, no failure framing.
- [x] Day with only 25 min → streak neither extended nor broken; the 30-min floor is explained once, gently.
- [x] Change target 8h → 3h mid-day → ring, day summary and shields use 3h today.
- [x] `npm run typecheck` passes.
