## Why
From the review: Export JSON runs and writes a file with **no on-screen confirmation**; Restore **replaces every table the moment a file is picked**, warned only by a footnote ("Restore replaces all current data."). A mis-pick on the only copy of all her data is one tap away (`src/db/backup.ts`).

## What Changes
- **Export**: success toast naming the file and timestamp ("Backup saved · prepstride-backup-2026-10-25.json").
- **Restore**: parse the file **first**; then show a confirmation modal summarizing what's inside (session count, tests, mistakes, syllabus items, date range) with an explicit "Replace all data" action. Cancel writes nothing. An invalid/unparseable file shows an error toast and touches nothing.
- Post-restore success toast; the app refreshes all live queries.

## Capability Impact
- `backup`: ADDS requirements (export feedback, parse-then-confirm restore, invalid-file handling). Only `src/db/backup.ts` + `SettingsScreen.tsx` flows change; format unchanged.
