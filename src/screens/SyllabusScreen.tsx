import { useMemo, useRef, useState } from 'react';
import { Search, RefreshCw, Plus, Layers, ChevronDown, AlertTriangle, BookMarked } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { db } from '../db';
import { addCustomTopic, loadOptionalTemplate } from '../db/seed';
import { SectionCard, Modal, ProgressBar, EmptyState, showToast } from '../components/common';
import { PAPER_META, PAPER_ORDER, STATUS_META, type Paper, type SyllabusItem, type SyllabusStatus } from '../types';
import { formatDateShort, todayISO } from '../utils/dates';
import {
  applySyllabusStatus,
  completeRevision,
  cycleSyllabusItem,
  isTopicStale,
  markMastered,
  nextRevisionLabel,
  nextStatusLabel,
  revisionBuckets
} from '../utils/revision';
import { OPTIONAL_TEMPLATES } from '../data/optionals';

export function SyllabusScreen({ data }: { data: AppData }) {
  const [mode, setMode] = useState<'checklist' | 'revision'>('checklist');
  const [paper, setPaper] = useState<Paper>('PRELIMS');
  const [query, setQuery] = useState('');
  const [optionalOpen, setOptionalOpen] = useState(false);

  const hasOptional = data.syllabus.some((i) => i.paper === 'OPTIONAL_P1' || i.paper === 'OPTIONAL_P2');
  const papers: Paper[] = PAPER_ORDER.filter((p) => (p === 'OPTIONAL_P1' || p === 'OPTIONAL_P2' ? hasOptional : true));

  const paperItems = useMemo(
    () => data.syllabus.filter((i) => i.paper === paper && (!query || (i.microTopic + ' ' + i.category).toLowerCase().includes(query.toLowerCase()))),
    [data.syllabus, paper, query]
  );

  const byCategory = useMemo(() => {
    const sorted = [...paperItems].sort(
      (a, b) => (a.sortOrder ?? 1e9) - (b.sortOrder ?? 1e9) || a.microTopic.localeCompare(b.microTopic)
    );
    const m = new Map<string, SyllabusItem[]>();
    sorted.forEach((i) => {
      const arr = m.get(i.category) ?? [];
      arr.push(i);
      m.set(i.category, arr);
    });
    return [...m.entries()];
  }, [paperItems]);

  const paperProgress = useMemo(() => {
    const all = data.syllabus.filter((i) => i.paper === paper);
    // weight: each status step out of 5
    const done = all.reduce((s, i) => s + STATUS_META[i.status].step / STATUS_META.mastered.step, 0);
    return { pct: all.length ? (done / all.length) * 100 : 0, total: all.length };
  }, [data.syllabus, paper]);

  const today = todayISO();
  const queue = useMemo(() => revisionBuckets(data.syllabus, today), [data.syllabus, today]);
  const dueNowCount = queue.overdue.length + queue.dueToday.length;

  const staleTopics = useMemo(
    () => data.syllabus.filter((i) => isTopicStale(i, today)),
    [data.syllabus, today]
  );

  const cycleStatus = async (item: SyllabusItem, dir: 1 | -1 = 1) => {
    await db.syllabusItems.put(cycleSyllabusItem(item, dir, todayISO()));
  };

  const finishRevision = async (item: SyllabusItem) => {
    const next = completeRevision(item, todayISO());
    await db.syllabusItems.put(next);
    if (next.nextRevisionDue) {
      showToast({ message: `${nextRevisionLabel(item.revisionCount)} done · next due ${formatDateShort(next.nextRevisionDue)}` });
    }
  };

  const setStatus = async (item: SyllabusItem, status: SyllabusStatus) => {
    await db.syllabusItems.put(applySyllabusStatus(item, status, todayISO()));
  };

  const masterTopic = async (item: SyllabusItem) => {
    const next = markMastered(item);
    if (!next) return;
    await db.syllabusItems.put(next);
    showToast({ message: `${item.microTopic} mastered — out of the queue` });
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
            {dueNowCount > 0 ? ` Due (${dueNowCount})` : ' Revision queue'}
          </button>
      </div>

      {mode === 'checklist' && (
        <>
          {/* Paper chips */}
          <div className="relative mb-2">
            <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
              {papers.map((p) => (
                <button key={p} onClick={() => setPaper(p)} className={`chip shrink-0 snap-start whitespace-nowrap ${paper === p ? 'chip-active' : ''}`}>
                  {PAPER_META[p]}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-paper to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-paper to-transparent" />
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
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-inksoft" />
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
            byCategory.map(([category, items]) => (
              <CategoryBlock key={category} category={category} items={items} onCycle={cycleStatus} onSetStatus={setStatus} />
            ))
          )}

          <CustomTopicAdder paper={paper} />

          {/* Overall */}
          <SectionCard title="Overall progress" className="mb-6">
            {papers.map((p) => {
              const all = data.syllabus.filter((i) => i.paper === p);
              if (all.length === 0) return null;
              const done = (all.reduce((s, i) => s + STATUS_META[i.status].step / STATUS_META.mastered.step, 0) / all.length) * 100;
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
          <p className="mb-3 rounded-xl bg-surface2 px-3 py-2 text-xs leading-relaxed text-ink">
            {dueNowCount === 0
              ? queue.nextUpcoming
                ? `Nothing due right now. Next up: ${nextRevisionLabel(queue.nextUpcoming.revisionCount)} of ${queue.nextUpcoming.microTopic}, ${formatDateShort(queue.nextUpcoming.nextRevisionDue!)}.`
                : 'Nothing scheduled yet. Mark a first reading and it is due 3 days later.'
              : `${queue.overdue.length} overdue · ${queue.dueToday.length} due today.`}
          </p>

          <QueueSection title={`Overdue (${queue.overdue.length})`} items={queue.overdue} empty="None overdue." onDone={finishRevision} onMaster={masterTopic} />
          <QueueSection title={`Due today (${queue.dueToday.length})`} items={queue.dueToday} empty="Nothing due today." onDone={finishRevision} onMaster={masterTopic} />
          <QueueSection
            title={`Next 7 days (${queue.next7.length})`}
            items={queue.next7}
            empty="Nothing due in the next 7 days."
            onDone={finishRevision}
            onMaster={masterTopic}
          />

          <SectionCard title={`Stale (${staleTopics.length})`} icon={<AlertTriangle size={14} />} className="mb-6">
            <p className="mb-2 text-[11px] text-inksoft">Past their due date, or read more than 14 days ago with no revision yet.</p>
            {staleTopics.length === 0 ? (
              <EmptyState emoji="✨" text="No stale topics" sub="Read topics land here once a due date passes, or after 14 days with zero revisions." />
            ) : (
              <ul className="space-y-2">
                {staleTopics.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{i.microTopic}</p>
                      <p className="text-[11px] text-inksoft">
                        {i.category}
                        {i.nextRevisionDue ? ` · due ${formatDateShort(i.nextRevisionDue)}` : ''}
                        {i.revisionCount === 0 ? ' · no revision yet' : ` · ${i.revisionCount} done`}
                      </p>
                    </div>
                    <button className="btn-ghost shrink-0 px-2.5 py-1 text-xs" onClick={() => void finishRevision(i)}>
                      {nextRevisionLabel(i.revisionCount)} done
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

function QueueSection({
  title,
  items,
  empty,
  onDone,
  onMaster
}: {
  title: string;
  items: SyllabusItem[];
  empty: string;
  onDone: (i: SyllabusItem) => Promise<void>;
  onMaster: (i: SyllabusItem) => Promise<void>;
}) {
  return (
    <SectionCard title={title} icon={<RefreshCw size={14} />} className="mb-3">
      {items.length === 0 ? (
        <p className="py-1 text-xs text-inksoft">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-ink">{i.microTopic}</p>
                <p className="text-[11px] text-inksoft">
                  {PAPER_META[i.paper]} · {nextRevisionLabel(i.revisionCount)} · due {i.nextRevisionDue ? formatDateShort(i.nextRevisionDue) : '—'}
                </p>
              </div>
              <button className="btn-primary shrink-0 px-2.5 py-1.5 text-xs" onClick={() => void onDone(i)}>
                {nextRevisionLabel(i.revisionCount)} done
              </button>
              {i.revisionCount >= 1 && (
                <button className="btn-ghost shrink-0 px-2 py-1.5 text-xs" onClick={() => void onMaster(i)}>
                  Master
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

const STATUS_CHOICES: SyllabusStatus[] = ['not_started', 'first_reading', 'notes_done', 'rev_1', 'rev_2', 'rev_3', 'rev_4', 'mastered'];

function CategoryBlock({
  category,
  items,
  onCycle,
  onSetStatus
}: {
  category: string;
  items: SyllabusItem[];
  onCycle: (i: SyllabusItem, dir?: 1 | -1) => Promise<void>;
  onSetStatus: (i: SyllabusItem, status: SyllabusStatus) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const skipClick = useRef(false);
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
                {isTopicStale(i, todayISO()) && <span className="ml-1 text-[10px] font-bold text-[#D4A94E]">⚠ stale</span>}
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-1">
                <button
                  className="min-h-11 min-w-[8.5rem] rounded-xl px-2.5 py-1 text-left"
                  style={{ background: '#F4EFE6', color: '#2C2416', border: `2px solid ${STATUS_META[i.status].color}` }}
                  onClick={() => {
                    if (skipClick.current) {
                      skipClick.current = false;
                      return;
                    }
                    if (menuId === i.id) setMenuId(null);
                    else void onCycle(i, 1);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuId(menuId === i.id ? null : i.id);
                  }}
                  onPointerDown={() => {
                    const timer = window.setTimeout(() => {
                      skipClick.current = true;
                      setMenuId(i.id);
                    }, 450);
                    const up = () => window.clearTimeout(timer);
                    window.addEventListener('pointerup', up, { once: true });
                    window.addEventListener('pointercancel', up, { once: true });
                  }}
                >
                  <span className="block text-xs font-bold leading-tight">{STATUS_META[i.status].label}</span>
                  <span className="block text-xs font-semibold leading-tight" style={{ color: '#5C5346' }}>
                    Next: {nextStatusLabel(i.status)}
                  </span>
                </button>
                {menuId === i.id && (
                  <div className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-1">
                    {STATUS_CHOICES.map((status) => (
                      <button
                        key={status}
                        disabled={status === 'mastered' && i.revisionCount < 1}
                        className="min-h-11 rounded-lg px-2 text-left text-xs font-semibold text-ink disabled:opacity-40"
                        onClick={() => {
                          setMenuId(null);
                          void onSetStatus(i, status);
                        }}
                      >
                        {STATUS_META[status].label}
                      </button>
                    ))}
                  </div>
                )}
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
