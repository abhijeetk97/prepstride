import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../db';
import { todayISO } from '../utils/dates';
import { computeStreak, computeXP, type StreakState, type XPBreakdown } from '../utils/gamification';
import type {
  AppSettings,
  Badge,
  DailyRecord,
  DailyRituals,
  GamificationState,
  MistakeLog,
  MockTestRecord,
  PartnerTreat,
  ResourceItem,
  SyllabusItem,
  TimeLog
} from '../types';

export interface AppData {
  loading: boolean;
  settings: AppSettings;
  timeLogs: TimeLog[];
  dailyRecords: DailyRecord[];
  todayRituals: DailyRituals | undefined;
  todayRecord: DailyRecord | undefined;
  syllabus: SyllabusItem[];
  mocks: MockTestRecord[];
  mistakes: MistakeLog[];
  resources: ResourceItem[];
  badges: Badge[];
  treats: PartnerTreat[];
  gamification: GamificationState | undefined;
  xp: XPBreakdown;
  streak: StreakState;
  /** Live Settings target. Applies to today immediately. */
  todayTargetMinutes: number;
}

/** One reactive data source for the whole app (all Dexie tables + derived stats). */
export function useAppData(): AppData {
  const settings = useLiveQuery(() => db.settings.get('current_settings'), [], undefined);
  const timeLogs = useLiveQuery(() => db.timeLogs.orderBy('date').reverse().toArray(), [], [] as TimeLog[]);
  const dailyRecords = useLiveQuery(() => db.dailyRecords.toArray(), [], [] as DailyRecord[]);
  const ritualsAll = useLiveQuery(() => db.dailyRituals.toArray(), [], [] as DailyRituals[]);
  const syllabus = useLiveQuery(() => db.syllabusItems.toArray(), [], [] as SyllabusItem[]);
  const mocks = useLiveQuery(() => db.mockTests.orderBy('date').reverse().toArray(), [], [] as MockTestRecord[]);
  const mistakes = useLiveQuery(() => db.mistakeLogs.orderBy('createdAt').reverse().toArray(), [], [] as MistakeLog[]);
  const resources = useLiveQuery(() => db.resources.toArray(), [], [] as ResourceItem[]);
  const badges = useLiveQuery(() => db.badges.toArray(), [], [] as Badge[]);
  const treats = useLiveQuery(() => db.partnerTreats.toArray(), [], [] as PartnerTreat[]);
  const gamification = useLiveQuery(() => db.gamification.get('current_gamification'), [], undefined);

  const today = todayISO();
  const todayRituals = ritualsAll.find((r) => r.date === today);
  const todayRecord = dailyRecords.find((r) => r.date === today);

  const bundle = {
    timeLogs,
    rituals: ritualsAll,
    records: dailyRecords,
    syllabus,
    mocks,
    resources
  };
  const xp = computeXP(bundle);
  // Walk starts from 0 shields so the result is fully derived from log data
  // (deterministic across relaunches); App persists the result for display.
  const todayTargetMinutes = settings?.defaultDailyTargetMinutes ?? DEFAULT_SETTINGS.defaultDailyTargetMinutes;
  const streak = computeStreak(bundle, 0, todayTargetMinutes);

  return {
    loading: settings === undefined,
    settings: settings ?? DEFAULT_SETTINGS,
    timeLogs,
    dailyRecords,
    todayRituals,
    todayRecord,
    syllabus,
    mocks,
    mistakes,
    resources,
    badges,
    treats,
    gamification,
    xp,
    streak,
    todayTargetMinutes
  };
}

/** Minutes studied per date lookup. */
export function minutesByDate(timeLogs: TimeLog[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of timeLogs) m.set(l.date, (m.get(l.date) ?? 0) + l.durationMinutes);
  return m;
}
