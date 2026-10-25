## 1. Model
- [ ] `src/types/index.ts`: make scheduling count-based — `revisionCount` drives status; `nextRevisionDue` becomes required (computed) for every item past `not_started`.
- [ ] Interval helper (in `src/utils/dates.ts` or a new `src/utils/revision.ts`): first due = lastTouched + 3d; after rev n → next = lastTouched + [7, 21, 60, 60…][n] (n = 1, 2, 3, 4+).
- [ ] Extend status set to Rev3 / Rev4+ (or render from `revisionCount`); keep "Mastered" as an explicit action gated on ≥ 1 revision, which permanently leaves the queue.
- [ ] Migration-safe: on load, backfill `nextRevisionDue` for any read item missing one (first_reading/notes_done with no due → today + 3d from `lastTouched` if present, else from creation date).

## 2. Queue + stale (`SyllabusScreen.tsx`)
- [ ] Queue sections: Overdue → Due today → Next 7 days (collapsed counts are fine).
- [ ] "Revision N done" action on each queue item: sets `lastTouched = today`, bumps `revisionCount`, computes and shows the next due date.
- [ ] Stale list: due date passed OR (read > 14 days ago AND `revisionCount === 0`).
- [ ] Empty-state copy states when the next item is due ("Next up: Rev2 of Basic structure doctrine, 28 Oct").

## 3. Verify
- [ ] Mark a topic "first reading done" today → it has a due date 3 days out and appears in Next 7 days.
- [ ] Complete Rev1 from the queue → due becomes +7d; complete Rev2 → +21d; Rev3 → +60d; Rev4 → +60d again. All four steps fire.
- [ ] Time-travel (dev override or DB edit) a due date into the past → item appears in Overdue and in Stale.
- [ ] Read item with zero revisions, lastTouched 15+ days ago → appears in Stale.
- [ ] Mastered item → absent from queue and stale forever, still counted in syllabus progress.
- [ ] `npm run typecheck` passes.
