import type { PlanActivity, PlanPaper, TimeLog, WeeklyTarget } from '../types';
import { PAPER_META } from '../types';
import { addDays } from './dates';

export const ACTIVITY_META: Record<PlanActivity, { label: string; hint: string }> = {
  reading: { label: 'First reading', hint: 'Read chapters 1–2 and make short notes' },
  revision: { label: 'Revision', hint: 'Recall key ideas, then review weak areas' },
  mcqs: { label: 'MCQs / PYQs', hint: 'Solve 30 PYQs and review every error' },
  answers: { label: 'Answer writing', hint: 'Write 3 timed answers and self-review' },
  mock: { label: 'Mock + analysis', hint: 'Attempt one test and analyse mistakes' }
};

export const PLAN_PAPERS: Record<PlanPaper, string> = { ...PAPER_META, CURRENT_AFFAIRS: 'Current affairs' };

export function weekDates(week: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(week, i));
}

export function weeklySummary(week: string, targets: WeeklyTarget[], logs: TimeLog[]) {
  const end = addDays(week, 6);
  const items = targets.filter((target) => target.weekStart === week);
  return {
    items,
    plannedMinutes: items.reduce((sum, target) => sum + target.plannedMinutes, 0),
    completed: items.filter((target) => target.completed).length,
    loggedMinutes: logs.filter((log) => log.date >= week && log.date <= end).reduce((sum, log) => sum + log.durationMinutes, 0)
  };
}

/** Carry only unfinished work, once, retaining the previous week's history. */
export function carryCandidates(week: string, targets: WeeklyTarget[]): WeeklyTarget[] {
  const previousWeek = addDays(week, -7);
  const current = targets.filter((target) => target.weekStart === week);
  return targets.filter((target) => target.weekStart === previousWeek && !target.completed && !current.some((existing) =>
    existing.carriedFrom === target.id ||
    (existing.title === target.title && existing.paper === target.paper && existing.activity === target.activity)
  ));
}

export function validTarget(minutes: number, date: string | undefined, week: string): boolean {
  return Number.isInteger(minutes) && minutes >= 15 && minutes <= 1440 && (!date || weekDates(week).includes(date));
}
