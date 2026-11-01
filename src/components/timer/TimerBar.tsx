import { useEffect } from 'react';
import { Pause, Play, Square, Maximize2, Minimize2, Coffee } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { formatClock } from '../../utils/dates';
import { Pip } from '../mascot/Pip';
import { showToast } from '../common';
import { SUBJECT_META } from '../../types';
import { RollingDigits } from '../motion/RollingDigits';

type WakeLockSentinelLike = { release: () => Promise<void> };

/** Keeps the screen on while zen mode is open and the session is running. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } };
    if (!active || !nav.wakeLock) return;
    let lock: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = () => {
      if (document.visibilityState !== 'visible') return;
      nav.wakeLock!.request('screen').then((l) => {
        if (cancelled) void l.release();
        else lock = l;
      }).catch(() => undefined);
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, [active]);
}

/** Slim always-visible bar while a session runs, expandable into full-screen zen mode. */
export function TimerBar() {
  const timer = useTimer();
  const zen = timer.zenOpen;
  useWakeLock(Boolean(zen && timer.timer && !timer.timer.pausedAt));

  if (!timer.timer) return null;
  const t = timer.timer;
  const isBreak = t.phase === 'break';

  const clock = t.mode === 'pomodoro' ? formatClock(timer.phaseRemainingMs / 1000) : formatClock(timer.elapsedMs / 1000);
  const subjectMeta = SUBJECT_META[t.subject];

  const onStop = async () => {
    const result = await timer.stop();
    if (result.discarded) showToast({ message: 'Under a minute — not logged' });
  };

  const controls = (
    <>
      {t.pausedAt ? (
        <button onClick={timer.resume} className="hit rounded-full bg-brand text-white shadow active:scale-90" aria-label="Resume">
          <Play size={20} fill="currentColor" />
        </button>
      ) : (
        <button onClick={timer.pause} className="hit rounded-full bg-brand text-white shadow active:scale-90" aria-label="Pause">
          <Pause size={20} fill="currentColor" />
        </button>
      )}
      <button onClick={() => void onStop()} className="hit rounded-full bg-surface2 text-ink active:scale-90" aria-label="Stop & save">
        <Square size={18} fill="currentColor" />
      </button>
    </>
  );

  return (
    <>
      {/* Slim bar */}
      <div className="timer-bar fixed inset-x-0 bottom-[68px] z-30 px-3">
        <div className="elev-3 mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-brand/40 bg-surface/95 px-4 py-2 backdrop-blur">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isBreak ? 'bg-[#7EC8E3]' : 'bg-brand animate-pulse'}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">
              {isBreak && t.mode === 'pomodoro' ? 'Break' : subjectMeta?.short ?? 'Focus'}
              {t.topic ? <span className="font-normal text-inksoft"> · {t.topic}</span> : null}
            </p>
            <p className="text-sm font-extrabold tabular-nums text-brand">{clock}</p>
          </div>
          <div className="flex items-center gap-2">{controls}</div>
          <button onClick={timer.openZen} className="hit rounded-full text-inksoft" aria-label="Zen mode">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Full-screen zen mode: the only screen with ambient motion. */}
      {zen && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-paper px-6 pt-safe pb-safe animate-fade-in ${t.pausedAt ? 'zen-paused' : ''}`}
        >
          {/* Two blurred colour fields drift slowly behind everything. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span
              className="zen-drift-a absolute left-[10%] top-[18%] h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{ background: isBreak ? 'rgb(var(--c-accent))' : 'rgb(var(--c-brand-soft))' }}
            />
            <span
              className="zen-drift-b absolute bottom-[20%] right-[5%] h-56 w-56 rounded-full opacity-30 blur-3xl"
              style={{ background: subjectMeta?.color ?? 'rgb(var(--c-accent))' }}
            />
          </div>

          <div className="relative flex w-full items-center justify-between pt-4">
            <div className="rounded-full bg-surface2 px-3 py-1 text-xs font-bold text-inksoft">
              {t.mode === 'pomodoro' ? `Pomodoro · ${t.workMin}/${t.breakMin}` : 'Stopwatch'}
            </div>
            <button onClick={timer.closeZen} className="hit rounded-full bg-surface2 text-inksoft" aria-label="Exit zen mode">
              <Minimize2 size={18} />
            </button>
          </div>

          <div className="relative flex flex-col items-center gap-5">
            <div className="relative flex h-56 w-56 items-center justify-center">
              {/* Warm halo: 4s in, 4s out. Cools to sky blue on a break. */}
              <span
                aria-hidden
                className="zen-halo absolute inset-3 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${isBreak ? 'rgb(var(--c-accent) / .45)' : 'rgb(var(--c-brand) / .32)'} 0%, transparent 70%)`
                }}
              />
              {t.mode === 'pomodoro' && <PhaseArc progress={timer.phaseTotalMs ? 1 - timer.phaseRemainingMs / timer.phaseTotalMs : 0} color={isBreak ? 'rgb(var(--c-accent))' : subjectMeta?.color ?? 'rgb(var(--c-brand))'} />}
              <Pip mood={isBreak && t.mode === 'pomodoro' ? 'sleep' : 'focus'} size={140} />
            </div>

            <div className="relative h-5 w-48 text-center text-sm font-semibold text-inksoft" aria-hidden>
              {isBreak && t.mode === 'pomodoro' ? (
                <span className="absolute inset-0">Rest your eyes</span>
              ) : (
                <>
                  <span className="zen-cue-in absolute inset-0">Breathe in</span>
                  <span className="zen-cue-out absolute inset-0">Breathe out</span>
                </>
              )}
            </div>

            <RollingDigits text={clock} className="font-display text-6xl tracking-tight text-ink" />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: subjectMeta?.color }}>
                {isBreak && t.mode === 'pomodoro' ? 'Break time' : subjectMeta?.label ?? 'Focus session'}
              </p>
              {t.topic && <p className="mt-0.5 text-xs text-inksoft">{t.topic}</p>}
            </div>
            {t.mode === 'pomodoro' && (
              <div className="flex items-center gap-1.5 text-inksoft">
                <Coffee size={14} />
                <span className="text-xs">
                  {isBreak ? `Back to ${t.workMin}m focus after this` : `${t.breakMin}m break after this`}
                </span>
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-4 pb-6">{controls}</div>
        </div>
      )}
    </>
  );
}

/** Arc around Pip tracing the current Pomodoro phase. Exact: it is the elapsed share of the phase. */
function PhaseArc({ progress, color }: { progress: number; color: string }) {
  const size = 224;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}
