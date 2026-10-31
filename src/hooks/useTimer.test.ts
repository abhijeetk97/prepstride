import 'fake-indexeddb/auto';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('TZ', 'Asia/Kolkata');
const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k)
});

const { db } = await import('../db');
const { timerEngine } = await import('./useTimer');

afterEach(async () => { vi.useRealTimers(); await db.timeLogs.clear(); });
afterAll(async () => { await db.delete(); });

describe('timer log date', () => {
  it('files a session started after local midnight under the local day, not the UTC day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-30T20:30:00Z')); // 02:00 IST on 31 Oct
    timerEngine.start({ mode: 'stopwatch', subject: 'GS2', topic: 'Polity' });
    vi.setSystemTime(new Date('2026-10-30T21:00:00Z'));
    await timerEngine.stop();
    const [log] = await db.timeLogs.toArray();
    expect(log.date).toBe('2026-10-31');
    expect(log.durationMinutes).toBe(30);
  });
});
