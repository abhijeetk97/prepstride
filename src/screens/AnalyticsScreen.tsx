import { useMemo, useState } from 'react';
import { CalendarDays, BarChart3, BookOpen, Plus, Minus, Trash2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { minutesByDate } from '../hooks/useAppData';
import { BOOK_SPLIT_NOTICE_KEY } from '../db/backfill';
import { db } from '../db';
import { SectionCard, EmptyState } from '../components/common';
import { SUBJECT_META, type MockTestRecord, type ResourceItem } from '../types';
import { formatDateWithYear, formatMinutes, todayISO, addDays, formatDateShort } from '../utils/dates';
import { heatmapWindow, studyDayAverage, windowAverages } from '../utils/analytics';
import { csatQualified, formatPercent, formatPrelimsScore } from '../utils/scores';

export function AnalyticsScreen({ data }: { data: AppData }) {
  const minsByDate = useMemo(() => minutesByDate(data.timeLogs), [data.timeLogs]);
  const sessionsByDate = useMemo(() => {
    const counts = new Map<string, number>();
    data.timeLogs.forEach((log) => counts.set(log.date, (counts.get(log.date) ?? 0) + 1));
    return counts;
  }, [data.timeLogs]);
  const today = todayISO();
  const range = heatmapWindow(today);
  const [picked, setPicked] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const cols: { date: string; minutes: number }[][] = [];
    let cursor = range.start;
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
  }, [minsByDate, today, range.start]);

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

  const week = windowAverages(minsByDate, today, 7);
  const month = windowAverages(minsByDate, today, 30);
  const allStudy = studyDayAverage(minsByDate, today);

  const bySubject = useMemo(() => {
    const m = new Map<string, number>();
    data.timeLogs.forEach((l) => m.set(l.subject, (m.get(l.subject) ?? 0) + l.durationMinutes));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.timeLogs]);
  const totalAllTime = bySubject.reduce((s, [, v]) => s + v, 0);
  const pickedMinutes = picked ? (minsByDate.get(picked) ?? 0) : 0;
  const pickedSessions = picked ? (sessionsByDate.get(picked) ?? 0) : 0;

  return (
    <div className="px-4 pt-safe">
      <header className="pb-3 pt-4">
        <h1 className="text-xl font-extrabold text-ink">Analytics & Books</h1>
      </header>

      <SectionCard title="365-day study heatmap" icon={<CalendarDays size={14} />} className="mb-3">
        <div className="no-scrollbar overflow-x-auto pb-2">
          <div className="flex gap-[3px]">
            {weeks.map((weekCol, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {weekCol.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    disabled={day.minutes < 0}
                    aria-label={`${formatDateWithYear(day.date)}, ${day.minutes > 0 ? formatMinutes(day.minutes) : 'no study'}`}
                    aria-pressed={picked === day.date}
                    className={`h-4 w-4 rounded-[3px] ${picked === day.date ? 'ring-2 ring-ink' : ''}`}
                    style={{ background: heatColor(day.minutes) }}
                    onClick={() => day.minutes >= 0 && setPicked(picked === day.date ? null : day.date)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {picked && (
          <p className="mt-2 text-xs font-semibold text-ink">
            {formatDateWithYear(picked)} · {pickedMinutes > 0 ? formatMinutes(pickedMinutes) : 'no study'} · {pickedSessions} session
            {pickedSessions === 1 ? '' : 's'}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-inksoft">
          <span>
            Last 365 days · {formatDateWithYear(range.start)} → today
          </span>
          <span className="flex shrink-0 items-center gap-1">
            less
            {[0, 0.15, 0.4, 0.65, 1].map((t) => (
              <span key={t} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: t === 0 ? 'rgb(var(--c-line) / 0.55)' : `rgb(var(--c-brand) / ${t})` }} />
            ))}
            more
          </span>
        </div>
      </SectionCard>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <AveragePill label="7-day" calendar={week.calendar} study={week.study} />
        <AveragePill label="30-day" calendar={month.calendar} study={month.study} />
        <div className="rounded-xl bg-surface2 px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">All time</p>
          <p className="text-sm font-extrabold tabular-nums text-ink">{formatMinutes(totalAllTime)}</p>
          <p className="text-[10px] leading-tight text-inksoft">total</p>
          <p className="mt-1 text-sm font-extrabold tabular-nums text-ink">{formatMinutes(allStudy)}</p>
          <p className="text-[10px] leading-tight text-inksoft">per study day</p>
        </div>
      </div>

      <ScoresSection mocks={data.mocks} />

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

      <BookTracker data={data} />
      <div className="h-6" />
    </div>
  );
}

function AveragePill({ label, calendar, study }: { label: string; calendar: number; study: number }) {
  return (
    <div className="rounded-xl bg-surface2 px-2 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">{label}</p>
      <p className="text-sm font-extrabold tabular-nums text-ink">{formatMinutes(calendar)}/day</p>
      <p className="text-[10px] leading-tight text-inksoft">per calendar day</p>
      <p className="mt-1 text-sm font-extrabold leading-tight tabular-nums text-ink">{formatMinutes(study)} per study day</p>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 160;
  const h = 36;
  const x = (i: number) => (i / (values.length - 1)) * w;
  const y = (v: number) => h - (Math.max(0, v) / max) * (h - 4) - 2;
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-9 w-full">
      <path d={d} fill="none" stroke="rgb(var(--c-accent))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function byRecordedOrder(a: MockTestRecord, b: MockTestRecord): number {
  return a.date.localeCompare(b.date) || (a.id ?? 0) - (b.id ?? 0);
}

function ScoresSection({ mocks }: { mocks: MockTestRecord[] }) {
  const prelims = mocks.filter((m) => m.examType === 'PRELIMS').slice().sort(byRecordedOrder);
  const mains = mocks.filter((m) => m.examType === 'MAINS' && m.subject !== 'Answer writing' && m.totalMarks);
  const csat = mocks.filter((m) => m.examType === 'CSAT').slice().sort(byRecordedOrder);
  const lastPrelims = prelims[prelims.length - 1];
  const mainsAvg =
    mains.length === 0
      ? null
      : {
          obtained: Math.round(mains.reduce((s, m) => s + (m.marksObtained ?? 0), 0) / mains.length),
          total: Math.round(mains.reduce((s, m) => s + (m.totalMarks ?? 0), 0) / mains.length)
        };
  const lastCsat = csat[csat.length - 1];

  return (
    <SectionCard title="Test scores" icon={<BarChart3 size={14} />} className="mb-3">
      {mocks.length === 0 ? (
        <EmptyState emoji="🎯" text="No mocks saved yet" sub="Prelims net, mains average and CSAT qualifying show up here." />
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">Last prelims</p>
            {lastPrelims ? (
              <>
                <p className="text-sm font-extrabold tabular-nums text-ink">
                  {formatPrelimsScore(lastPrelims.calculatedScore)} · {formatPercent(lastPrelims.accuracyRate)} accuracy
                </p>
                <Sparkline values={prelims.map((m) => m.calculatedScore)} />
              </>
            ) : (
              <p className="text-xs text-inksoft">No GS prelims paper yet.</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">Mains average</p>
            <p className="text-sm font-extrabold tabular-nums text-ink">
              {mainsAvg ? `${mainsAvg.obtained}/${mainsAvg.total}` : 'No scored mains paper yet.'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">CSAT</p>
            {lastCsat ? (
              <p className="text-sm font-extrabold text-ink">
                {formatPrelimsScore(lastCsat.calculatedScore)} · {csatQualified(lastCsat.calculatedScore) ? 'Qualified' : 'Not qualified'}
                <span className="ml-1 text-[11px] font-semibold text-inksoft">· {formatDateShort(lastCsat.date)}</span>
              </p>
            ) : (
              <p className="text-xs text-inksoft">Qualifying status appears when a CSAT paper is logged.</p>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function BookTracker({ data }: { data: AppData }) {
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [chapters, setChapters] = useState(20);
  const [editing, setEditing] = useState<number | null>(null);
  const [notice, setNotice] = useState(() => localStorage.getItem(BOOK_SPLIT_NOTICE_KEY) === 'pending');

  const put = async (book: ResourceItem, patch: Partial<ResourceItem>) => {
    if (book.id === undefined) return;
    const next = { ...book, ...patch };
    if (patch.revisionsDone != null) next.currentRevision = patch.revisionsDone;
    if (patch.currentRevision != null) next.revisionsDone = patch.currentRevision;
    await db.resources.put(next);
  };

  const setChaptersDone = async (book: ResourceItem, raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const value = Math.max(0, Math.min(book.totalChapters, Math.round(parsed)));
    await put(book, { completedChapters: value });
    setEditing(null);
  };

  return (
    <SectionCard
      title="Standard booklist tracker"
      icon={<BookOpen size={14} />}
      action={
        <button className="min-h-11 px-2 text-xs font-bold text-brand" onClick={() => setNewOpen((o) => !o)}>
          {newOpen ? 'Close' : '+ Book'}
        </button>
      }
    >
      {notice && (
        <div className="mb-3 rounded-xl bg-surface2 p-3 text-xs leading-relaxed text-ink">
          Combined shelves were split into one row per book. Progress stayed on the first book of each set. The others start at chapter 0.
          <button
            className="mt-2 block min-h-11 font-bold text-brand"
            onClick={() => {
              localStorage.setItem(BOOK_SPLIT_NOTICE_KEY, 'seen');
              setNotice(false);
            }}
          >
            Dismiss
          </button>
        </div>
      )}
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
                currentRevision: 0,
                revisionsDone: 0
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
          const pct = Math.round(Math.min(100, (b.completedChapters / Math.max(1, b.totalChapters)) * 100));
          const rev = b.revisionsDone ?? b.currentRevision ?? 0;
          return (
            <li key={b.id} className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{b.title}</p>
                  <p className="text-[10px] text-inksoft">{b.subject}</p>
                </div>
                <button
                  className="hit shrink-0 text-inksoft hover:text-[#C0503C]"
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
                {editing === b.id ? (
                  <input
                    autoFocus
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={b.totalChapters}
                    defaultValue={b.completedChapters}
                    aria-label={`Chapters of ${b.title}`}
                    className="input w-20 py-1 text-right"
                    onBlur={(e) => void setChaptersDone(b, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                  />
                ) : (
                  <button className="min-h-11 shrink-0 text-right text-[11px] font-bold tabular-nums text-ink" onClick={() => b.id !== undefined && setEditing(b.id)}>
                    ch {b.completedChapters} / {b.totalChapters} · {pct}%
                  </button>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-extrabold text-ink">Rev ×{rev}</span>
                <div className="flex items-center">
                  <button className="hit text-inksoft" aria-label="Fewer revisions" onClick={() => void put(b, { revisionsDone: Math.max(0, rev - 1) })}>
                    <Minus size={16} />
                  </button>
                  <button className="hit text-inksoft" aria-label="More revisions" onClick={() => void put(b, { revisionsDone: rev + 1 })}>
                    <Plus size={16} />
                  </button>
                  <button className="hit text-inksoft" aria-label="Previous chapter" onClick={() => void put(b, { completedChapters: Math.max(0, b.completedChapters - 1) })}>
                    <Minus size={16} />
                  </button>
                  <button
                    className="hit text-ink"
                    aria-label="Next chapter"
                    onClick={() => void put(b, { completedChapters: Math.min(b.totalChapters, b.completedChapters + 1) })}
                  >
                    <Plus size={16} />
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
