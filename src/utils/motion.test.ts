import { describe, expect, it } from 'vitest';
import { claimDailyCelebration, countUpFrame, ringSegments } from './motion';

function memoryStore() {
  const map = new Map<string, string>();
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v) };
}

describe('countUpFrame', () => {
  it('lands exactly on the stored value', () => {
    expect(countUpFrame(0, 187, 1)).toBe(187);
    expect(countUpFrame(0, 187, 1.4)).toBe(187);
    expect(countUpFrame(42, 0, 1)).toBe(0);
  });

  it('never overshoots on the way', () => {
    for (let t = 0; t < 1; t += 0.05) {
      const v = countUpFrame(0, 240, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(240);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('claimDailyCelebration', () => {
  it('fires once when the target is met, then never again that day', () => {
    const store = memoryStore();
    expect(claimDailyCelebration('2026-11-01', 240, 240, store)).toBe(true);
    expect(claimDailyCelebration('2026-11-01', 260, 240, store)).toBe(false);
    expect(claimDailyCelebration('2026-11-01', 300, 240, store)).toBe(false);
  });

  it('does not fire below the target or with nothing logged', () => {
    const store = memoryStore();
    expect(claimDailyCelebration('2026-11-01', 239, 240, store)).toBe(false);
    expect(claimDailyCelebration('2026-11-01', 0, 0, store)).toBe(false);
    expect(claimDailyCelebration('2026-11-01', 240, 240, store)).toBe(true);
  });

  it('a new day gets its own celebration', () => {
    const store = memoryStore();
    expect(claimDailyCelebration('2026-11-01', 240, 240, store)).toBe(true);
    expect(claimDailyCelebration('2026-11-02', 240, 240, store)).toBe(true);
  });
});

describe('ringSegments', () => {
  it('fills to minutes / target in subject order', () => {
    const segs = ringSegments(
      [
        { key: 'a', color: '#a', minutes: 60 },
        { key: 'b', color: '#b', minutes: 60 }
      ],
      240
    );
    expect(segs.map((s) => [s.start, s.length])).toEqual([
      [0, 0.25],
      [0.25, 0.25]
    ]);
  });

  it('caps at a full circle and keeps true shares past the target', () => {
    const segs = ringSegments(
      [
        { key: 'a', color: '#a', minutes: 300 },
        { key: 'b', color: '#b', minutes: 100 }
      ],
      240
    );
    expect(segs[0].length).toBeCloseTo(0.75);
    expect(segs[1].length).toBeCloseTo(0.25);
  });

  it('is empty with nothing logged', () => {
    expect(ringSegments([], 240)).toEqual([]);
  });
});
