import { describe, expect, it } from 'vitest';
import { heatmapWindow, studyDayAverage, windowAverages } from './analytics';

describe('analytics windows', () => {
  it('names a trailing year from 25 Oct 2026 as October 2025', () => {
    const { start, end } = heatmapWindow('2026-10-25');
    expect(end).toBe('2026-10-25');
    expect(start.startsWith('2025-10')).toBe(true);
    expect(start.slice(5, 7)).not.toBe('04');
  });

  it('shows 4 minutes per calendar day and 2 hours per study day after one 2-hour day', () => {
    const end = '2026-10-25';
    const stats = windowAverages(new Map([[end, 120]]), end, 30);
    expect(stats.calendar).toBe(4);
    expect(stats.study).toBe(120);
    expect(studyDayAverage(new Map([[end, 120]]), end)).toBe(120);
  });
});
