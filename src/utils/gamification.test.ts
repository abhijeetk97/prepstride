import { describe, expect, it } from 'vitest';
import type { StatsBundle, TimeLog } from '../types';
import { computeStreak, targetMetDay } from './gamification';

function log(date: string, minutes: number): TimeLog {
  return {
    date,
    durationMinutes: minutes,
    subject: 'GS2',
    topic: 'Polity',
    mode: 'manual',
    createdAt: 0
  };
}

function bundle(logs: TimeLog[], target = 480): StatsBundle {
  return {
    timeLogs: logs,
    rituals: [],
    records: [{ date: '2026-10-25', targetMinutes: target }],
    syllabus: [],
    mocks: [],
    resources: []
  };
}

describe('studied-day streak', () => {
  it('counts a 2-hour day against an 8-hour target, and does not call the target met', () => {
    const streak = computeStreak(bundle([log('2026-10-25', 120)], 480), 0, 480, '2026-10-25');
    expect(streak.currentStreak).toBe(1);
    expect(streak.metToday).toBe(false);
    expect(targetMetDay(120, 480)).toBe(false);
  });

  it('neither extends nor breaks the streak on a 25-minute day', () => {
    const streak = computeStreak(
      bundle([log('2026-10-23', 120), log('2026-10-24', 25)], 480),
      0,
      480,
      '2026-10-25'
    );
    expect(streak.currentStreak).toBe(1);
    expect(streak.totalStudyDays).toBe(1);
  });

  it('uses the live target for today, so a mid-day drop to 3h makes 2h a target-met day', () => {
    const streak = computeStreak(bundle([log('2026-10-25', 180)], 480), 0, 180, '2026-10-25');
    expect(streak.currentStreak).toBe(1);
    expect(streak.metToday).toBe(true);
  });
});
