// ─── PrepStride Data Models (TRD §3) ─────────────────────────────────────────

export type SubjectCategory =
  | 'PRELIMS'
  | 'GS1'
  | 'GS2'
  | 'GS3'
  | 'GS4'
  | 'OPTIONAL'
  | 'ESSAY'
  | 'CSAT'
  | 'CURRENT_AFFAIRS';

export const SUBJECT_META: Record<
  SubjectCategory,
  { label: string; short: string; color: string; hint: string }
> = {
  PRELIMS: { label: 'Prelims · GS Paper I', short: 'Prelims', color: '#B8431F', hint: 'The nearest exam — full Prelims GS paper' },
  GS1: { label: 'GS 1 · History & Society', short: 'GS1', color: '#E07A5F', hint: 'History, Geography, Art & Culture, Society' },
  GS2: { label: 'GS 2 · Polity & Governance', short: 'GS2', color: '#5B8E7D', hint: 'Polity, Governance, Social Justice, IR' },
  GS3: { label: 'GS 3 · Economy & Environment', short: 'GS3', color: '#4E7EA8', hint: 'Economy, S&T, Environment, Security, Disaster Mgmt' },
  GS4: { label: 'GS 4 · Ethics', short: 'GS4', color: '#9A6FB0', hint: 'Ethics, Integrity, Aptitude, Case Studies' },
  OPTIONAL: { label: 'Optional Subject', short: 'Optional', color: '#C98BB9', hint: 'Optional Paper 1 & 2' },
  ESSAY: { label: 'Essay & Answer Writing', short: 'Essay', color: '#D4A94E', hint: 'Essay practice & Mains answer writing' },
  CSAT: { label: 'CSAT', short: 'CSAT', color: '#7EC8E3', hint: 'Quant, Reasoning, Reading Comprehension' },
  CURRENT_AFFAIRS: { label: 'Current Affairs & Newspaper', short: 'CA', color: '#8AB17D', hint: 'Newspaper, editorials, monthly magazines' }
};

export type Paper = 'PRELIMS' | 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'ESSAY' | 'OPTIONAL_P1' | 'OPTIONAL_P2' | 'CSAT';

export const PAPER_ORDER: Paper[] = ['PRELIMS', 'GS1', 'GS2', 'GS3', 'GS4', 'ESSAY', 'CSAT', 'OPTIONAL_P1', 'OPTIONAL_P2'];

export const PAPER_META: Record<Paper, string> = {
  PRELIMS: 'Prelims GS',
  GS1: 'Mains GS 1',
  GS2: 'Mains GS 2',
  GS3: 'Mains GS 3',
  GS4: 'Mains GS 4',
  ESSAY: 'Essay',
  OPTIONAL_P1: 'Optional Paper 1',
  OPTIONAL_P2: 'Optional Paper 2',
  CSAT: 'CSAT'
};

// 1. Time Log Model (Timer & Retro entries)
// startTime/endTime are optional: quick logs without an entered time store
// date + duration only — the app never invents a clock range.
export interface TimeLog {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  startTime?: string; // ISO timestamp (only if user-entered or timer-captured)
  endTime?: string; // ISO timestamp
  durationMinutes: number;
  subject: SubjectCategory;
  topic: string;
  mode: 'pomodoro' | 'stopwatch' | 'manual';
  notes?: string;
  createdAt: number;
}

// 2. Daily Summary & Wellbeing Model
export interface DailyRecord {
  date: string; // Primary Key 'YYYY-MM-DD'
  targetMinutes: number;
  energyRating?: number; // 1 to 5
  focusRating?: number; // 1 to 5
  reflection?: string;
  partnerSharedAt?: string;
}

// 3. Daily UPSC Ritual Checklist
export interface DailyRituals {
  date: string; // Primary Key 'YYYY-MM-DD'
  newspaperRead: boolean;
  editorialNotes: boolean;
  mcqsCompleted: number;
  answersWritten: number;
  csatPracticed: boolean;
  currentAffairsMag: boolean;
  /** Optional one-liner saved with the newspaper ritual, e.g. an editorial. */
  newspaperNote?: string;
}

export const emptyRituals = (date: string): DailyRituals => ({
  date,
  newspaperRead: false,
  editorialNotes: false,
  mcqsCompleted: 0,
  answersWritten: 0,
  csatPracticed: false,
  currentAffairsMag: false
});

// 4. Micro-Topic Syllabus Item
export type SyllabusStatus =
  | 'not_started'
  | 'first_reading'
  | 'notes_done'
  | 'rev_1'
  | 'rev_2'
  | 'rev_3'
  | 'rev_4'
  | 'mastered';

export interface SyllabusItem {
  id: string;
  paper: Paper;
  category: string;
  microTopic: string;
  status: SyllabusStatus;
  revisionCount: number;
  /** Last touch — first reading, notes, or a completed revision. ISO date. */
  lastRevisedAt?: string;
  /** Required for every status past not_started, except mastered (permanently out of the queue). */
  nextRevisionDue?: string;
  priority: 'high' | 'medium' | 'low';
  /** Syllabus-document order. Lower comes first. Absent items sort last. */
  sortOrder?: number;
  isCustom?: boolean;
}

