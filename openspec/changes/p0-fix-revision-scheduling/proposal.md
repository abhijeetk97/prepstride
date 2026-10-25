## Why
The revision UI promises "Rev1 +3d · Rev2 +7d · Rev3 +21d · Rev4+ +60d" but the data model cannot deliver it (`src/screens/SyllabusScreen.tsx`):

- Status order tops out at `rev_2 → mastered` (line 12), so the advertised **Rev3 (+21d)** and **Rev4+ (+60d)** steps never exist.
- `nextRevisionDue` is assigned only when a topic reaches `rev_1`/`rev_2` (lines 57–61). A topic at `first_reading` or `notes_done` — read but never revised, exactly what needs attention — has **no due date**, so the stale list (which filters on `nextRevisionDue <= today`, line 47) is empty for precisely those topics ("No stale topics — great pacing!").
- Marking `mastered` clears the due date (line 61), killing the tail of the schedule.

## What Changes
- Scheduling becomes **count-based and always-on**: every topic that has been read (first reading onward) always carries a `nextRevisionDue`. Intervals from the last touch: first revision due **+3d**; after revision n, next due **+7d / +21d / +60d / +60d…** for n = 1 / 2 / 3 / 4+.
- Status derives from `revisionCount` (read → Rev1 done → Rev2 done → Rev3 done → Rev4+). **Mastered** becomes an explicit exit available after at least one revision — it permanently removes the topic from the queue.
- The revision queue shows **overdue**, **due today**, and a **next-7-days** preview (so an empty "due now" is self-explanatory). Completing a revision from the queue reschedules to the next interval and shows the new due date.
- The **stale list** shows: topics past their due date, **or** read more than 14 days ago with zero revisions.
- Empty-state copy matches real behavior.

## Capability Impact
- `revision`: ADDS requirements (schedule arithmetic, queue contents, stale definition). Supersedes the current status-cycling semantics in `SyllabusScreen.tsx` and the `revisionCount` handling in `src/data/syllabus.ts` / `src/db/seed.ts`.
- Depends on nothing else; independent of `p1-improve-syllabus-ux` (which covers ordering/visuals).
