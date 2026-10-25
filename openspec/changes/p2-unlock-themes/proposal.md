## Why
From the review: Mussoorie Mist, Zen Forest, and LBSNAA Gold are rank-gated at Rank 3/4/5 (`src/screens/SettingsScreen.tsx:10-15,123`). A single daily user should not have to grind XP for a color; Midnight is already the night theme she needs and the others are moods, not rewards.

## What Changes
- All five themes are selectable from day one (`unlockLevel` removed or set to 1 for all).
- The rank/XP system stays as feedback only — nothing functional or cosmetic is locked behind it anymore (badge unlocks like Dawn Warrior remain, but must obey `p0-fix-session-and-timer-integrity`).
- Theme picker copy updated (no "Unlocks at Rank N" strings).

## Capability Impact
- `themes`: ADDS requirement (all themes available immediately).
