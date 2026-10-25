import { describe, expect, it } from 'vitest';
import type { SyllabusItem } from '../types';
import { addDays } from './dates';
import { completeRevision, cycleSyllabusItem, isTopicStale, markMastered, revisionBuckets } from './revision';

const topic = (patch: Partial<SyllabusItem> = {}): SyllabusItem => ({
  id: 'basic-structure',
  paper: 'PRELIMS',
  category: 'Polity',
  microTopic: 'Basic structure doctrine',
  status: 'not_started',
  revisionCount: 0,
  priority: 'high',
  ...patch
});

describe('revision schedule', () => {
  it('marks a first reading today as due in 3 days, inside the next-7 preview', () => {
    const read = cycleSyllabusItem(topic(), 1, '2026-10-25');
    expect(read.status).toBe('first_reading');
    expect(read.revisionCount).toBe(0);
    expect(read.nextRevisionDue).toBe('2026-10-28');
    const buckets = revisionBuckets([read], '2026-10-25');
    expect(buckets.overdue).toHaveLength(0);
    expect(buckets.dueToday).toHaveLength(0);
    expect(buckets.next7.map((i) => i.id)).toEqual(['basic-structure']);
    expect(buckets.nextUpcoming?.microTopic).toBe('Basic structure doctrine');
  });

  it('schedules +7, +21, +60 and +60 after revisions 1 through 4', () => {
    let item = cycleSyllabusItem(topic(), 1, '2026-10-25');
    const touches = ['2026-10-28', '', '', ''];
    const gaps = [7, 21, 60, 60];
    for (let n = 0; n < 4; n++) {
      const on = n === 0 ? touches[0] : item.nextRevisionDue!;
      item = completeRevision(item, on);
      expect(item.revisionCount).toBe(n + 1);
      expect(item.nextRevisionDue).toBe(addDays(on, gaps[n]));
    }
    expect(item.status).toBe('rev_4');
  });

  it('puts a past due date in overdue and stale, and a 15-day unread topic in stale', () => {
    const read = {
      ...cycleSyllabusItem(topic(), 1, '2026-10-01'),
      lastRevisedAt: '2026-10-01',
      nextRevisionDue: '2026-10-04'
    };
    const buckets = revisionBuckets([read], '2026-10-25');
    expect(buckets.overdue.map((i) => i.id)).toEqual(['basic-structure']);
    expect(isTopicStale(read, '2026-10-25')).toBe(true);

    const neverRevised = topic({
      status: 'first_reading',
      revisionCount: 0,
      lastRevisedAt: '2026-10-01'
    });
    expect(isTopicStale(neverRevised, '2026-10-16')).toBe(true);
  });

  it('keeps a mastered topic out of the queue and the stale list', () => {
    const revised = completeRevision(cycleSyllabusItem(topic(), 1, '2026-10-25'), '2026-10-28');
    const mastered = markMastered(revised);
    expect(mastered?.status).toBe('mastered');
    expect(mastered?.nextRevisionDue).toBeUndefined();
    expect(revisionBuckets([mastered!], '2027-06-01').overdue).toHaveLength(0);
    expect(revisionBuckets([mastered!], '2027-06-01').nextUpcoming).toBeUndefined();
    expect(isTopicStale(mastered!, '2027-06-01')).toBe(false);
    expect(markMastered(topic({ status: 'first_reading' }))).toBeNull();
  });
});
