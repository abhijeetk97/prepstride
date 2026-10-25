## Why
Three data-integrity bugs from the review, all in how sessions are recorded:

1. **Quick log invents a clock.** `src/components/timesheet/RetroLogModal.tsx:30` back-computes `start = now − duration`. Saving 2 hours at 8:34 AM stored a 6:34–8:34 AM session and unlocked **Dawn Warrior** ("2-hour session before 8:00 AM") off data she never entered.
2. **Timer rounds up.** `src/hooks/useTimer.ts:118,139` uses `Math.round(durationMs / 60_000)`, so a stopwatch stopped at ~37s became a visible "Focus session · 1m" inside the day's total.
3. **Live session is fragile.** The running-session bar overlaid Today's rituals; the Home button relabelled "Session running" but still opened the start sheet, and a second start silently replaced the live timer. Session delete asks a native confirm but has no undo.

## What Changes
- Quick log gets an **optional start-time field** (default blank = "no time recorded"). When blank, the record stores date + duration only — no start/end times. When filled, the entered time is stored verbatim.
- Time-of-day achievements (Dawn Warrior etc.) evaluate **only** on records with a real user-entered or timer-captured start time.
- Timer stop records true elapsed minutes (`Math.floor`, never round up); sessions with **< 60 seconds** real elapsed are discarded with a toast ("Under a minute — not logged").
- While a session is live: the Home CTA becomes "Back to session" (opens the running timer), `start()` is guarded against double starts, and the timer bar no longer covers content (takes layout space or docks without overlapping).
- Deleting a session confirms, then offers a several-second **Undo** toast that restores the record.

## Capability Impact
- `study-sessions`: ADDS requirements (truthful times, minimum duration, delete undo).
- `timer`: ADDS requirements (exact elapsed, single live session, non-overlapping bar).
- `rewards`: ADDS requirement (badges only from real recorded data).
