import Dexie, { type Table } from 'dexie';
import { todayISO } from '../utils/dates';
import { reviewDueFromCreated } from '../utils/mistakes';
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
  TimeLog,
  WeeklyPlan,
  WeeklyTarget
} from '../types';

export class PrepStrideDatabase extends Dexie {
  timeLogs!: Table<TimeLog, number>;
  dailyRecords!: Table<DailyRecord, string>;
  dailyRituals!: Table<DailyRituals, string>;
  syllabusItems!: Table<SyllabusItem, string>;
  mockTests!: Table<MockTestRecord, number>;
  mistakeLogs!: Table<MistakeLog, number>;
  resources!: Table<ResourceItem, number>;
  badges!: Table<Badge, string>;
  partnerTreats!: Table<PartnerTreat, string>;
  gamification!: Table<GamificationState, string>;
  settings!: Table<AppSettings, string>;
  weeklyPlans!: Table<WeeklyPlan, string>;
  weeklyTargets!: Table<WeeklyTarget, string>;

  constructor() {
    super('prepstride_db');
    const v1 = {
      timeLogs: '++id, date, subject, mode, createdAt',
      dailyRecords: 'date',
      dailyRituals: 'date',
      syllabusItems: 'id, paper, category, status, nextRevisionDue',
      mockTests: '++id, date, examType, subject',
      mistakeLogs: '++id, mockTestId, category, subject, date, createdAt',
      resources: '++id, subject',
      badges: 'id, category, unlockedAt',
      partnerTreats: 'id, isUnlocked, isRedeemed',
      gamification: 'id',
      settings: 'id'
    };
    this.version(1).stores(v1);
    this.version(2)
      .stores({ ...v1, mistakeLogs: '++id, mockTestId, category, subject, date, createdAt, reviewDue' })
      .upgrade(async (tx) => {
        await tx.table('mistakeLogs').toCollection().modify((row: MistakeLog) => {
          if (row.reviewDue == null) row.reviewDue = reviewDueFromCreated(row.createdAt);
          if (row.reviewCount == null) row.reviewCount = 0;
        });
      });
    this.version(3).stores({
      weeklyPlans: 'weekStart',
      weeklyTargets: 'id, weekStart, scheduledDate, createdAt'
    });
  }
}

export const db = new PrepStrideDatabase();

// Default exam date placeholder: UPSC Prelims typically falls in late May.
export const DEFAULT_SETTINGS: AppSettings = {
  id: 'current_settings',
  aspirantName: 'Champion',
  partnerName: 'Partner',
  targetYear: 2027,
  examDate: '2027-05-23',
  defaultDailyTargetMinutes: 240,
  optionalSubjectName: '',
  timerSettings: {
    workDuration: 50,
    breakDuration: 10,
    soundEnabled: true
  },
  theme: 'warm-paper'
};

/** Settings slider and Home chips share this range. 4h is the default. */
export const DAILY_TARGET_MIN = 120;
export const DAILY_TARGET_MAX = 600;
export const DAILY_TARGET_STEP = 30;
export const DAILY_TARGET_CHIPS = [120, 180, 240, 300, 360, 420, 480, 540, 600];

/** Change the daily target everywhere at once: Settings (source of truth) plus
 *  today's record, so the new value applies immediately — including today. */
export async function setDailyTarget(minutes: number): Promise<void> {
  const clamped = Math.min(DAILY_TARGET_MAX, Math.max(DAILY_TARGET_MIN, Math.round(minutes)));
  await db.transaction('rw', [db.settings, db.dailyRecords], async () => {
    await db.settings.update('current_settings', { defaultDailyTargetMinutes: clamped });
    const today = todayISO();
    const rec = await db.dailyRecords.get(today);
    await db.dailyRecords.put(rec ? { ...rec, targetMinutes: clamped } : { date: today, targetMinutes: clamped });
  });
}
