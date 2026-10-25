import type { DailyRituals, StatsBundle, SyllabusStatus } from '../types';
import { addDays, todayISO, timeOfDayHour, fromISODate } from './dates';

// ─── Civil Services Journey Ranks (PRD Module 12.1) ─────────────────────────
export interface LevelTier {
  level: number;
  minXP: number;
  title: string;
  mascotAccessory: string;
  accessoryEmoji: string;
}

export const LEVEL_THRESHOLDS: LevelTier[] = [
  { level: 1, minXP: 0, title: 'The Novice Aspirant', mascotAccessory: 'fledgling', accessoryEmoji: '🐣' },
  { level: 2, minXP: 500, title: 'Discipline Disciple', mascotAccessory: 'scarf', accessoryEmoji: '🧣' },
  { level: 3, minXP: 1500, title: 'Foundation Master', mascotAccessory: 'notebook', accessoryEmoji: '📓' },
  { level: 4, minXP: 3500, title: 'Mains Strategist', mascotAccessory: 'spectacles', accessoryEmoji: '👓' },
  { level: 5, minXP: 7000, title: 'Revision Virtuoso', mascotAccessory: 'quill', accessoryEmoji: '🪶' },
  { level: 6, minXP: 12000, title: 'District Magistrate in the Making', mascotAccessory: 'badge', accessoryEmoji: '🎖️' },
  { level: 7, minXP: 20000, title: 'LBSNAA Valedictorian', mascotAccessory: 'golden_sash', accessoryEmoji: '🏅' }
];

export function levelForXP(xp: number): LevelTier {
  let tier = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) if (xp >= t.minXP) tier = t;
  return tier;
}

export function nextLevelProgress(xp: number): { current: LevelTier; next?: LevelTier; pct: number; toNext: number } {
  const current = levelForXP(xp);
  const next = LEVEL_THRESHOLDS.find((t) => t.minXP > xp);
  const pct = next ? Math.min(100, ((xp - current.minXP) / (next.minXP - current.minXP)) * 100) : 100;
  return { current, next, pct, toNext: next ? next.minXP - xp : 0 };
}

// ─── XP Engine (derived deterministically from source tables) ────────────────
// +10 XP / 30 min study · +25 XP / completed ritual · +50 XP / revision cycle · +100 XP / mock analyzed

export function ritualCount(r: DailyRituals): number {
  let n = 0;
  if (r.newspaperRead) n++;
  if (r.editorialNotes) n++;
  if (r.mcqsCompleted > 0) n++;
  if (r.answersWritten > 0) n++;
  if (r.csatPracticed) n++;
  if (r.currentAffairsMag) n++;
  return n;
}

const STATUS_REVISION_CYCLES: Record<SyllabusStatus, number> = {
  not_started: 0,
  first_reading: 0,
  notes_done: 0,
  rev_1: 1,
  rev_2: 2,
  mastered: 3
};

export interface XPBreakdown {
  study: number;
  rituals: number;
  revisions: number;
  mocks: number;
  total: number;
}

export function computeXP(b: StatsBundle): XPBreakdown {
  const totalMinutes = b.timeLogs.reduce((s, l) => s + l.durationMinutes, 0);
  const study = Math.floor(totalMinutes / 30) * 10;
  const rituals = b.rituals.reduce((s, r) => s + ritualCount(r) * 25, 0);
  const syllabusCycles = b.syllabus.reduce((s, i) => s + STATUS_REVISION_CYCLES[i.status] * 50, 0);
  const bookCycles = b.resources.reduce((s, r) => s + r.currentRevision * 50, 0);
  const mocks = b.mocks.length * 100;
  return { study, rituals, revisions: syllabusCycles + bookCycles, mocks, total: study + rituals + syllabusCycles + bookCycles + mocks };
}

// ─── Streak & Streak Shields ("Rest Day Grace") ─────────────────────────────
export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  shields: number; // available (stored, 0-3)
  shieldUsedForYesterday: boolean;
  daysTowardShield: number; // progress within current 7-day shield cycle
  totalStudyDays: number;
  metToday: boolean;
}

