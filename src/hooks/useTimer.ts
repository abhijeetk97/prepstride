import { useEffect, useState } from 'react';
import { db } from '../db';
import type { SubjectCategory, TimeLog } from '../types';
import { playChime } from '../utils/share';

// Persistent, timestamp-based timer. All elapsed math derives from wall-clock
// epochs, so the timer stays accurate when the mobile browser throttles
// intervals, the screen sleeps, or the app is refreshed mid-session.
const STORAGE_KEY = 'prepstride_active_timer';

export interface ActiveTimer {
  mode: 'pomodoro' | 'stopwatch';
  phase: 'work' | 'break';
  startEpoch: number; // anchor of the current phase timeline
  pausedAccumMs: number; // pause time accumulated before current anchor
  pausedAt?: number; // set while paused
  subject: SubjectCategory;
  topic: string;
  workMin: number;
  breakMin: number;
  soundEnabled: boolean;
}

export interface TimerSnapshot {
  timer: ActiveTimer | null;
  elapsedMs: number;
  phaseRemainingMs: number; // for pomodoro; total elapsed for stopwatch
  phaseTotalMs: number;
}

function load(): ActiveTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActiveTimer) : null;
  } catch {
    return null;
  }
}

function save(t: ActiveTimer | null): void {
  if (t) localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  else localStorage.removeItem(STORAGE_KEY);
}

function elapsedOf(t: ActiveTimer): number {
  const runMs = (t.pausedAt ?? Date.now()) - t.startEpoch;
  return t.pausedAccumMs + Math.max(0, runMs);
}

class TimerEngine {
  private listeners = new Set<() => void>();
  private timer: ActiveTimer | null = load();

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = (): TimerSnapshot => {
    const t = this.timer;
    if (!t) return { timer: null, elapsedMs: 0, phaseRemainingMs: 0, phaseTotalMs: 0 };
    const elapsed = elapsedOf(t);
    const phaseTotalMs = t.mode === 'pomodoro' ? (t.phase === 'work' ? t.workMin : t.breakMin) * 60_000 : elapsed;
    return {
      timer: t,
      elapsedMs: elapsed,
      phaseRemainingMs: t.mode === 'pomodoro' ? Math.max(0, phaseTotalMs - elapsed) : elapsed,
      phaseTotalMs
    };
  };

  private emit(): void {
    this.listeners.forEach((l) => l());
  }

  start(opts: {
    mode: 'pomodoro' | 'stopwatch';
    subject: SubjectCategory;
    topic: string;
    workMin?: number;
    breakMin?: number;
    soundEnabled?: boolean;
  }): void {
    this.timer = {
      mode: opts.mode,
      phase: 'work',
      startEpoch: Date.now(),
      pausedAccumMs: 0,
      subject: opts.subject,
      topic: opts.topic,
      workMin: opts.workMin ?? 50,
      breakMin: opts.breakMin ?? 10,
      soundEnabled: opts.soundEnabled ?? true
    };
    save(this.timer);
    this.emit();
  }

  pause(): void {
    const t = this.timer;
    if (!t || t.pausedAt) return;
    t.pausedAt = Date.now();
    save(t);
    this.emit();
  }

  resume(): void {
    const t = this.timer;
    if (!t || !t.pausedAt) return;
    t.pausedAccumMs += t.pausedAt - t.startEpoch;
    t.startEpoch = Date.now();
    t.pausedAt = undefined;
    save(t);
    this.emit();
  }

  private async writeLog(t: ActiveTimer, startEpoch: number, durationMs: number): Promise<void> {
    const minutes = Math.round(durationMs / 60_000);
    if (minutes < 1) return;
    const startTime = new Date(startEpoch).toISOString();
    const log: TimeLog = {
      date: startTime.slice(0, 10),
      startTime,
      endTime: new Date(startEpoch + durationMs).toISOString(),
      durationMinutes: minutes,
      subject: t.subject,
      topic: t.topic || 'Focus session',
      mode: t.mode === 'pomodoro' ? 'pomodoro' : 'stopwatch',
      createdAt: Date.now()
    };
    await db.timeLogs.add(log);
  }

  /** Stop the session; logs elapsed focus time (≥ 1 min). Returns logged minutes. */
  async stop(): Promise<number> {
    const t = this.timer;
    if (!t) return 0;
    const elapsed = elapsedOf(t);
    const minutes = Math.round(elapsed / 60_000);
    if (t.phase === 'break') {
      // break time is not study time
    } else {
      await this.writeLog(t, t.startEpoch - t.pausedAccumMs, elapsed);
    }
    this.timer = null;
    save(null);
    this.emit();
    return t.phase === 'break' ? 0 : minutes;
  }

  /** Advance pomodoro phases; auto-saves each completed work block. */
  tick(): void {
    const t = this.timer;
    if (!t || t.pausedAt || t.mode !== 'pomodoro') {
      this.emit();
      return;
    }
    let guard = 0;
    while (guard++ < 8) {
      const elapsed = elapsedOf(t);
      const phaseTotalMs = (t.phase === 'work' ? t.workMin : t.breakMin) * 60_000;
      if (elapsed < phaseTotalMs) break;
      const phaseStart = t.startEpoch - t.pausedAccumMs;
      if (t.phase === 'work') {
        void this.writeLog(t, phaseStart, phaseTotalMs);
        playChime(t.soundEnabled);
        t.phase = 'break';
      } else {
        playChime(t.soundEnabled);
        t.phase = 'work';
      }
      t.startEpoch += phaseTotalMs;
      t.pausedAccumMs = 0;
    }
    save(t);
    this.emit();
  }
}

export const timerEngine = new TimerEngine();

export function useTimer(): TimerSnapshot & {
  start: typeof timerEngine.start;
  pause: typeof timerEngine.pause;
  resume: typeof timerEngine.resume;
  stop: typeof timerEngine.stop;
} {
  const [snap, setSnap] = useState<TimerSnapshot>(() => timerEngine.getSnapshot());

  useEffect(() => {
    const unsub = timerEngine.subscribe(() => setSnap(timerEngine.getSnapshot()));
    const interval = setInterval(() => {
      timerEngine.tick();
      setSnap(timerEngine.getSnapshot());
    }, 500);
    const onVisible = () => {
      timerEngine.tick();
      setSnap(timerEngine.getSnapshot());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      unsub();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { ...snap, start: timerEngine.start.bind(timerEngine), pause: timerEngine.pause.bind(timerEngine), resume: timerEngine.resume.bind(timerEngine), stop: timerEngine.stop.bind(timerEngine) };
}
