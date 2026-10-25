## 1. Quick log truthfulness
- [ ] `RetroLogModal.tsx`: add optional start-time input (time picker); remove the `now − duration` back-computation at line ~30.
- [ ] Persist records with no start time as date + duration only (verify `src/types/index.ts` and Dexie schema tolerate a missing `startTime`).
- [ ] `TimesheetScreen.tsx`: render records without a start time as "2h · Polity & Governance" — never print an invented clock range.
- [ ] `src/utils/gamification.ts`: time-of-day badges (Dawn Warrior) require a non-null `startTime` on the record.

## 2. Timer truthfulness
- [ ] `useTimer.ts:118,139`: replace `Math.round` with `Math.floor` for saved minutes; keep raw seconds in the record if useful.
- [ ] On stop with < 60s real elapsed (accumulated running time, excluding pauses): discard the session and toast "Under a minute — not logged".
- [ ] Verify a paused-then-stopped session saves only the time it actually ran.

## 3. Live session integrity
- [ ] `TimerBar.tsx`: reserve layout space (or dock) so "Today's rituals" and other content are never covered.
- [ ] Home primary button while a session is live: "Back to session" → opens the running timer, never the start sheet.
- [ ] `useTimer.start()`: no-op (or resume) if a session is already live; a second start must never replace it.

## 4. Delete + undo
- [ ] Session delete in Study screen: keep confirmation, add Undo toast (~5s) that restores the exact record.

## 5. Verify
- [ ] Save 2h at 8:34 AM with no start time → Study shows "2h", no 6:34–8:34 range, no Dawn Warrior.
- [ ] Enter start time 6:30 AM explicitly → range shown, badge evaluates on 6:30.
- [ ] Run timer 37s → stop → no session saved, toast shown, day total unchanged.
- [ ] Start session, go Home → CTA says "Back to session"; rituals fully visible.
- [ ] Delete a session → Undo restores it with identical fields.
- [ ] `npm run typecheck` passes.
