## 1. Quick log truthfulness
- [x] `RetroLogModal.tsx`: add optional start-time input (time picker); remove the `now − duration` back-computation at line ~30.
- [x] Persist records with no start time as date + duration only (verify `src/types/index.ts` and Dexie schema tolerate a missing `startTime`).
- [x] `TimesheetScreen.tsx`: render records without a start time as "2h · Polity & Governance" — never print an invented clock range.
- [x] `src/utils/gamification.ts`: time-of-day badges (Dawn Warrior) require a non-null `startTime` on the record.

## 2. Timer truthfulness
- [x] `useTimer.ts:118,139`: replace `Math.round` with `Math.floor` for saved minutes; keep raw seconds in the record if useful.
- [x] On stop with < 60s real elapsed (accumulated running time, excluding pauses): discard the session and toast "Under a minute — not logged".
- [x] Verify a paused-then-stopped session saves only the time it actually ran.

## 3. Live session integrity
- [x] `TimerBar.tsx`: reserve layout space (or dock) so "Today's rituals" and other content are never covered.
- [x] Home primary button while a session is live: "Back to session" → opens the running timer, never the start sheet.
- [x] `useTimer.start()`: no-op (or resume) if a session is already live; a second start must never replace it.

## 4. Delete + undo
- [x] Session delete in Study screen: keep confirmation, add Undo toast (~5s) that restores the exact record.

## 5. Verify
- [x] Save 2h at 8:34 AM with no start time → Study shows "2h", no 6:34–8:34 range, no Dawn Warrior.
- [x] Enter start time 6:30 AM explicitly → range shown, badge evaluates on 6:30.
- [x] Run timer 37s → stop → no session saved, toast shown, day total unchanged.
- [x] Start session, go Home → CTA says "Back to session"; rituals fully visible.
- [x] Delete a session → Undo restores it with identical fields.
- [x] `npm run typecheck` passes.
