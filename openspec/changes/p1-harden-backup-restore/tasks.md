## 1. Export feedback
- [x] `SettingsScreen.tsx` / `backup.ts`: after export completes, toast with the filename + timestamp.

## 2. Restore safety
- [x] Split restore into parse (validate schema/version, count records) → confirm modal (counts + date range + "Replace all data" / "Cancel") → only then write.
- [x] Invalid file: error toast ("That file isn't a PrepStride backup"), zero writes.
- [x] After restore: success toast + live queries refresh (verify Dexie live queries re-render without reload).

## 3. Verify
- [x] Export on phone → toast appears; file downloads.
- [x] Pick a valid backup → modal with counts; Cancel → data unchanged.
- [x] Confirm → data replaced; app state consistent without manual reload.
- [x] Pick a random .json → error toast, nothing lost.
- [x] `npm run typecheck` passes.
