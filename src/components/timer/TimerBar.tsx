import { Pause, Play, Square, Maximize2, Minimize2, Coffee } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { formatClock } from '../../utils/dates';
import { Pip } from '../mascot/Pip';
import { showToast } from '../common';
import { SUBJECT_META } from '../../types';

/** Slim always-visible bar while a session runs, expandable into full-screen zen mode. */
export function TimerBar() {
  const timer = useTimer();
  const zen = timer.zenOpen;

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
      <div className="fixed inset-x-0 bottom-[68px] z-30 px-3">
        <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-brand/40 bg-surface/95 px-4 py-2 shadow-lg backdrop-blur">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isBreak ? 'bg-[#7EC8E3]' : 'bg-brand animate-pulse'}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">
              {isBreak && t.mode === 'pomodoro' ? '☕ Break' : subjectMeta?.short ?? 'Focus'}
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

      {/* Full-screen zen mode */}
      {zen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-paper px-6 pt-safe pb-safe">
          <div className="flex w-full items-center justify-between pt-4">
            <div className="rounded-full bg-surface2 px-3 py-1 text-xs font-bold text-inksoft">
              {t.mode === 'pomodoro' ? `Pomodoro · ${t.workMin}/${t.breakMin}` : 'Stopwatch'}
            </div>
            <button onClick={timer.closeZen} className="hit rounded-full bg-surface2 text-inksoft" aria-label="Exit zen mode">
              <Minimize2 size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            {isBreak && t.mode === 'pomodoro' ? (
              <>
                <Pip mood="sleep" size={130} />
                <p className="max-w-xs text-center text-sm text-inksoft">
                  Rest well, champion. Recovery is part of the strategy.
                </p>
              </>
            ) : (
              <>
                <Pip mood="focus" size={130} />
                <p className="max-w-xs text-center text-sm text-inksoft">Pip is focusing quietly beside you. Breathe. One page at a time.</p>
              </>
            )}
            <p className="text-6xl font-extrabold tabular-nums tracking-tight text-ink">{clock}</p>
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

          <div className="flex items-center gap-4 pb-6">{controls}</div>
        </div>
      )}
    </>
  );
}
