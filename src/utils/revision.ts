import { STATUS_META, type SyllabusItem, type SyllabusStatus } from '../types';
import { addDays, daysBetween } from './dates';

/** Days from the touch that just happened until the next revision is due.
 *  0 revisions completed (just read) → 3; then 7, 21, 60, and 60 thereafter. */
export function revisionIntervalDays(completedRevisions: number): number {
  if (completedRevisions <= 0) return 3;
  if (completedRevisions === 1) return 7;
  if (completedRevisions === 2) return 21;
  return 60;
}

export function nextRevisionDueDate(fromISO: string, completedRevisions: number): string {
  return addDays(fromISO, revisionIntervalDays(completedRevisions));
}

/** Label of the revision the user still has to do. */
export function nextRevisionLabel(completedRevisions: number): string {
  const n = completedRevisions + 1;
  if (n >= 4) return 'Rev4+';
  return `Rev${n}`;
}

export function statusForCount(count: number): SyllabusStatus {
  if (count <= 0) return 'first_reading';
  if (count === 1) return 'rev_1';
  if (count === 2) return 'rev_2';
  if (count === 3) return 'rev_3';
  return 'rev_4';
}

const CYCLE: SyllabusStatus[] = ['not_started', 'first_reading', 'notes_done', 'rev_1', 'rev_2', 'rev_3', 'rev_4'];

function countForStatus(status: SyllabusStatus, currentCount: number): number {
  switch (status) {
    case 'not_started':
    case 'first_reading':
    case 'notes_done':
      return 0;
    case 'rev_1':
      return 1;
    case 'rev_2':
      return 2;
    case 'rev_3':
      return 3;
    case 'rev_4':
      return Math.max(4, currentCount);
    case 'mastered':
      return Math.max(1, currentCount);
  }
}

function scheduled(item: SyllabusItem, status: SyllabusStatus, revisionCount: number, touch: string): SyllabusItem {
  return {
    ...item,
    status,
    revisionCount,
    lastRevisedAt: touch,
    nextRevisionDue: nextRevisionDueDate(touch, revisionCount)
  };
}

/** Tap-to-cycle. Mastered is not on this ladder — it is an explicit exit. */
export function cycleSyllabusItem(item: SyllabusItem, dir: 1 | -1, today: string): SyllabusItem {
  if (item.status === 'mastered') {
    if (dir === 1) return item;
    const count = Math.max(1, item.revisionCount);
    const touch = item.lastRevisedAt ?? today;
    return scheduled(item, statusForCount(count), count, touch);
  }

  if (item.status === 'rev_4' && dir === 1) {
    const revisionCount = Math.max(4, item.revisionCount) + 1;
    return scheduled(item, 'rev_4', revisionCount, today);
  }

  if (item.status === 'rev_4' && dir === -1 && item.revisionCount > 4) {
    const revisionCount = item.revisionCount - 1;
    const touch = item.lastRevisedAt ?? today;
    return scheduled(item, 'rev_4', revisionCount, touch);
  }

  const idx = Math.max(0, CYCLE.indexOf(item.status));
  const next = CYCLE[Math.min(CYCLE.length - 1, Math.max(0, idx + dir))];
  if (next === 'not_started') {
    return { ...item, status: 'not_started', revisionCount: 0, lastRevisedAt: undefined, nextRevisionDue: undefined };
  }
  const revisionCount = countForStatus(next, item.revisionCount);
  return scheduled(item, next, revisionCount, today);
}

/** "Revision N done" from the queue. Never jumps to Mastered. */
export function completeRevision(item: SyllabusItem, today: string): SyllabusItem {
  if (item.status === 'mastered' || item.status === 'not_started') return item;
  const revisionCount = item.revisionCount + 1;
  return scheduled(item, statusForCount(revisionCount), revisionCount, today);
}

export function nextStatusLabel(status: SyllabusStatus): string {
  if (status === 'mastered') return 'stays mastered';
  if (status === 'rev_4') return 'another revision';
  const next = CYCLE[Math.max(0, CYCLE.indexOf(status)) + 1];
  return next ? STATUS_META[next].label : 'another revision';
}

