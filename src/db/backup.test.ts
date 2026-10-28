import { describe, expect, it } from 'vitest';
import { parseBackupText, summarizeBackup } from '../utils/backupParse';

describe('backup parse', () => {
  it('rejects a file that is not a PrepStride backup', () => {
    expect(() => parseBackupText('{')).toThrow("That file isn't a PrepStride backup");
    expect(() => parseBackupText(JSON.stringify({ appName: 'Other', data: {} }))).toThrow("That file isn't a PrepStride backup");
  });

  it('counts records and the date range without writing', () => {
    const payload = parseBackupText(
      JSON.stringify({
        version: 1,
        exportedAt: '2026-10-25T05:30:00.000Z',
        appName: 'PrepStride',
        data: {
          timeLogs: [{ date: '2026-10-01' }, { date: '2026-10-20' }],
          mockTests: [{ date: '2026-10-24' }],
          mistakeLogs: [{}],
          syllabusItems: [{ id: 'a' }, { id: 'b' }]
        }
      })
    );
    const summary = summarizeBackup(payload, 'prepstride-backup-2026-10-25.json');
    expect(summary.sessions).toBe(2);
    expect(summary.tests).toBe(1);
    expect(summary.mistakes).toBe(1);
    expect(summary.syllabus).toBe(2);
    expect(summary.from).toBe('2026-10-01');
    expect(summary.to).toBe('2026-10-24');
    expect(summary.weeklyPlans).toBe(0);
    expect(summary.weeklyTargets).toBe(0);
  });

  it('includes weekly goals and targets in the restore preview', () => {
    const payload = parseBackupText(JSON.stringify({ appName: 'PrepStride', data: {
      weeklyPlans: [{ weekStart: '2026-10-26', targetMinutes: 1440 }],
      weeklyTargets: [{ weekStart: '2026-11-02', title: 'Revise polity' }]
    } }));
    const summary = summarizeBackup(payload, 'planner.json');
    expect(summary.weeklyPlans).toBe(1);
    expect(summary.weeklyTargets).toBe(1);
    expect(summary.from).toBe('2026-10-26');
    expect(summary.to).toBe('2026-11-02');
  });
});
