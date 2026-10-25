import { db } from './index';

export interface BackupPayload {
  version: number;
  exportedAt: string;
  appName: string;
  data: Record<string, unknown[]>;
}

/** Export the complete data store to a downloadable, human-readable JSON file. */
export async function exportBackup(): Promise<void> {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
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
      settings: await db.settings.toArray()
    }
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prepstride-backup-${payload.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  const g = await db.gamification.get('current_gamification');
  if (g) await db.gamification.put({ ...g, lastBackupReminderAt: Date.now() });
  localStorage.setItem('prepstride_last_backup', String(Date.now()));
}

/** Validate + restore a backup JSON, wiping and re-hydrating all tables atomically. */
export async function restoreBackup(file: File): Promise<{ tables: number; rows: number }> {
  let payload: BackupPayload;
  try {
    payload = JSON.parse(await file.text()) as BackupPayload;
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (payload.appName !== 'PrepStride' || !payload.data || typeof payload.data !== 'object') {
    throw new Error('This does not look like a PrepStride backup file.');
  }

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
    'settings'
  ] as const;

  let rows = 0;
  await db.transaction('rw', db.tables, async () => {
    for (const key of TABLE_KEYS) {
      await db.table(key).clear();
      const rowsForTable = (payload.data[key] ?? []) as { id?: unknown }[];
      if (rowsForTable.length > 0) {
        // Ensure auto-increment keys don't collide after restore
        const table = db.table(key);
        if (table.schema.primKey.auto) {
          await table.bulkAdd(rowsForTable);
        } else {
          await table.bulkPut(rowsForTable);
        }
        rows += rowsForTable.length;
      }
    }
  });
  localStorage.setItem('prepstride_seeded_v1', '1');
  return { tables: TABLE_KEYS.length, rows };
}
