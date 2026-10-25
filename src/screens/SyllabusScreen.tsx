import { useMemo, useState } from 'react';
import { Search, RefreshCw, Plus, Layers, ChevronDown, AlertTriangle, BookMarked } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { db } from '../db';
import { addCustomTopic, loadOptionalTemplate } from '../db/seed';
import { SectionCard, Modal, ProgressBar, EmptyState } from '../components/common';
import { PAPER_META, STATUS_META, type Paper, type SyllabusItem, type SyllabusStatus } from '../types';
import { todayISO } from '../utils/dates';
import { isStale, nextRevisionDate } from '../utils/gamification';
import { OPTIONAL_TEMPLATES } from '../data/optionals';

const STATUS_ORDER: SyllabusStatus[] = ['not_started', 'first_reading', 'notes_done', 'rev_1', 'rev_2', 'mastered'];

export function SyllabusScreen({ data }: { data: AppData }) {
  const [mode, setMode] = useState<'checklist' | 'revision'>('checklist');
  const [paper, setPaper] = useState<Paper>('GS1');
  const [query, setQuery] = useState('');
  const [optionalOpen, setOptionalOpen] = useState(false);

  const hasOptional = data.syllabus.some((i) => i.paper === 'OPTIONAL_P1' || i.paper === 'OPTIONAL_P2');
  const papers: Paper[] = ['PRELIMS', 'GS1', 'GS2', 'GS3', 'GS4', 'CSAT', ...(hasOptional ? (['OPTIONAL_P1', 'OPTIONAL_P2'] as Paper[]) : [])];

  const paperItems = useMemo(
    () => data.syllabus.filter((i) => i.paper === paper && (!query || (i.microTopic + ' ' + i.category).toLowerCase().includes(query.toLowerCase()))),
    [data.syllabus, paper, query]
  );

  const byCategory = useMemo(() => {
    const m = new Map<string, SyllabusItem[]>();
    paperItems.forEach((i) => {
      const arr = m.get(i.category) ?? [];
      arr.push(i);
      m.set(i.category, arr);
    });
    return [...m.entries()];
  }, [paperItems]);

  const paperProgress = useMemo(() => {
    const all = data.syllabus.filter((i) => i.paper === paper);
    // weight: each status step out of 5
    const done = all.reduce((s, i) => s + STATUS_META[i.status].step / 5, 0);
    return { pct: all.length ? (done / all.length) * 100 : 0, total: all.length };
  }, [data.syllabus, paper]);

  const revisionQueue = useMemo(() => {
    const today = todayISO();
    return data.syllabus.filter((i) => i.nextRevisionDue && i.nextRevisionDue <= today && i.status !== 'mastered');
  }, [data.syllabus]);

  const staleTopics = useMemo(() => data.syllabus.filter((i) => isStale(i.lastRevisedAt, i.status) && (i.priority === 'high' || i.priority === 'medium')).slice(0, 10), [data.syllabus]);

  const cycleStatus = async (item: SyllabusItem, dir: 1 | -1 = 1) => {
    const idx = STATUS_ORDER.indexOf(item.status);
    const next = STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, Math.max(0, idx + dir))];
    const today = todayISO();
    const patch: Partial<SyllabusItem> = { status: next };
    if (next === 'rev_1' || next === 'rev_2' || next === 'mastered') {
      const revNum = next === 'rev_1' ? 1 : next === 'rev_2' ? 2 : 3;
      patch.revisionCount = Math.max(item.revisionCount, revNum);
      patch.lastRevisedAt = today;
      patch.nextRevisionDue = next === 'mastered' ? undefined : nextRevisionDate(today, revNum);
    }
    if (next === 'not_started') {
      patch.revisionCount = 0;
      patch.lastRevisedAt = undefined;
      patch.nextRevisionDue = undefined;
    }
    await db.syllabusItems.put({ ...item, ...patch });
  };

  const revIncrement = async (item: SyllabusItem) => {
    const today = todayISO();
    const newCount = item.revisionCount + 1;
    const status: SyllabusStatus = newCount <= 0 ? 'first_reading' : newCount === 1 ? 'rev_1' : newCount === 2 ? 'rev_2' : 'mastered';
    await db.syllabusItems.put({
      ...item,
      status,
      revisionCount: newCount,
      lastRevisedAt: today,
      nextRevisionDue: status === 'mastered' ? undefined : nextRevisionDate(today, newCount)
    });
  };

  return (
    <div className="px-4 pt-safe">
      <header className="flex items-center justify-between pb-3 pt-4">
        <h1 className="text-xl font-extrabold text-ink">Syllabus & Revision</h1>
        <button className="btn-ghost px-3 py-2" onClick={() => setOptionalOpen(true)}>
          <Layers size={15} /> Optional
        </button>
      </header>

      {/* Mode switch */}
      <div className="mb-3 flex gap-2">
        <button onClick={() => setMode('checklist')} className={`chip flex-1 justify-center ${mode === 'checklist' ? 'chip-active' : ''}`}>
          📚 Micro-topic checklist
        </button>
          <button onClick={() => setMode('revision')} className={`chip flex-1 justify-center ${mode === 'revision' ? 'chip-active' : ''}`}>
            <RefreshCw size={14} />
            {revisionQueue.length > 0 ? ` Due (${revisionQueue.length})` : ' Revision queue'}
          </button>
      </div>

      {mode === 'checklist' && (
        <>
          {/* Paper chips */}
          <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto pb-1">
            {papers.map((p) => (
              <button key={p} onClick={() => setPaper(p)} className={`chip shrink-0 ${paper === p ? 'chip-active' : ''}`}>
                {PAPER_META[p]}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-inksoft">
                <span>{PAPER_META[paper]} completion</span>
                <span>
                  {paperProgress.total} topics · {Math.round(paperProgress.pct)}%
                </span>
              </div>
              <ProgressBar pct={paperProgress.pct} />
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft" />
            <input className="input pl-9" placeholder="Search micro-topics…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {/* Topic list */}
          {byCategory.length === 0 ? (
            <EmptyState
              emoji="🔍"
              text={hasOptional ? 'No topics match your search' : 'No optional topics loaded yet'}
              sub={hasOptional ? undefined : 'Tap "Optional" above to load a template (PSIR, Sociology…) or add custom topics.'}
            />
          ) : (
            byCategory.map(([category, items]) => <CategoryBlock key={category} category={category} items={items} onCycle={cycleStatus} />)
          )}

          <CustomTopicAdder paper={paper} />

          {/* Overall */}
          <SectionCard title="Overall progress" className="mb-6">
            {papers.map((p) => {
              const all = data.syllabus.filter((i) => i.paper === p);
              if (all.length === 0) return null;
              const done = (all.reduce((s, i) => s + STATUS_META[i.status].step / 5, 0) / all.length) * 100;
              return (
                <div key={p} className="mb-2.5 last:mb-0">
                  <div className="mb-1 flex justify-between text-[11px] font-semibold">
                    <span className="text-ink">{PAPER_META[p]}</span>
                    <span className="text-inksoft">{Math.round(done)}%</span>
                  </div>
                  <ProgressBar pct={done} />
                </div>
              );
            })}
          </SectionCard>
        </>
      )}

      {mode === 'revision' && (
        <>
          <SectionCard title={`Due for revision (${revisionQueue.length})`} icon={<RefreshCw size={14} />} className="mb-3">
            {revisionQueue.length === 0 ? (
              <EmptyState emoji="🌿" text="Nothing due right now" sub="Items appear here automatically per the spaced repetition schedule: Rev1 +3d · Rev2 +7d · Rev3 +21d · Rev4+ +60d." />
            ) : (
              <ul className="divide-y divide-line">
                {revisionQueue.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{i.microTopic}</p>
                      <p className="text-[11px] text-inksoft">
                        {PAPER_META[i.paper]} · {i.category} · Rev {i.revisionCount} done
                        {i.nextRevisionDue ? ` · due ${i.nextRevisionDue}` : ''}
                      </p>
                    </div>
                    <button className="btn-primary shrink-0 px-3 py-1.5 text-xs" onClick={() => void revIncrement(i)}>
                      Rev +1
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Stale topics (30+ days untouched)" icon={<AlertTriangle size={14} />} className="mb-6">
            {staleTopics.length === 0 ? (
              <EmptyState emoji="✨" text="No stale topics — great pacing!" />
            ) : (
              <ul className="space-y-2">
                {staleTopics.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{i.microTopic}</p>
                      <p className="text-[11px] text-inksoft">
                        {i.category} · last revised {i.lastRevisedAt}
                      </p>
                    </div>
                    <button className="btn-ghost shrink-0 px-2.5 py-1 text-xs" onClick={() => void revIncrement(i)}>
                      Revise
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}

      {/* Optional subject builder modal */}
      <OptionalBuilder open={optionalOpen} onClose={() => setOptionalOpen(false)} currentName={data.settings.optionalSubjectName} />
    </div>
  );
}

function CategoryBlock({ category, items, onCycle }: { category: string; items: SyllabusItem[]; onCycle: (i: SyllabusItem, dir?: 1 | -1) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="card mb-2 overflow-hidden">
      <button className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left" onClick={() => setOpen((o) => !o)}>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">{category}</p>
          <p className="text-[11px] text-inksoft">
            {items.filter((i) => i.status !== 'not_started').length}/{items.length} started ·{' '}
            {items.filter((i) => i.status === 'mastered').length} mastered
          </p>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-inksoft transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="divide-y divide-line border-t border-line">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-ink">{i.microTopic}</p>
                {i.priority === 'high' && <span className="text-[10px] font-bold text-[#C0503C]">● high yield</span>}
                {isStale(i.lastRevisedAt, i.status) && <span className="ml-1 text-[10px] font-bold text-[#D4A94E]">⚠ stale</span>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  className="rounded-md px-1.5 py-0.5 text-xs text-inksoft disabled:opacity-30"
                  aria-label="Previous status"
                  disabled={i.status === 'not_started'}
                  onClick={() => void onCycle(i, -1)}
                >
                  −
                </button>
                <button
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                  style={{ background: STATUS_META[i.status].color }}
                  onClick={() => void onCycle(i, 1)}
                >
                  {STATUS_META[i.status].label}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CustomTopicAdder({ paper }: { paper: Paper }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');

  const add = async () => {
    if (!topic.trim()) return;
    await addCustomTopic(paper, category.trim() || 'Custom Topics', topic.trim());
    setTopic('');
    setOpen(false);
  };

  return (
    <>
      <button className="btn-ghost mb-3 w-full" onClick={() => setOpen(true)}>
        <Plus size={15} /> Add custom micro-topic to {PAPER_META[paper]}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add custom micro-topic">
        <div className="space-y-3">
          <div>
            <p className="label">Category (optional)</p>
            <input className="input" placeholder="e.g. My Coaching Module 3" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <p className="label">Micro-topic</p>
            <input className="input" placeholder="e.g. Post-Mauryan art developments" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <button className="btn-primary w-full" onClick={() => void add()}>
            Add topic
          </button>
        </div>
      </Modal>
    </>
  );
}

function OptionalBuilder({ open, onClose, currentName }: { open: boolean; onClose: () => void; currentName: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customPaper, setCustomPaper] = useState<'OPTIONAL_P1' | 'OPTIONAL_P2'>('OPTIONAL_P1');
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');

  const load = async (key: string, name: string) => {
    setBusy(key);
    await loadOptionalTemplate(key, name);
    setBusy(null);
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Optional subject builder" wide>
        {currentName && (
          <p className="mb-3 rounded-lg bg-brandsoft/50 px-3 py-2 text-xs font-semibold text-ink">
            Current optional: {currentName}. Loading another template replaces optional topics (progress on other papers is untouched).
          </p>
        )}
        <ul className="space-y-2">
          {OPTIONAL_TEMPLATES.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{t.name}</p>
                <p className="text-[11px] text-inksoft">
                  {t.topics.length} micro-topics · {t.popularity}
                </p>
              </div>
              <button className="btn-primary shrink-0 px-3 py-1.5 text-xs" disabled={busy !== null} onClick={() => void load(t.key, t.name)}>
                {busy === t.key ? 'Loading…' : 'Load'}
              </button>
            </li>
          ))}
        </ul>
        <button className="btn-ghost mt-3 w-full" onClick={() => setCustomOpen(true)}>
          <BookMarked size={15} /> Add topics manually (any other optional)
        </button>
      </Modal>

      <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Add optional topic">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['OPTIONAL_P1', 'OPTIONAL_P2'] as const).map((p) => (
              <button key={p} onClick={() => setCustomPaper(p)} className={`chip flex-1 justify-center ${customPaper === p ? 'chip-active' : ''}`}>
                Paper {p === 'OPTIONAL_P1' ? '1' : '2'}
              </button>
            ))}
          </div>
          <div>
            <p className="label">Category</p>
            <input className="input" placeholder="e.g. Paper 2 — Polity" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <p className="label">Micro-topic</p>
            <input className="input" placeholder="e.g. Constitutional Amendments" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <button
            className="btn-primary w-full"
            onClick={async () => {
              if (!topic.trim() || !category.trim()) return;
              await addCustomTopic(customPaper, category.trim(), topic.trim());
              setTopic('');
              setCustomOpen(false);
            }}
          >
            Add topic
          </button>
        </div>
      </Modal>
    </>
  );
}