export function computeStreak(b: StatsBundle, storedShields: number): StreakState {
  const today = todayISO();
  const targetDefault = b.records.find((r) => r.date === today)?.targetMinutes ?? 480;

  const minutesByDate = new Map<string, number>();
  for (const l of b.timeLogs) minutesByDate.set(l.date, (minutesByDate.get(l.date) ?? 0) + l.durationMinutes);

  const dates = [...minutesByDate.keys()].sort();
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, shields: storedShields, shieldUsedForYesterday: false, daysTowardShield: 0, totalStudyDays: 0, metToday: false };
  }

  const first = dates[0];
  const last = dates[dates.length - 1] > today ? today : dates[dates.length - 1];

  let currentStreak = 0;
  let longestStreak = 0;
  let shields = storedShields;
  let daysTowardShield = 0;
  let shieldUsedForYesterday = false;
  let totalStudyDays = 0;

  const yesterday = addDays(today, -1);
  let cursor = first;
  while (cursor <= last) {
    const mins = minutesByDate.get(cursor) ?? 0;
    const target = b.records.find((r) => r.date === cursor)?.targetMinutes ?? targetDefault;
    // A light-minimum day (≥ 30 min) still counts as "studied", but only target-met extends the streak.
    if (mins >= 30) totalStudyDays++;
    const met = mins >= Math.min(target, 240); // streak bar: daily target, capped at 4h for sanity

    if (met) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
      daysTowardShield++;
      if (daysTowardShield === 7) {
        daysTowardShield = 0;
        shields = Math.min(3, shields + 1);
      }
    } else if (cursor < today) {
      // Today is still in progress — never penalised.
      if (mins === 0 && shields > 0) {
        shields--;
        if (cursor === yesterday) shieldUsedForYesterday = true;
        // Streak protected by shield
      } else if (mins > 0 && shields > 0) {
        // studied but target missed — shield also protects
        shields--;
        if (cursor === yesterday) shieldUsedForYesterday = true;
      } else {
        currentStreak = 0;
        daysTowardShield = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }

  // If today already met the target, streak includes today; otherwise show streak up to yesterday.
  const todayMins = minutesByDate.get(today) ?? 0;
  const todayTarget = b.records.find((r) => r.date === today)?.targetMinutes ?? targetDefault;
  const metToday = todayMins >= Math.min(todayTarget, 240);

  return { currentStreak, longestStreak, shields, shieldUsedForYesterday, daysTowardShield, totalStudyDays, metToday };
}

// ─── Badges of Honor evaluation ─────────────────────────────────────────────
export function evaluateBadges(b: StatsBundle): Record<string, boolean> {
  const totalMinutes = b.timeLogs.reduce((s, l) => s + l.durationMinutes, 0);
  const answersTotal = b.rituals.reduce((s, r) => s + r.answersWritten, 0);

  // Editorial Hawk: 14-day continuous newspaper analysis
  let newsStreak = 0;
  let bestNews = 0;
  const dates = [...new Set(b.rituals.filter((r) => r.newspaperRead).map((r) => r.date))].sort();
  for (let i = 0; i < dates.length; i++) {
    if (i > 0 && addDays(dates[i - 1], 1) === dates[i]) newsStreak++;
    else newsStreak = 1;
    bestNews = Math.max(bestNews, newsStreak);
  }

  return {
    polity_sovereign: b.resources.some(
      (r) => r.subject === 'Polity' && r.completedChapters >= r.totalChapters && r.currentRevision >= 3
    ),
    editorial_hawk: bestNews >= 14,
    negative_marking_tamer: b.mocks.some((m) => m.examType === 'PRELIMS' && m.totalQuestions >= 100 && m.accuracyRate >= 75),
    answer_alchemist: answersTotal >= 25,
    // Time-of-day badges evaluate only on records with a real captured start/end
    // time — quick logs without a time never qualify.
    dawn_warrior: b.timeLogs.some((l) => l.durationMinutes >= 120 && (timeOfDayHour(l.startTime) ?? 24) < 8),
    midnight_scholar: b.timeLogs.some((l) => l.durationMinutes >= 45 && (timeOfDayHour(l.endTime) ?? -1) >= 22),
    iron_will: b.records.some((r) => {
      const mins = b.timeLogs.filter((l) => l.date === r.date).reduce((s, l) => s + l.durationMinutes, 0);
      return mins >= 240 && (r.energyRating ?? 5) <= 2;
    }),
    century_club: totalMinutes >= 6000
  };
}

// ─── Treat unlock evaluation ────────────────────────────────────────────────
export function treatUnlocked(requiredXP: number, xp: number): boolean {
  return xp >= requiredXP;
}

// ─── Spaced repetition intervals (TRD §4.2) ─────────────────────────────────
export const REVISION_INTERVALS = [3, 7, 21, 60];

export function nextRevisionDate(fromISO: string, revisionNumber: number): string {
  // revisionNumber = the revision just completed (1-based)
  const idx = Math.min(revisionNumber, REVISION_INTERVALS.length) - 1;
  return addDays(fromISO, REVISION_INTERVALS[idx >= 0 ? idx : 0]);
}

/** Topics not revised for > 30 days (after having been read once). */
export function isStale(lastRevisedAt: string | undefined, status: SyllabusStatus): boolean {
  if (!lastRevisedAt || status === 'not_started' || status === 'first_reading') return false;
  const days = Math.round((Date.now() - fromISODate(lastRevisedAt).getTime()) / 86_400_000);
  return days > 30;
}
