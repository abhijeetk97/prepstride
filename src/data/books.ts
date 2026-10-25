import type { ResourceItem } from '../types';

/**
 * One row per book. Chapter counts are the edition used for tracking.
 * Older combined shelves are split by `splitBookRows`: progress stays on the
 * first book, and the others start at chapter 0.
 */
export const BOOK_CATALOG: ResourceItem[] = [
  { title: 'Indian Polity — M. Laxmikanth', subject: 'Polity', totalChapters: 75, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Modern Indian History — Spectrum (Rajiv Ahir)', subject: 'Modern History', totalChapters: 42, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Environment — Shankar IAS', subject: 'Environment', totalChapters: 25, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Environment — PMF IAS', subject: 'Environment', totalChapters: 18, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Indian Economy — Nitin Singhania', subject: 'Economy', totalChapters: 16, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Indian Economy — Ramesh Singh', subject: 'Economy', totalChapters: 20, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Indian Economy — Mrunal', subject: 'Economy', totalChapters: 12, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Ancient India — RS Sharma', subject: 'Ancient History', totalChapters: 16, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Medieval India — Satish Chandra', subject: 'Medieval History', totalChapters: 15, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Indian Art & Culture — Nitin Singhania', subject: 'Art & Culture', totalChapters: 26, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Geography — Class 11 & 12 NCERTs + GC Leong', subject: 'Geography', totalChapters: 40, completedChapters: 0, currentRevision: 0, revisionsDone: 0 },
  { title: 'Ethics — Lexicon / Subba Rao', subject: 'Ethics (GS4)', totalChapters: 20, completedChapters: 0, currentRevision: 0, revisionsDone: 0 }
];

/** Combined titles from the first booklist, in first-listed order. */
export const BOOK_SPLITS: Record<string, string[]> = {
  'Environment — Shankar IAS / PMF IAS': ['Environment — Shankar IAS', 'Environment — PMF IAS'],
  'Indian Economy — Nitin Singhania / Ramesh Singh / Mrunal': [
    'Indian Economy — Nitin Singhania',
    'Indian Economy — Ramesh Singh',
    'Indian Economy — Mrunal'
  ],
  'Ancient & Medieval India — RS Sharma / Satish Chandra / Old NCERTs': ['Ancient India — RS Sharma', 'Medieval India — Satish Chandra']
};

const catalogByTitle = new Map(BOOK_CATALOG.map((book) => [book.title, book]));

/** Split combined shelves. Progress moves to the first book; the rest start at 0. */
export function splitBookRows(rows: ResourceItem[]): { rows: ResourceItem[]; split: boolean } {
  const present = new Set(rows.map((row) => row.title));
  let split = false;
  const out: ResourceItem[] = [];

  for (const row of rows) {
    const children = BOOK_SPLITS[row.title];
    if (!children) {
      const rev = row.revisionsDone ?? row.currentRevision ?? 0;
      out.push({ ...row, currentRevision: rev, revisionsDone: rev });
      continue;
    }
    split = true;
    children.forEach((title, index) => {
      if (present.has(title)) return;
      const seed = catalogByTitle.get(title);
      if (!seed) return;
      const rev = index === 0 ? (row.revisionsDone ?? row.currentRevision ?? 0) : 0;
      out.push({
        ...seed,
        completedChapters: index === 0 ? Math.min(row.completedChapters, seed.totalChapters) : 0,
        currentRevision: rev,
        revisionsDone: rev
      });
      present.add(title);
    });
  }

  return { rows: out, split };
}
