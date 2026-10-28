import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { db, PrepStrideDatabase } from './index';
import { carryTargets, saveTargets } from './planner';
import { applyBackup } from './backup';
import type { WeeklyTarget } from '../types';

const target: WeeklyTarget = {
  id: 'source', title: 'Basic structure', paper: 'GS2', activity: 'revision', outcome: 'Recall landmark cases',
  weekStart: '2026-10-26', scheduledDate: '2026-10-28', plannedMinutes: 90, completed: false, createdAt: 1
};

beforeEach(async () => { await db.weeklyPlans.clear(); await db.weeklyTargets.clear(); });
afterAll(async () => { await db.delete(); });

describe('planner persistence', () => {
  it('saves edits and completion without changing recorded time or syllabus', async () => {
    await db.syllabusItems.put({ id: 'polity', paper: 'GS2', category: 'Constitution', microTopic: target.title, status: 'first_reading', revisionCount: 0, priority: 'high' });
    await db.timeLogs.add({ date: '2026-10-27', durationMinutes: 50, subject: 'GS2', topic: target.title, mode: 'manual', createdAt: 1 });
    const logsBefore = await db.timeLogs.toArray();
    const syllabusBefore = await db.syllabusItems.toArray();
    await saveTargets([{ ...target, topicId: 'polity' }]);
    await saveTargets([{ ...target, topicId: 'polity', plannedMinutes: 120, completed: true }]);
    expect(await db.weeklyTargets.count()).toBe(1);
    expect(await db.weeklyTargets.get(target.id)).toMatchObject({ plannedMinutes: 120, completed: true });
    expect(await db.timeLogs.toArray()).toEqual(logsBefore);
    expect(await db.syllabusItems.toArray()).toEqual(syllabusBefore);
  });
  it('rejects the entire save when a target has a date outside its week', async () => {
    await expect(saveTargets([target, { ...target, id: 'invalid', scheduledDate: '2026-11-02' }])).rejects.toThrow();
    expect(await db.weeklyTargets.count()).toBe(0);
  });
  it('carries once in a transaction while retaining original history', async () => {
    await saveTargets([target]);
    expect(await carryTargets('2026-11-02', ['source'])).toBe(1);
    expect(await carryTargets('2026-11-02', ['source'])).toBe(0);
    expect(await db.weeklyTargets.get('source')).toEqual(target);
    const carried = await db.weeklyTargets.where('weekStart').equals('2026-11-02').first();
    expect(carried).toMatchObject({ title: target.title, outcome: target.outcome, plannedMinutes: 90, completed: false, carriedFrom: 'source' });
    expect(carried?.scheduledDate).toBeUndefined();
  });
  it('restores planner tables and clears them when restoring a legacy backup', async () => {
    const memory = new Map<string, string>();
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { setItem: (key: string, value: string) => memory.set(key, value) } });
    try {
      const base = { version: 1, appName: 'PrepStride', exportedAt: '2026-10-28' };
      await applyBackup({ ...base, data: { weeklyPlans: [{ weekStart: '2026-10-26', targetMinutes: 1440 }], weeklyTargets: [target] } });
      expect(await db.weeklyPlans.get('2026-10-26')).toMatchObject({ targetMinutes: 1440 });
      expect(await db.weeklyTargets.get('source')).toEqual(target);
      await applyBackup({ ...base, data: { timeLogs: [] } });
      expect(await db.weeklyPlans.count()).toBe(0);
      expect(await db.weeklyTargets.count()).toBe(0);
    } finally { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original }); }
  });
  it('upgrades an existing v2 database without losing study records', async () => {
    db.close();
    await Dexie.delete('prepstride_db');
    const legacy = new Dexie('prepstride_db');
    legacy.version(2).stores({
      timeLogs: '++id, date, subject, mode, createdAt', dailyRecords: 'date', dailyRituals: 'date',
      syllabusItems: 'id, paper, category, status, nextRevisionDue', mockTests: '++id, date, examType, subject',
      mistakeLogs: '++id, mockTestId, category, subject, date, createdAt, reviewDue', resources: '++id, subject',
      badges: 'id, category, unlockedAt', partnerTreats: 'id, isUnlocked, isRedeemed', gamification: 'id', settings: 'id'
    });
    await legacy.table('timeLogs').add({ date: '2026-10-27', durationMinutes: 50, subject: 'GS2', topic: 'Polity', mode: 'manual', createdAt: 1 });
    legacy.close();
    const upgraded = new PrepStrideDatabase();
    try {
      await upgraded.open();
      expect((await upgraded.timeLogs.toArray())[0].durationMinutes).toBe(50);
      await upgraded.weeklyTargets.put(target);
      expect(await upgraded.weeklyTargets.get('source')).toEqual(target);
    } finally { upgraded.close(); }
    await db.open();
  });
});
