import Dexie, { type Table } from 'dexie';
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

  constructor() {
    super('prepstride_db');
    this.version(1).stores({
      timeLogs: '++id, date, subject, mode, createdAt',
      dailyRecords: 'date',
      dailyRituals: 'date',
      syllabusItems: 'id, paper, category, status, nextRevisionDue',
      mockTests: '++id, date, examType, subject',
      mistakeLogs: '++id, mockTestId, category, subject',
      resources: '++id, subject',
      badges: 'id, category, unlockedAt',
      partnerTreats: 'id, isUnlocked, isRedeemed',
      gamification: 'id',
      settings: 'id'
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
  defaultDailyTargetMinutes: 480,
  optionalSubjectName: '',
  timerSettings: {
    workDuration: 50,
    breakDuration: 10,
    soundEnabled: true
  },
  theme: 'warm-paper'
};
