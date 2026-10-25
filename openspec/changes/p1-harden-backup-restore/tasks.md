## 1. Export feedback
- [ ] `SettingsScreen.tsx` / `backup.ts`: after export completes, toast with the filename + timestamp.

## 2. Restore safety
- [ ] Split restore into parse (validate schema/version, count records) → confirm modal (counts + date range + "Replace all data" / "Cancel") → only then write.
- [ ] Invalid file: error toast ("That file isn't a PrepStride backup"), zero writes.
- [ ] After restore: success toast + live queries refresh (verify Dexie live queries re-render without reload).

## 3. Verify
- [ ] Export on phone → toast appears; file downloads.
- [ ] Pick a valid backup → modal with counts; Cancel → data unchanged.
- [ ] Confirm → data replaced; app state consistent without manual reload.
- [ ] Pick a random .json → error toast, nothing lost.
- [ ] `npm run typecheck` passes.
