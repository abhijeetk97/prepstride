## 1. Store
- [x] `src/db/index.ts` `mistakeLogs`: add `reviewDue`, `reviewCount`; bump Dexie version with migration backfill (reviewDue = createdAt + 7d, reviewCount = 0).
- [x] `src/types/index.ts`: takeaway stays a string; render as multiline.

## 2. Card + form
- [x] `TestsScreen.tsx` mistake card: render linked mock chip ("Vision IAS FLT 5 · 24 Oct"); tap → filter diary by `mockTestId`.
- [x] Mistake form: textarea for takeaway (3–4 lines); keep category/question/subject/mock-link fields.

## 3. Review rhythm
- [x] Review banner on Tests screen: count of mistakes with `reviewDue <= today`; expand shows the list with "Mark reviewed" per item (sets reviewDue = today + 7d, increments reviewCount).
- [x] "Done with this mistake" action after ≥ 2 reviews removes it from the rhythm (stays in history).
- [x] Mock log form: when due mistakes exist, show the "read them first" nudge before entry.

## 4. Verify
- [x] Create mistake linked to a mock → chip visible, filter works, takeaway wraps to multiple lines.
- [x] Set reviewDue into the past (DB edit) → banner counts it; mark reviewed → due moves +7d, counter increments.
- [x] Start logging a new mock with due mistakes → nudge appears.
- [x] `npm run typecheck` passes.
