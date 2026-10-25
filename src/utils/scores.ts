import type { MockTestRecord } from '../types';

/** Net = correct×2 − incorrect×(2/3), in exact thirds. Rounded only for display (2dp). */
export function prelimsScore(correct: number, incorrect: number): number {
  const thirds = correct * 6 - incorrect * 2;
  return Math.round((thirds * 100) / 3) / 100;
}

export function formatPrelimsScore(score: number): string {
  return score.toFixed(2);
}

/** CSAT Paper II: +2.5 per correct, −2.5/3 per wrong. Exact sixths, rounded only for display. */
export const CSAT_QUALIFYING = 66.67;

export function csatScore(correct: number, incorrect: number): number {
  const sixths = 5 * (correct * 3 - incorrect);
  return Math.round((sixths * 100) / 6) / 100;
}

export function csatQualified(score: number): boolean {
  return score >= CSAT_QUALIFYING;
}

/** null when 0 ≤ correct ≤ attempted ≤ total, all whole numbers. */
export function prelimsInputError(total: number, attempted: number, correct: number): string | null {
  const whole = (n: number) => Number.isFinite(n) && n >= 0 && Math.floor(n) === n;
  if (!whole(total) || !whole(attempted) || !whole(correct)) return 'Enter whole numbers, zero or more.';
  if (correct > attempted) return 'Correct cannot exceed attempted.';
  if (attempted > total) return 'Attempted cannot exceed total questions.';
  return null;
}

export function accuracyRate(correct: number, attempted: number): number {
  if (attempted <= 0) return 0;
  return Math.round((correct / attempted) * 1000) / 10;
}

/** Attempted / total, in percent to 1 decimal. 0 when the paper has no questions. */
export function attemptRate(attempted: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((attempted / total) * 1000) / 10;
}

export function formatPercent(pct: number): string {
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

export function buildPrelimsRecord(
  input: Pick<MockTestRecord, 'date' | 'testName' | 'subject' | 'totalQuestions' | 'attempted' | 'correct'> &
    Partial<Pick<MockTestRecord, 'notes'>>
): MockTestRecord {
  const incorrect = input.attempted - input.correct;
  return {
    ...input,
    examType: 'PRELIMS',
    incorrect,
    calculatedScore: prelimsScore(input.correct, incorrect),
    accuracyRate: accuracyRate(input.correct, input.attempted),
    notes: input.notes
  };
}

export function buildCsatRecord(
  input: Pick<MockTestRecord, 'date' | 'testName' | 'subject' | 'totalQuestions' | 'attempted' | 'correct'> &
    Partial<Pick<MockTestRecord, 'notes'>>
): MockTestRecord {
  const incorrect = input.attempted - input.correct;
  return {
    ...input,
    examType: 'CSAT',
    incorrect,
    calculatedScore: csatScore(input.correct, incorrect),
    accuracyRate: accuracyRate(input.correct, input.attempted),
    notes: input.notes
  };
}

/** A single answer-writing practice entry, stored with the mains history. */
export function buildAnswerPractice(input: {
  date: string;
  question: string;
  minutes: number;
  rating?: number;
  note?: string;
}): MockTestRecord {
  const rated = input.rating != null && input.rating >= 0;
  return buildMainsRecord({
    date: input.date,
    testName: input.question,
    subject: 'Answer writing',
    totalMarks: rated ? 10 : Math.max(1, input.minutes),
    marksObtained: rated ? input.rating! : Math.max(1, input.minutes),
    feedbackTags: rated ? `${input.minutes} min · ${input.rating}/10` : `${input.minutes} min`,
    notes: input.note
  });
}

export function buildMainsRecord(
  input: {
    date: string;
    testName: string;
    subject: string;
    totalMarks: number;
    marksObtained: number;
    feedbackTags?: string;
    notes?: string;
  }
): MockTestRecord {
  return {
    id: undefined,
    date: input.date,
    examType: 'MAINS',
    testName: input.testName,
    subject: input.subject,
    totalQuestions: 20,
    attempted: 20,
    correct: 0,
    incorrect: 0,
    calculatedScore: input.marksObtained,
    accuracyRate: input.totalMarks > 0 ? Math.round((input.marksObtained / input.totalMarks) * 1000) / 10 : 0,
    totalMarks: input.totalMarks,
    marksObtained: input.marksObtained,
    feedbackTags: input.feedbackTags,
    notes: input.notes
  };
}
