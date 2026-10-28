import { describe, expect, it } from 'vitest';
import type { TimeLog, WeeklyTarget } from '../types';
import { carryCandidates, validTarget, weekDates, weeklySummary } from './planner';
import { weekStartISO } from './dates';

const target = (patch: Partial<WeeklyTarget> = {}): WeeklyTarget => ({
  id: 'a', weekStart: '2026-10-26', title: 'Fundamental Rights', paper: 'GS2',
  activity: 'revision', outcome: '', plannedMinutes: 90, completed: false, createdAt: 1, ...patch
});
const log = (date: string, durationMinutes: number): TimeLog => ({
  date, durationMinutes, subject: 'GS2', topic: '', mode: 'manual', createdAt: 1
});

describe('weekly planning', () => {
  it('uses local Monday–Sunday weeks across month and year boundaries', () => {
    expect(weekStartISO('2027-01-03')).toBe('2026-12-28');
    expect(weekDates('2026-12-28')).toEqual(['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']);
  });
  it('separates completed outcomes, planned hours and actual logs within the week', () => {
    const summary = weeklySummary('2026-10-26', [target({ completed: true }), target({ id: 'b', plannedMinutes: 60 }), target({ weekStart: '2026-11-02' })],
      [log('2026-10-25', 100), log('2026-10-26', 30), log('2026-11-01', 50), log('2026-11-02', 100)]);
    expect(summary.plannedMinutes).toBe(150);
    expect(summary.completed).toBe(1);
    expect(summary.loggedMinutes).toBe(80);
  });
  it('offers only last week’s unfinished work and avoids repeated carry-over', () => {
    const targets = [target(), target({ id: 'done', completed: true }), target({ id: 'older', weekStart: '2026-10-19' })];
    expect(carryCandidates('2026-11-02', targets).map((t) => t.id)).toEqual(['a']);
    expect(carryCandidates('2026-11-02', [...targets, target({ id: 'copy', weekStart: '2026-11-02', carriedFrom: 'a' })])).toEqual([]);
    expect(carryCandidates('2026-11-02', [...targets, target({ id: 'manual-copy', weekStart: '2026-11-02' })])).toEqual([]);
    expect(targets[0].weekStart).toBe('2026-10-26');
  });
  it('rejects invalid durations and dates outside the chosen week', () => {
    expect(validTarget(90, '2026-11-01', '2026-10-26')).toBe(true);
    expect(validTarget(15, undefined, '2026-10-26')).toBe(true);
    for (const minutes of [0, -1, NaN, Infinity, 14, 15.5, 1441]) expect(validTarget(minutes, undefined, '2026-10-26')).toBe(false);
    expect(validTarget(90, '2026-11-02', '2026-10-26')).toBe(false);
  });
});
