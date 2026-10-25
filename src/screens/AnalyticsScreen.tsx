import { useMemo, useState } from 'react';
import { CalendarDays, BarChart3, BookOpen, Plus, Minus, Trash2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { minutesByDate } from '../hooks/useAppData';
import { db } from '../db';
import { SectionCard, EmptyState, StatPill } from '../components/common';
import { SUBJECT_META } from '../types';
import { formatMinutes, todayISO, addDays, weekStartISO } from '../utils/dates';

export function AnalyticsScreen({ data }: { data: AppData }) {
  const minsByDate = useMemo(() => minutesByDate(data.timeLogs), [data.timeLogs]);
  const today = todayISO();

  // ─── 365-day heatmap (columns = weeks, GitHub style) ───
  const weeks = useMemo(() => {
    const start = weekStartISO(addDays(today, -363));
    const cols: { date: string; minutes: number }[][] = [];
    let cursor = start;
    while (cursor <= today) {
      const week: { date: string; minutes: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(cursor, d);
        week.push({ date, minutes: date <= today ? (minsByDate.get(date) ?? 0) : -1 });
      }
      cols.push(week);
      cursor = addDays(cursor, 7);
    }
    return cols;
  }, [minsByDate, today]);

  const maxDay = Math.max(60, ...[...minsByDate.values()]);

  const heatColor = (minutes: number): string => {
    if (minutes < 0) return 'transparent';
    if (minutes === 0) return 'rgb(var(--c-line) / 0.55)';
    const t = Math.min(1, minutes / maxDay);
    if (t < 0.25) return 'rgb(var(--c-brand) / 0.3)';
    if (t < 0.5) return 'rgb(var(--c-brand) / 0.55)';
    if (t < 0.75) return 'rgb(var(--c-brand) / 0.8)';
    return 'rgb(var(--c-brand))';
  };

  // ─── Rolling averages ───
  const avgOver = (days: number): number => {
    let total = 0;
    for (let i = 0; i < days; i++) total += minsByDate.get(addDays(today, -i)) ?? 0;
    return Math.round(total / days);
  };

  // ─── Subject split (all time) ───
  const bySubject = useMemo(() => {
    const m = new Map<string, number>();
    data.timeLogs.forEach((l) => m.set(l.subject, (m.get(l.subject) ?? 0) + l.durationMinutes));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.timeLogs]);
  const totalAllTime = bySubject.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="px-4 pt-safe">
      <header className="pb-3 pt-4">
        <h1 className="text-xl font-extrabold text-ink">Analytics & Books</h1>
      </header>

      {/* Heatmap */}
      <SectionCard title="365-day study heatmap" icon={<CalendarDays size={14} />} className="mb-3">
        <div className="no-scrollbar overflow-x-auto pb-2">
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="h-[11px] w-[11px] rounded-[2px]"
                    style={{ background: heatColor(day.minutes) }}
                    title={`${day.date}: ${day.minutes > 0 ? formatMinutes(day.minutes) : 'no study'}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-inksoft">
          <span>Apr → today · each square = 1 day</span>
          <span className="flex items-center gap-1">
            less
            {[0, 0.15, 0.4, 0.65, 1].map((t) => (
              <span key={t} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: t === 0 ? 'rgb(var(--c-line) / 0.55)' : `rgb(var(--c-brand) / ${t})` }} />
            ))}
            more
          </span>
        </div>
      </SectionCard>

      {/* Rolling stats */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <StatPill label="7-day avg" value={formatMinutes(avgOver(7))} sub="per day" />
        <StatPill label="30-day avg" value={formatMinutes(avgOver(30))} sub="per day" />
        <StatPill label="All time" value={formatMinutes(totalAllTime)} sub={`${data.timeLogs.length} sessions`} />
      </div>

      {/* Subject split */}
      <SectionCard title="All-time subject distribution" icon={<BarChart3 size={14} />} className="mb-3">
        {bySubject.length === 0 ? (
          <EmptyState emoji="📊" text="Log some sessions to see the split" sub="Watch for neglected areas — is CSAT or the Optional getting enough love?" />
        ) : (
          <ul className="space-y-2.5">
            {bySubject.map(([subject, mins]) => {
              const meta = SUBJECT_META[subject as keyof typeof SUBJECT_META];
              return (
                <li key={subject}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{meta?.label ?? subject}</span>
                    <span className="tabular-nums text-inksoft">
                      {formatMinutes(mins)} · {Math.round((mins / totalAllTime) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
                    <div className="h-full rounded-full" style={{ width: `${(mins / totalAllTime) * 100}%`, background: meta?.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* Booklist tracker */}
      <BookTracker data={data} />
      <div className="h-6" />
    </div>
  );
}

function BookTracker({ data }: { data: AppData }) {
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [chapters, setChapters] = useState(20);

  const adjust = async (id: number | undefined, field: 'completedChapters' | 'currentRevision', delta: number, max?: number) => {
    const book = data.resources.find((r) => r.id === id);
    if (!book || id === undefined) return;
    let value = book[field] + delta;
    if (value < 0) value = 0;
    if (max !== undefined && value > max) value = max;
    await db.resources.put({ ...book, [field]: value });
  };

  return (
    <SectionCard
      title="Standard booklist tracker"
      icon={<BookOpen size={14} />}
      action={
        <button className="text-xs font-bold text-brand" onClick={() => setNewOpen((o) => !o)}>
          {newOpen ? 'Close' : '+ Book'}
        </button>
      }
    >
      {newOpen && (
        <div className="mb-3 space-y-2 rounded-xl bg-surface2 p-3">
          <input className="input" placeholder="Book title & author" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <input type="number" className="input w-24" placeholder="Ch." value={chapters} onChange={(e) => setChapters(Number(e.target.value))} />
          </div>
          <button
            className="btn-primary w-full py-2"
            onClick={async () => {
              if (!title.trim()) return;
              await db.resources.add({
                title: title.trim(),
                subject: subject.trim() || 'General',
                totalChapters: Math.max(1, chapters),
                completedChapters: 0,
                currentRevision: 0
              });
              setTitle('');
              setSubject('');
              setNewOpen(false);
            }}
          >
            Add book
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {data.resources.map((b) => {
          const pct = Math.min(100, (b.completedChapters / Math.max(1, b.totalChapters)) * 100);
          return (
            <li key={b.id} className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{b.title}</p>
                  <p className="text-[10px] text-inksoft">{b.subject}</p>
                </div>
                <button
                  className="shrink-0 text-inksoft hover:text-[#C0503C]"
                  aria-label="Delete book"
                  onClick={() => b.id !== undefined && confirm(`Remove "${b.title}"?`) && void db.resources.delete(b.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface2">
                  <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-20 text-right text-[11px] font-bold tabular-nums text-inksoft">
                  {b.completedChapters}/{b.totalChapters} ch
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">Revision pass</span>
                <div className="flex items-center gap-1.5">
                  <button className="rounded-md bg-surface2 p-1 text-inksoft" aria-label="Fewer revisions" onClick={() => void adjust(b.id, 'currentRevision', -1)}>
                    <Minus size={12} />
                  </button>
                  <span className="w-14 text-center text-xs font-extrabold text-ink">
                    {b.currentRevision === 0 ? 'Reading' : b.currentRevision >= 3 ? 'Rev 3+ 🏛️' : `Rev ${b.currentRevision}`}
                  </span>
                  <button className="rounded-md bg-surface2 p-1 text-inksoft" aria-label="More revisions" onClick={() => void adjust(b.id, 'currentRevision', 1, 5)}>
                    <Plus size={12} />
                  </button>
                  <span className="mx-1 text-line">|</span>
                  <button className="rounded-md bg-surface2 p-1 text-inksoft" aria-label="Previous chapter" onClick={() => void adjust(b.id, 'completedChapters', -1)}>
                    <Minus size={12} />
                  </button>
                  <button className="rounded-md bg-surface2 p-1 text-inksoft" aria-label="Next chapter" onClick={() => void adjust(b.id, 'completedChapters', 1, b.totalChapters)}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
