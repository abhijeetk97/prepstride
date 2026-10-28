import { showToast } from '../components/common/Toast';
import { parseBackupText, summarizeBackup, type BackupPayload, type BackupPreview } from '../utils/backupParse';
import { db } from './index';

export { parseBackupText, summarizeBackup };
export type { BackupPayload, BackupPreview };

const TABLE_KEYS = [
  'timeLogs',
  'dailyRecords',
  'dailyRituals',
  'syllabusItems',
  'mockTests',
  'mistakeLogs',
  'resources',
  'badges',
  'partnerTreats',
  'gamification',
  'settings',
  'weeklyPlans',
  'weeklyTargets'
] as const;

function rowsOf(data: Record<string, unknown[]>, key: string): unknown[] {
  const rows = data[key];
  return Array.isArray(rows) ? rows : [];
}

/** Export the complete data store to a downloadable JSON file and confirm on screen. */
export async function exportBackup(): Promise<{ filename: string; exportedAt: string }> {
  const exportedAt = new Date().toISOString();
  const payload: BackupPayload = {
    version: 1,
    exportedAt,
    appName: 'PrepStride',
    data: {
      timeLogs: await db.timeLogs.toArray(),
      dailyRecords: await db.dailyRecords.toArray(),
      dailyRituals: await db.dailyRituals.toArray(),
      syllabusItems: await db.syllabusItems.toArray(),
      mockTests: await db.mockTests.toArray(),
      mistakeLogs: await db.mistakeLogs.toArray(),
      resources: await db.resources.toArray(),
      badges: await db.badges.toArray(),
      partnerTreats: await db.partnerTreats.toArray(),
      gamification: await db.gamification.toArray(),
      settings: await db.settings.toArray(),
      weeklyPlans: await db.weeklyPlans.toArray(),
      weeklyTargets: await db.weeklyTargets.toArray()
    }
  };

  const filename = `prepstride-backup-${exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  const g = await db.gamification.get('current_gamification');
  if (g) await db.gamification.put({ ...g, lastBackupReminderAt: Date.now() });
  localStorage.setItem('prepstride_last_backup', String(Date.now()));

  const time = new Date(exportedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  showToast({ message: `Backup saved · ${filename} · ${time}` });
  return { filename, exportedAt };
}

/** Replace every table. Call only after the user confirms a parsed backup. */
export async function applyBackup(payload: BackupPayload): Promise<{ tables: number; rows: number }> {
  let rows = 0;
  await db.transaction('rw', db.tables, async () => {
    for (const key of TABLE_KEYS) {
      await db.table(key).clear();
      const rowsForTable = rowsOf(payload.data, key) as { id?: unknown }[];
      if (rowsForTable.length > 0) {
        const table = db.table(key);
        if (table.schema.primKey.auto) await table.bulkAdd(rowsForTable);
        else await table.bulkPut(rowsForTable);
        rows += rowsForTable.length;
      }
    }
  });
  localStorage.setItem('prepstride_seeded_v1', '1');
  return { tables: TABLE_KEYS.length, rows };
}
