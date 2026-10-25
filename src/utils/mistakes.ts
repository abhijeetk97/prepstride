import type { MistakeLog } from '../types';
import { addDays, toISODate } from './dates';

export function reviewDueAfter(isoDate: string): string {
  return addDays(isoDate, 7);
}

export function reviewDueFromCreated(createdAt: number): string {
  const created = Number.isFinite(createdAt) ? toISODate(new Date(createdAt)) : toISODate(new Date());
  return addDays(created, 7);
}

/** Active mistakes whose review date is today or earlier. Retired rows stay in history only. */
export function isReviewDue(mistake: MistakeLog, today: string): boolean {
  if (mistake.reviewRetired) return false;
  if (!mistake.reviewDue) return true;
  return mistake.reviewDue <= today;
}

export function markReviewed(mistake: MistakeLog, today: string): MistakeLog {
  return {
    ...mistake,
    reviewCount: (mistake.reviewCount ?? 0) + 1,
    reviewDue: addDays(today, 7)
  };
}