export const STATUS_META: Record<SyllabusStatus, { label: string; step: number; color: string }> = {
  not_started: { label: 'Not Started', step: 0, color: '#B8B2A7' },
  first_reading: { label: 'First Reading', step: 1, color: '#7EC8E3' },
  notes_done: { label: 'Notes Prepared', step: 2, color: '#8AB17D' },
  rev_1: { label: 'Revision 1 Done', step: 3, color: '#D4A94E' },
  rev_2: { label: 'Revision 2 Done', step: 4, color: '#E07A5F' },
  rev_3: { label: 'Revision 3 Done', step: 5, color: '#C98BB9' },
  rev_4: { label: 'Revision 4+ Done', step: 6, color: '#5B8E7D' },
  mastered: { label: 'Mastered', step: 7, color: '#9A6FB0' }
};

// 5. Mock Test Record
export interface MockTestRecord {
  id?: number;
  date: string;
  examType: 'PRELIMS' | 'MAINS' | 'CSAT';
  testName: string;
  subject: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  calculatedScore: number;
  accuracyRate: number;
  totalMarks?: number; // Mains
  marksObtained?: number; // Mains
  feedbackTags?: string; // Mains mentor feedback
  notes?: string;
}

// 6. Prelims Mistake Diary
export type MistakeCategory = 'silly_error' | 'conceptual_gap' | 'factual_lapse' | 'overthinking';

export interface MistakeLog {
  id?: number;
  mockTestId?: number;
  date: string;
  subject: string;
  questionSummary: string;
  category: MistakeCategory;
  /** Revision note. Line breaks are kept when the card renders. */
  correctConcept: string;
  /** Next review (ISO date). Rolls forward 7 days from creation or the last review. */
  reviewDue?: string;
  reviewCount?: number;
  /** Left the review rhythm after at least two reviews. The card stays in history. */
  reviewRetired?: boolean;
  createdAt: number;
}

export const MISTAKE_META: Record<MistakeCategory, { label: string; emoji: string; color: string }> = {
  silly_error: { label: 'Silly Mistake / Misread', emoji: '😬', color: '#E07A5F' },
  conceptual_gap: { label: 'Conceptual Gap', emoji: '🕳️', color: '#4E7EA8' },
  factual_lapse: { label: 'Factual Recall Failure', emoji: '🧠', color: '#D4A94E' },
  overthinking: { label: 'Elimination / Risk Error', emoji: '⚖️', color: '#9A6FB0' }
};

// 7. Standard Booklist & Resource Item
export interface ResourceItem {
  id?: number;
  title: string;
  subject: string;
  totalChapters: number;
  completedChapters: number;
  /** Revision passes. Kept in step with `revisionsDone` for the polity badge. */
  currentRevision: number;
  /** Revision passes shown as "Rev ×N". */
  revisionsDone?: number;
}

// 8. Badges of Honor Model
export interface Badge {
  id: string;
  title: string;
  description: string;
  category: 'revision' | 'consistency' | 'rituals' | 'tests' | 'hours';
  icon: string;
  unlockedAt?: string;
}

// 9. Partner Treat Box (Coupons) Model
export interface PartnerTreat {
  id: string;
  title: string;
  description: string;
  requiredXP: number;
  icon: string;
  isCustom: boolean;
  isUnlocked: boolean;
  isRedeemed: boolean;
  redeemedAt?: string;
}

// 10. Gamification & Streak State Model
export interface GamificationState {
  id: string; // 'current_gamification'
  streakShields: number;
  unlockedThemes: string[];
  lastBackupReminderAt?: number;
}

// 11. Application Settings
export type ThemeName = 'warm-paper' | 'midnight' | 'zen-forest' | 'mussoorie-mist' | 'lbsnaa-gold';

export interface AppSettings {
  id: string; // 'current_settings'
  aspirantName: string;
  partnerName: string;
  targetYear: number;
  /** Placeholder date used until UPSC notifies the real one. */
  examDate?: string;
  /** Set only from an official notification. Replaces the “expected” countdown label. */
  officialExamDate?: string;
  defaultDailyTargetMinutes: number;
  optionalSubjectName: string;
  optionalTemplateLoaded?: string;
  timerSettings: {
    workDuration: number;
    breakDuration: number;
    soundEnabled: boolean;
  };
  theme: ThemeName;
  /** Set when the first-run wizard is finished or skipped. Absent → show the wizard. */
  onboardedAt?: string;
}

// Aggregate bundle handed to gamification computations
export interface StatsBundle {
  timeLogs: TimeLog[];
  rituals: DailyRituals[];
  records: DailyRecord[];
  syllabus: SyllabusItem[];
  mocks: MockTestRecord[];
  resources: ResourceItem[];
}
