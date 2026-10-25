## Why
The review found that a normal 2-hour Polity morning leaves the streak at **0 · start today**, because the streak only counts days where study ≥ `min(target, 4h)` (`src/utils/gamification.ts:117,148`), while the Home ring demands the full target. A studied-but-under-target day reads as a failure. Additionally: Home target chips offer 6h–10h while Settings allows 2h+, and changing the target in Settings does not apply to today.

## What Changes
- The streak counts consecutive **studied days**: a day with ≥ 30 minutes of logged study extends it. The daily target no longer affects the streak and the 4-hour cap is removed.
- Target-met days stay as a separate, clearly-labelled concept (shields keep using them) — but no Home copy may frame a studied-but-under-target day as a miss.
- The daily target has one source of truth (Settings), applies immediately including today, and is capped nowhere.
- Home target quick-chips use the same range as Settings (2h–10h), default 4h.
- After the first qualifying session of the day, the streak shows "1 day" — never "0 · start today".

## Capability Impact
- `home`: ADDS requirements (studied-day streak, single-target truth, chip range).
- `rewards`: shields keep the target-met rule, unchanged semantics — display only aligns with the new streak value.
