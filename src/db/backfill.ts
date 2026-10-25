import { splitBookRows } from '../data/books';
import { buildSyllabusItems } from '../data/syllabus';
import { todayISO } from '../utils/dates';
import { withRevisionSchedule } from '../utils/revision';
import type { SyllabusItem } from '../types';
import { db } from './index';

export const BOOK_SPLIT_NOTICE_KEY = 'prepstride_book_split_notice';

/**
 * Split combined booklist rows. Progress stays on the first book of each set;
 * the other books start at chapter 0. A pending notice is stored for the booklist.
 */
export async function splitCombinedBooks(): Promise<void> {
  const existing = await db.resources.toArray();
  const { rows, split } = splitBookRows(existing);
  const changed = split || rows.some((row, index) => row.revisionsDone !== existing[index]?.revisionsDone || row.title !== existing[index]?.title);
  if (!changed) return;
  await db.transaction('rw', db.resources, async () => {
    await db.resources.clear();
    await db.resources.bulkAdd(
      rows.map((row) => ({
        title: row.title,
        subject: row.subject,
        totalChapters: row.totalChapters,
        completedChapters: row.completedChapters,
        currentRevision: row.currentRevision,
        revisionsDone: row.revisionsDone ?? row.currentRevision
      }))
    );
  });
  if (split) localStorage.setItem(BOOK_SPLIT_NOTICE_KEY, 'pending');
}

/** Stamp seed order on existing topics and add the Essay paper once. */
export async function ensureSyllabusOrder(): Promise<void> {
  const seeds = buildSyllabusItems();
  const orderById = new Map(seeds.map((s) => [s.id, s.sortOrder]));
  const existing = await db.syllabusItems.toArray();
  const updates: SyllabusItem[] = [];
  for (const item of existing) {
    const sortOrder = orderById.get(item.id);
    if (sortOrder != null && item.sortOrder !== sortOrder) updates.push({ ...item, sortOrder });
  }
  if (!existing.some((i) => i.paper === 'ESSAY')) {
    updates.push(...seeds.filter((s) => s.paper === 'ESSAY'));
  }
  if (updates.length > 0) await db.syllabusItems.bulkPut(updates);
}

/** Give every read topic a due date. Leaves an existing due date alone. */
export async function backfillSyllabusSchedule(): Promise<void> {
  const today = todayISO();
  const items = await db.syllabusItems.toArray();
  const updates: SyllabusItem[] = [];
  for (const item of items) {
    const result = withRevisionSchedule(item, today);
    if (result.changed) updates.push(result.item);
  }
  if (updates.length > 0) await db.syllabusItems.bulkPut(updates);
}
