import { useMemo, useState } from 'react';
import { Plus, Timer as TimerIcon, Trash2, CalendarDays, BarChart3 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { db } from '../db';
import { SectionCard, EmptyState, StatPill, showToast } from '../components/common';
import { RetroLogModal } from '../components/timesheet/RetroLogModal';
import { TimerStartModal } from '../components/timer/TimerStartModal';
import { useTimer } from '../hooks/useTimer';
import { SUBJECT_META, type TimeLog } from '../types';
import { formatMinutes, todayISO, toISODate, weekStartISO, monthStartISO, formatDateShort, lastNDays } from '../utils/dates';

type View = 'day' | 'week' | 'month';

export function TimesheetScreen({ data }: { data: AppData }) {
  const [view, setView] = useState<View>('day');
  const [dayOffset, setDayOffset] = useState(0);
  const [retroOpen, setRetroOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const timer = useTimer();

  const deleteLog = (log: TimeLog) => {
    if (log.id == null || !confirm('Delete this session?')) return;
    const snapshot = { ...log };
    void db.timeLogs.delete(log.id).then(() => {
      showToast({
        message: 'Session deleted',
        actionLabel: 'Undo',
        duration: 5000,
        onAction: () => void db.timeLogs.put(snapshot)
      });
    });
  };

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    return toISODate(d);
  }, [dayOffset]);

  const dayLogs = useMemo(() => data.timeLogs.filter((l) => l.date === viewDate), [data.timeLogs, viewDate]);

  const rangeStats = useMemo(() => {
    const from = view === 'week' ? weekStartISO() : monthStartISO();
    const logs = view === 'day' ? dayLogs : data.timeLogs.filter((l) => l.date >= from && l.date <= todayISO());
    const total = logs.reduce((s, l) => s + l.durationMinutes, 0);
    const days = view === 'week' ? 7 : new Date().getDate();
    const bySubject = new Map<string, number>();
    logs.forEach((l) => bySubject.set(l.subject, (bySubject.get(l.subject) ?? 0) + l.durationMinutes));
    return { logs, total, avg: Math.round(total / days), bySubject: [...bySubject.entries()].sort((a, b) => b[1] - a[1]) };
  }, [view, data.timeLogs, dayLogs]);

  const weekBars = useMemo(() => {
    const days = lastNDays(7);
    const mins = new Map<string, number>();
    data.timeLogs.forEach((l) => mins.set(l.date, (mins.get(l.date) ?? 0) + l.durationMinutes));
    const max = Math.max(60, ...days.map((d) => mins.get(d) ?? 0));
    return days.map((d) => ({ date: d, minutes: mins.get(d) ?? 0, max }));
  }, [data.timeLogs]);

  return (
    <div className="px-4 pt-safe">
      <header className="flex items-center justify-between pb-3 pt-4">
        <h1 className="text-xl font-extrabold text-ink">Timesheet</h1>
        <div className="flex gap-2">
          <button className="btn-ghost px-3 py-2" onClick={() => (timer.timer ? timer.openZen() : setTimerOpen(true))}>
            <TimerIcon size={16} /> {timer.timer ? 'Session' : 'Timer'}
          </button>
          <button className="btn-primary px-3 py-2" onClick={() => setRetroOpen(true)}>
            <Plus size={16} /> Log
          </button>
        </div>
      </header>

      {/* View switcher */}
      <div className="mb-3 flex gap-2">
        {(['day', 'week', 'month'] as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`chip flex-1 justify-center ${view === v ? 'chip-active' : ''}`}>
            {v === 'day' ? '📅 Day' : v === 'week' ? '🗓️ Week' : '📆 Month'}
          </button>
        ))}
      </div>

      {view === 'day' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button className="btn-ghost px-3 py-1.5" onClick={() => setDayOffset((o) => o + 1)} disabled={dayOffset >= 365}>
              ←
            </button>
            <p className="text-sm font-bold text-ink">
              {dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Yesterday' : formatDateShort(viewDate)}
              <span className="ml-2 font-semibold text-inksoft">
                {formatMinutes(rangeStats.total)}
                {dayOffset === 0 ? ` today · target ${formatMinutes(data.todayTargetMinutes)}` : ''}
              </span>
            </p>
            <button className="btn-ghost px-3 py-1.5" onClick={() => setDayOffset((o) => Math.max(0, o - 1))} disabled={dayOffset === 0}>
              →
            </button>
          </div>

          <SectionCard title="Sessions" icon={<CalendarDays size={14} />}>
            {dayLogs.length === 0 ? (
              <EmptyState emoji="🕊️" text="No sessions on this day" sub="Use the timer for live tracking, or Quick Log for library/coaching hours." />
            ) : (
              <ul className="divide-y divide-line">
                {dayLogs
                  .slice()
                  .sort((a, b) => (b.startTime ?? '').localeCompare(a.startTime ?? ''))
                  .map((l) => {
                    const meta = SUBJECT_META[l.subject];
                    return (
                      <li key={l.id} className="flex items-center gap-3 py-2.5">
                        <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold leading-snug text-ink">{l.topic || meta.label}</p>
                          <p className="text-[11px] text-inksoft">
                            {meta.short}
                            {l.startTime && l.endTime
                              ? ` · ${new Date(l.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}–${new Date(
                                  l.endTime
                                ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                              : ' · no time recorded'}
                            {' · '}
                            {l.mode === 'pomodoro' ? '🍅' : l.mode === 'stopwatch' ? '⏱️' : '✍️'}
                          </p>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-ink">{formatMinutes(l.durationMinutes)}</span>
                        <button
                          className="hit shrink-0 rounded-full text-inksoft hover:text-[#C0503C]"
                          aria-label="Delete session"
                          onClick={() => deleteLog(l)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </SectionCard>
        </>
      )}

      {view === 'week' && (
        <>
          <SectionCard title="This week" icon={<BarChart3 size={14} />} className="mb-3">
            <div className="grid grid-cols-3 gap-2">
              <StatPill label="Total" value={formatMinutes(rangeStats.total)} />
              <StatPill label="Daily avg" value={formatMinutes(rangeStats.avg)} />
              <StatPill label="Sessions" value={String(rangeStats.logs.length)} />
            </div>
            <div className="mt-4 flex h-32 items-end justify-between gap-2">
              {weekBars.map((b) => (
                <div key={b.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-bold tabular-nums text-inksoft">{b.minutes > 0 ? Math.round(b.minutes / 60) + 'h' : ''}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(3, (b.minutes / b.max) * 100)}%`,
                      background: b.date === todayISO() ? 'rgb(var(--c-brand))' : 'color-mix(in srgb, rgb(var(--c-brand)) 45%, rgb(var(--c-line)))'
                    }}
                  />
                  <span className={`text-[10px] font-semibold ${b.date === todayISO() ? 'text-brand' : 'text-inksoft'}`}>
                    {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SubjectSplit entries={rangeStats.bySubject} />
        </>
      )}

      {view === 'month' && (
        <>
          <SectionCard title="This month" icon={<BarChart3 size={14} />} className="mb-3">
            <div className="grid grid-cols-3 gap-2">
              <StatPill label="Total" value={formatMinutes(rangeStats.total)} />
              <StatPill label="Daily avg" value={formatMinutes(rangeStats.avg)} />
              <StatPill label="Sessions" value={String(rangeStats.logs.length)} />
            </div>
          </SectionCard>
          <SubjectSplit entries={rangeStats.bySubject} />
        </>
      )}

      <div className="h-6" />

      <RetroLogModal open={retroOpen} onClose={() => setRetroOpen(false)} defaultDate={view === 'day' ? viewDate : undefined} />
      <TimerStartModal open={timerOpen} onClose={() => setTimerOpen(false)} settings={data.settings} />
    </div>
  );
}

function SubjectSplit({ entries }: { entries: [string, number][] }) {
  const total = entries.reduce((s, [, m]) => s + m, 0);
  return (
    <SectionCard title="Subject split" icon={<BarChart3 size={14} />}>
      {entries.length === 0 ? (
        <EmptyState emoji="📊" text="No data yet in this range" />
      ) : (
        <ul className="space-y-2.5">
          {entries.map(([subject, mins]) => {
            const meta = SUBJECT_META[subject as keyof typeof SUBJECT_META];
            return (
              <li key={subject}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">{meta?.label ?? subject}</span>
                  <span className="tabular-nums text-inksoft">
                    {formatMinutes(mins)} · {Math.round((mins / total) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(mins / total) * 100}%`, background: meta?.color ?? '#999' }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
