// Pure helpers behind the animated numbers and the daily celebration, kept separate so
// the integrity rules (exact final values, one celebration a day) have tests.

/** easeOutCubic: fast start, gentle landing. */
export function easeOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) ** 3;
}

/** Value shown at progress t (0..1). Whole numbers on the way, and exactly `to` at the end. */
export function countUpFrame(from: number, to: number, t: number): number {
  if (t >= 1) return to;
  return Math.round(from + (to - from) * easeOut(t));
}

export interface CelebrationStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Claims today's single celebration. True only the first time the real target is met on
 * `date`; every later call that day (re-renders, ritual taps, revisits) returns false.
 */
export function claimDailyCelebration(date: string, todayMinutes: number, targetMinutes: number, store: CelebrationStore): boolean {
  if (todayMinutes <= 0 || todayMinutes < targetMinutes) return false;
  const key = `celebrated_${date}`;
  if (store.getItem(key)) return false;
  store.setItem(key, '1');
  return true;
}

export interface RingSegment {
  key: string;
  color: string;
  /** Fraction of the full circle (0..1). */
  start: number;
  length: number;
}

/**
 * Splits the ring by subject in the order given. The ring fills to minutes/target, capped at
 * a full circle; past the target each subject keeps its true share of the whole circle.
 */
export function ringSegments(parts: { key: string; color: string; minutes: number }[], targetMinutes: number): RingSegment[] {
  const total = parts.reduce((s, p) => s + p.minutes, 0);
  if (total <= 0) return [];
  const filled = Math.min(1, total / Math.max(1, targetMinutes));
  let start = 0;
  return parts
    .filter((p) => p.minutes > 0)
    .map((p) => {
      const length = (p.minutes / total) * filled;
      const seg = { key: p.key, color: p.color, start, length };
      start += length;
      return seg;
    });
}

/** Minutes away from Home before its arrival sequence plays again. */
export const ARRIVAL_GAP_MS = 30 * 60_000;

/**
 * Whether Home plays its arrival sequence: the first visit of a local day, or a return after
 * 30 minutes away. Plain tab switches inside that window get the finished state at once.
 */
export function shouldPlayArrival(now: Date, lastSeenMs: number | null): boolean {
  if (lastSeenMs == null || !Number.isFinite(lastSeenMs)) return true;
  const last = new Date(lastSeenMs);
  if (last.toDateString() !== now.toDateString()) return true;
  return now.getTime() - lastSeenMs >= ARRIVAL_GAP_MS;
}

/**
 * Claims the accessory drop for a newly reached rank. True once per new level; the first
 * reading only records the level, and a lower level (a restore) re-baselines silently.
 */
export function claimRankUp(level: number, store: CelebrationStore): boolean {
  const key = 'pip_rank_seen';
  const raw = store.getItem(key);
  const seen = raw === null ? NaN : Number(raw);
  if (level === seen) return false;
  store.setItem(key, String(level));
  return Number.isFinite(seen) && level > seen;
}
