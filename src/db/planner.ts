import type { WeeklyTarget } from '../types';
import { carryCandidates, validTarget } from '../utils/planner';
import { db } from './index';

export async function saveTargets(targets: WeeklyTarget[]): Promise<void> {
  if (targets.some((target) => !target.title.trim() || !validTarget(target.plannedMinutes, target.scheduledDate, target.weekStart))) {
    throw new Error('Choose a valid topic, day and duration.');
  }
  await db.weeklyTargets.bulkPut(targets);
}

export async function carryTargets(week: string, ids: string[]): Promise<number> {
  return db.transaction('rw', db.weeklyTargets, async () => {
    const candidates = carryCandidates(week, await db.weeklyTargets.toArray()).filter((target) => ids.includes(target.id));
    if (candidates.length) await db.weeklyTargets.bulkAdd(candidates.map((target) => ({
      ...target, id: crypto.randomUUID(), weekStart: week, scheduledDate: undefined,
      completed: false, carriedFrom: target.id, createdAt: Date.now()
    })));
    return candidates.length;
  });
}
