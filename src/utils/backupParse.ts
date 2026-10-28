export interface BackupPayload {
  version: number;
  exportedAt: string;
  appName: string;
  data: Record<string, unknown[]>;
}

export interface BackupPreview {
  payload: BackupPayload;
  filename: string;
  sessions: number;
  tests: number;
  mistakes: number;
  syllabus: number;
  weeklyPlans: number;
  weeklyTargets: number;
  from?: string;
  to?: string;
}

export const NOT_A_BACKUP = "That file isn't a PrepStride backup";

function rowsOf(data: Record<string, unknown[]>, key: string): unknown[] {
  const rows = data[key];
  return Array.isArray(rows) ? rows : [];
}

function dated(rows: unknown[], field = 'date'): string[] {
  return rows
    .map((row) => {
      const value = row && typeof row === 'object' ? (row as Record<string, unknown>)[field] : '';
      return typeof value === 'string' ? value : '';
    })
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
}

/** Parse and validate. Throws without touching the database. */
export function parseBackupText(text: string): BackupPayload {
  let payload: BackupPayload;
  try {
    payload = JSON.parse(text) as BackupPayload;
  } catch {
    throw new Error(NOT_A_BACKUP);
  }
  if (!payload || payload.appName !== 'PrepStride' || !payload.data || typeof payload.data !== 'object') {
    throw new Error(NOT_A_BACKUP);
  }
  return payload;
}

export function summarizeBackup(payload: BackupPayload, filename: string): BackupPreview {
  const dates = [
    ...dated(rowsOf(payload.data, 'timeLogs')),
    ...dated(rowsOf(payload.data, 'dailyRecords')),
    ...dated(rowsOf(payload.data, 'mockTests')),
    ...dated(rowsOf(payload.data, 'mistakeLogs')),
    ...dated(rowsOf(payload.data, 'weeklyPlans'), 'weekStart'),
    ...dated(rowsOf(payload.data, 'weeklyTargets'), 'weekStart')
  ].sort();
  return {
    payload,
    filename,
    sessions: rowsOf(payload.data, 'timeLogs').length,
    tests: rowsOf(payload.data, 'mockTests').length,
    mistakes: rowsOf(payload.data, 'mistakeLogs').length,
    syllabus: rowsOf(payload.data, 'syllabusItems').length,
    weeklyPlans: rowsOf(payload.data, 'weeklyPlans').length,
    weeklyTargets: rowsOf(payload.data, 'weeklyTargets').length,
    from: dates[0],
    to: dates[dates.length - 1]
  };
}