/** Direct status pick (long-press menu). Mastered stays gated on one revision. */
export function applySyllabusStatus(item: SyllabusItem, status: SyllabusStatus, today: string): SyllabusItem {
  if (status === 'mastered') return markMastered(item) ?? item;
  if (status === 'not_started') {
    return { ...item, status, revisionCount: 0, lastRevisedAt: undefined, nextRevisionDue: undefined };
  }
  const revisionCount = countForStatus(status, item.revisionCount);
  return scheduled(item, status, revisionCount, today);
}

/** Explicit exit. Available only after at least one completed revision. */
export function markMastered(item: SyllabusItem): SyllabusItem | null {
  if (item.revisionCount < 1 || item.status === 'mastered') return null;
  return { ...item, status: 'mastered', nextRevisionDue: undefined };
}

export interface RevisionBuckets {
  overdue: SyllabusItem[];
  dueToday: SyllabusItem[];
  next7: SyllabusItem[];
  /** Soonest item due after today, at any horizon. */
  nextUpcoming: SyllabusItem | undefined;
}

export function revisionBuckets(items: SyllabusItem[], today: string): RevisionBuckets {
  const active = items.filter((i) => i.status !== 'not_started' && i.status !== 'mastered' && i.nextRevisionDue);
  const byDue = (a: SyllabusItem, b: SyllabusItem) =>
    a.nextRevisionDue!.localeCompare(b.nextRevisionDue!) || a.microTopic.localeCompare(b.microTopic);
  const overdue = active.filter((i) => i.nextRevisionDue! < today).sort(byDue);
  const dueToday = active.filter((i) => i.nextRevisionDue === today).sort(byDue);
  const horizon = addDays(today, 7);
  const next7 = active.filter((i) => i.nextRevisionDue! > today && i.nextRevisionDue! <= horizon).sort(byDue);
  const future = active.filter((i) => i.nextRevisionDue! > today).sort(byDue);
  return { overdue, dueToday, next7, nextUpcoming: future[0] };
}

/** Past due, or read more than 14 days ago and never revised. Mastered topics are out forever. */
export function isTopicStale(item: SyllabusItem, today: string): boolean {
  if (item.status === 'not_started' || item.status === 'mastered') return false;
  const overdue = !!item.nextRevisionDue && item.nextRevisionDue < today;
  const neverRevised = item.revisionCount === 0 && !!item.lastRevisedAt && daysBetween(item.lastRevisedAt, today) > 14;
  return overdue || neverRevised;
}

function minimumCount(status: SyllabusStatus): number | null {
  switch (status) {
    case 'rev_1':
      return 1;
    case 'rev_2':
      return 2;
    case 'rev_3':
      return 3;
    case 'rev_4':
      return 4;
    default:
      return null;
  }
}

/** Fill a missing due date. Does not rewrite a due date that is already stored. */
export function withRevisionSchedule(item: SyllabusItem, today: string): { item: SyllabusItem; changed: boolean } {
  if (item.status === 'not_started') {
    if (item.nextRevisionDue || item.revisionCount !== 0 || item.lastRevisedAt) {
      return { item: { ...item, revisionCount: 0, lastRevisedAt: undefined, nextRevisionDue: undefined }, changed: true };
    }
    return { item, changed: false };
  }

  if (item.status === 'mastered') {
    if (item.nextRevisionDue) return { item: { ...item, nextRevisionDue: undefined }, changed: true };
    return { item, changed: false };
  }

  const floor = minimumCount(item.status);
  const revisionCount = floor == null ? item.revisionCount : Math.max(item.revisionCount, floor);
  if (item.nextRevisionDue && revisionCount === item.revisionCount) return { item, changed: false };

  const anchor = item.lastRevisedAt ?? today;
  const next: SyllabusItem = {
    ...item,
    revisionCount,
    lastRevisedAt: item.lastRevisedAt ?? today,
    nextRevisionDue: item.nextRevisionDue ?? nextRevisionDueDate(anchor, revisionCount)
  };
  return { item: next, changed: true };
}
