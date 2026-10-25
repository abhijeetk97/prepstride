## 1. Ungate
- [x] `SettingsScreen.tsx` THEMES array (lines 10–15): drop `unlockLevel` (or set all to 1); remove the `rankUnlocked` gating at line ~123 and the "Unlocks at Rank N" copy at ~134.

## 2. Verify
- [x] Fresh install: all five themes selectable, none greyed out.
- [x] Rank display still works; nothing else references theme unlock levels (`grep -r unlockLevel src`).
- [x] `npm run typecheck` passes.
