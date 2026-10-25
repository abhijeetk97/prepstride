## 1. Direct chapter entry
- [ ] `AnalyticsScreen.tsx` booklist section (and any book row component): tap the "12/75" counter → inline input/stepper (validate 0..totalChapters); commit on blur/enter; show "% done".

## 2. Split rows
- [ ] Booklist seed: one row per book with its own chapter count (Nitin Singhania, Ramesh Singh, Mrunal, Shankar, PMF IAS, Ancient India, Medieval India, …).
- [ ] Migration for existing DBs: split combined rows; carry progress to the first-listed book and reset others with a visible notice (or proportional split — decide and document).

## 3. Revision passes
- [ ] Add `revisionsDone` (0–3+) per row with a small stepper next to the chapter counter; render as "Rev ×2".

## 4. Verify
- [ ] Set Laxmikanth from 1 → 12 in one interaction; % updates.
- [ ] Fresh seed: "Indian Economy" shows as separate rows per source.
- [ ] Existing DB with combined rows: migration splits without data loss; progress notice shown.
- [ ] `npm run typecheck` passes.
