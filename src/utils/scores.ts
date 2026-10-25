import type { MockTestRecord } from '../types';

// Prelims: +2 per correct, −0.666 per incorrect (1/3rd of 2)
export function prelimsScore(correct: number, incorrect: number): number {
  return Math.round((correct * 2 - incorrect * 0.666) * 100) / 100;
}

export function accuracyRate(correct: number, attempted: number): number {
  if (attempted <= 0) return 0;
  return Math.round((correct / attempted) * 1000) / 10;
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
