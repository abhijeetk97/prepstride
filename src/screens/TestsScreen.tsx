import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus, Trash2, TrendingUp, Search } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { db } from '../db';
import { SectionCard, Modal, EmptyState } from '../components/common';
import { MISTAKE_META, type MistakeCategory, type MistakeLog, type MockTestRecord } from '../types';
import {
  attemptRate,
  accuracyRate,
  buildCsatRecord,
  buildMainsRecord,
  buildPrelimsRecord,
  csatQualified,
  csatScore,
  formatPercent,
  formatPrelimsScore,
  prelimsInputError,
  prelimsScore
} from '../utils/scores';
import { isReviewDue, markReviewed, reviewDueAfter } from '../utils/mistakes';
import { subscribeCsatLog } from '../utils/csatLog';
import { formatDateShort, todayISO } from '../utils/dates';

type Tab = 'prelims' | 'mains' | 'csat' | 'mistakes';
type PaperKind = 'PRELIMS' | 'CSAT';

export function TestsScreen({ data }: { data: AppData }) {
  const [tab, setTab] = useState<Tab>('prelims');
  const [prelimsOpen, setPrelimsOpen] = useState(false);
  const [mainsOpen, setMainsOpen] = useState(false);
  const [csatOpen, setCsatOpen] = useState(false);
  const [mistakeOpen, setMistakeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mistakeFilter, setMistakeFilter] = useState<MistakeCategory | 'all'>('all');
  const [mockFilter, setMockFilter] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const today = todayISO();

  const prelimsMocks = data.mocks.filter((m) => m.examType === 'PRELIMS');
  const mainsMocks = data.mocks.filter((m) => m.examType === 'MAINS');
  const csatMocks = data.mocks.filter((m) => m.examType === 'CSAT');
  const paperMocks = data.mocks.filter((m) => m.examType === 'PRELIMS' || m.examType === 'CSAT');
  const dueMistakes = data.mistakes.filter((m) => isReviewDue(m, today));

  useEffect(() => subscribeCsatLog(() => {
    setTab('csat');
    setCsatOpen(true);
  }), []);

  const mistakes = useMemo(() => {
    const q = query.toLowerCase();
    return data.mistakes.filter(
      (m) =>
        (mistakeFilter === 'all' || m.category === mistakeFilter) &&
        (mockFilter == null || m.mockTestId === mockFilter) &&
        (!q || (m.questionSummary + ' ' + m.correctConcept + ' ' + m.subject).toLowerCase().includes(q))
    );
  }, [data.mistakes, query, mistakeFilter, mockFilter]);

  const readMistakesFirst = () => {
    setPrelimsOpen(false);
    setMainsOpen(false);
    setCsatOpen(false);
    setTab('mistakes');
    setReviewOpen(true);
  };

  const addLabel = tab === 'prelims' ? 'Mock' : tab === 'mains' ? 'Test' : tab === 'csat' ? 'CSAT' : 'Mistake';

  return (
    <div className="px-4 pt-safe">
      <header className="flex items-center justify-between pb-3 pt-4">
        <h1 className="text-xl font-extrabold text-ink">Tests & Mistake Diary</h1>
        <button
          className="btn-primary px-3 py-2"
          onClick={() => (tab === 'prelims' ? setPrelimsOpen(true) : tab === 'mains' ? setMainsOpen(true) : tab === 'csat' ? setCsatOpen(true) : setMistakeOpen(true))}
        >
          <Plus size={16} /> {addLabel}
        </button>
      </header>

      {dueMistakes.length > 0 && (
        <div className="mb-3 rounded-xl border border-brand/40 bg-brandsoft/40 p-3">
          <button className="min-h-11 w-full text-left" onClick={() => setReviewOpen((open) => !open)}>
            <p className="text-sm font-bold text-ink">
              {dueMistakes.length} mistake{dueMistakes.length === 1 ? '' : 's'} due for review
            </p>
            <p className="text-[11px] text-inksoft">{reviewOpen ? 'Hide the list' : 'Tap to mark them reviewed'}</p>
          </button>
          {reviewOpen && (
            <ul className="mt-2 space-y-2">
              {dueMistakes.map((mistake) => (
                <li key={mistake.id} className="rounded-lg bg-surface px-3 py-2">
                  <p className="text-sm font-semibold text-ink">{mistake.questionSummary}</p>
                  <p className="text-[11px] text-inksoft">
                    Reviewed ×{mistake.reviewCount ?? 0}
                    {mistake.reviewDue ? ` · due ${formatDateShort(mistake.reviewDue)}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="btn-primary px-3 py-2 text-xs" onClick={() => void db.mistakeLogs.put(markReviewed(mistake, today))}>
                      Mark reviewed
                    </button>
                    {(mistake.reviewCount ?? 0) >= 2 && (
                      <button
                        className="btn-ghost px-3 py-2 text-xs"
                        onClick={() => void db.mistakeLogs.put({ ...mistake, reviewRetired: true })}
                      >
                        Done with this mistake
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="no-scrollbar mb-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
        {(
          [
            ['prelims', `🎯 Prelims (${prelimsMocks.length})`],
            ['csat', `📐 CSAT (${csatMocks.length})`],
            ['mains', `📝 Mains (${mainsMocks.length})`],
            ['mistakes', `🧩 Mistakes (${data.mistakes.length})`]
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`chip shrink-0 snap-start ${tab === t ? 'chip-active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'prelims' && <PrelimsPanel mocks={prelimsMocks} />}
      {tab === 'csat' && <CsatPanel mocks={csatMocks} />}
      {tab === 'mains' && <MainsPanel mocks={mainsMocks} />}
      {tab === 'mistakes' && (
        <>
          <div className="relative mb-2">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-inksoft" />
            <input className="input pl-9" placeholder="Search mistakes & takeaways…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setMistakeFilter('all')} className={`chip shrink-0 ${mistakeFilter === 'all' ? 'chip-active' : ''}`}>
              All
            </button>
            {(Object.keys(MISTAKE_META) as MistakeCategory[]).map((c) => (
              <button key={c} onClick={() => setMistakeFilter(c)} className={`chip shrink-0 ${mistakeFilter === c ? 'chip-active' : ''}`}>
                {MISTAKE_META[c].emoji} {MISTAKE_META[c].label.split(' /')[0]}
              </button>
            ))}
            {mockFilter != null && (
              <button onClick={() => setMockFilter(null)} className="chip chip-active shrink-0">
                {paperMocks.find((m) => m.id === mockFilter)?.testName ?? 'This mock'} ×
              </button>
            )}
          </div>
          {mistakes.length === 0 ? (
            <EmptyState emoji="🧠" text="No mistakes logged" sub="Every logged error is one fewer surprise on exam day." />
          ) : (
            <ul className="space-y-2">
              {mistakes.map((m) => {
                const linked = paperMocks.find((mock) => mock.id === m.mockTestId);
                return (
                  <li key={m.id} className="card p-3">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: MISTAKE_META[m.category].color }}>
                        {MISTAKE_META[m.category].emoji} {MISTAKE_META[m.category].label}
                      </span>
                      <button
                        className="hit text-inksoft hover:text-[#C0503C]"
                        aria-label="Delete mistake"
                        onClick={() => m.id && confirm('Delete this entry?') && void db.mistakeLogs.delete(m.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-ink">{m.questionSummary}</p>
                    {m.correctConcept && (
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-inksoft">
                        <span className="font-bold">Takeaway:</span> {m.correctConcept}
                      </p>
                    )}
                    {linked && (
                      <button className="chip mt-2" onClick={() => setMockFilter(linked.id ?? null)}>
                        {linked.testName} · {formatDateShort(linked.date)}
                      </button>
                    )}
                    <p className="mt-1 text-[10px] text-inksoft">
                      {m.subject} · {formatDateShort(m.date)}
                      {m.reviewRetired ? ' · done reviewing' : m.reviewDue ? ` · review ${formatDateShort(m.reviewDue)}` : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <div className="h-6" />

      <PaperMockModal
        open={prelimsOpen}
        onClose={() => setPrelimsOpen(false)}
        kind="PRELIMS"
        dueCount={dueMistakes.length}
        onReadMistakes={readMistakesFirst}
      />
      <PaperMockModal
        open={csatOpen}
        onClose={() => setCsatOpen(false)}
        kind="CSAT"
        dueCount={dueMistakes.length}
        onReadMistakes={readMistakesFirst}
      />
      <MainsMockModal open={mainsOpen} onClose={() => setMainsOpen(false)} dueCount={dueMistakes.length} onReadMistakes={readMistakesFirst} />
      <MistakeModal open={mistakeOpen} onClose={() => setMistakeOpen(false)} mocks={paperMocks} />
    </div>
  );
}

function latestByDate(mocks: MockTestRecord[]): MockTestRecord {
  return mocks.slice().sort((a, b) => a.date.localeCompare(b.date) || (a.id ?? 0) - (b.id ?? 0))[mocks.length - 1];
}

function ScoreTrend({ mocks, target, caption }: { mocks: MockTestRecord[]; target: number; caption: string }) {
  const points = mocks.slice().sort((a, b) => a.date.localeCompare(b.date) || (a.id ?? 0) - (b.id ?? 0));
  if (points.length < 2) return null;
  const maxScore = Math.max(target, ...points.map((p) => p.calculatedScore), 1);
  const w = 320;
  const h = 110;
  const pad = 6;
  const x = (i: number) => pad + (i / (points.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - (Math.max(0, v) / maxScore) * (h - 2 * pad);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.calculatedScore).toFixed(1)}`).join(' ');
  const targetY = y(target);
  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <line x1={pad} y1={targetY} x2={w - pad} y2={targetY} stroke="rgb(var(--c-brand))" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
        <path d={path} fill="none" stroke="rgb(var(--c-accent))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={p.id} cx={x(i)} cy={y(p.calculatedScore)} r="3.2" fill="rgb(var(--c-accent))" />
        ))}
      </svg>
      <p className="text-center text-[10px] text-inksoft">{caption}</p>
    </div>
  );
}

function DueNudge({ count, onRead }: { count: number; onRead: () => void }) {
  if (count < 1) return null;
  return (
    <div className="rounded-xl bg-brandsoft/50 p-3">
      <p className="text-sm font-semibold text-ink">
        {count} mistake{count === 1 ? '' : 's'} {count === 1 ? 'is' : 'are'} due for review — read them first?
      </p>
      <button className="btn-ghost mt-2 w-full" onClick={onRead}>
        Show due mistakes
      </button>
    </div>
  );
}

function PrelimsPanel({ mocks }: { mocks: MockTestRecord[] }) {
  const avgAccuracy = mocks.length ? Math.round(mocks.reduce((s, m) => s + m.accuracyRate, 0) / mocks.length) : 0;
  const lastScore = mocks[0]?.calculatedScore;
  return (
    <>
      <SectionCard title="Prelims mock analytics" icon={<TrendingUp size={14} />} className="mb-3">
        {mocks.length === 0 ? (
          <EmptyState emoji="🎯" text="No Prelims mocks yet" sub="Net score is correct × 2, minus ⅔ per incorrect (exact ⅓ of the 2 marks). Wrong answers are counted as attempted − correct." />
        ) : (
          <>
            <div className="mb-1 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-surface2 px-2 py-2">
                <p className="text-lg font-extrabold tabular-nums text-ink">{formatPrelimsScore(lastScore ?? 0)}</p>
                <p className="text-[10px] font-semibold uppercase text-inksoft">Last score</p>
              </div>
              <div className="rounded-xl bg-surface2 px-2 py-2">
                <p className="text-lg font-extrabold text-ink">{mocks.length}</p>
                <p className="text-[10px] font-semibold uppercase text-inksoft">Tests</p>
              </div>
              <div className="rounded-xl bg-surface2 px-2 py-2">
                <p className="text-lg font-extrabold text-ink">{formatPercent(mocks[0].accuracyRate)}</p>
                <p className="text-[10px] font-semibold uppercase text-inksoft">Accuracy</p>
              </div>
              <div className="rounded-xl bg-surface2 px-2 py-2">
                <p className="text-lg font-extrabold text-ink">{formatPercent(attemptRate(mocks[0].attempted, mocks[0].totalQuestions))}</p>
                <p className="text-[10px] font-semibold uppercase text-inksoft">Attempt rate</p>
              </div>
            </div>
            <p className="mb-1 text-center text-[10px] text-inksoft">Latest paper · average accuracy {avgAccuracy}%</p>
            <ScoreTrend mocks={mocks} target={100} caption={`Score trend · dashed line = 100-mark target · latest: ${formatPrelimsScore(latestByDate(mocks).calculatedScore)}`} />
          </>
        )}
      </SectionCard>

      {mocks.length > 0 && <HistoryList mocks={mocks} />}
    </>
  );
}

function CsatPanel({ mocks }: { mocks: MockTestRecord[] }) {
  const latest = mocks[0];
  return (
    <>
      <SectionCard title="CSAT Paper II" icon={<TrendingUp size={14} />} className="mb-3">
        {mocks.length === 0 ? (
          <EmptyState emoji="📐" text="No CSAT sets yet" sub="80 questions, +2.5 for a correct answer and −2.5/3 for a wrong one. 66.67 qualifies." />
        ) : (
          <>
            <div className="mb-1 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-surface2 px-2 py-2">
                <p className="text-lg font-extrabold tabular-nums text-ink">{formatPrelimsScore(latest.calculatedScore)}</p>
                <p className="text-[10px] font-semibold uppercase text-inksoft">Last net</p>
              </div>
              <div className="rounded-xl bg-surface2 px-2 py-2">
                <p className={`text-lg font-extrabold ${csatQualified(latest.calculatedScore) ? 'text-brand' : 'text-[#C0503C]'}`}>
                  {csatQualified(latest.calculatedScore) ? 'Qualified' : 'Not qualified'}
                </p>
                <p className="text-[10px] font-semibold uppercase text-inksoft">66.67 line</p>
              </div>
            </div>
            <ScoreTrend
              mocks={mocks}
              target={66.67}
              caption={`CSAT trend · dashed line = 66.67 qualifying · latest: ${formatPrelimsScore(latestByDate(mocks).calculatedScore)}`}
            />
          </>
        )}
      </SectionCard>
      {mocks.length > 0 && <HistoryList mocks={mocks} csat />}
    </>
  );
}

function HistoryList({ mocks, csat = false }: { mocks: MockTestRecord[]; csat?: boolean }) {
  return (
    <SectionCard title="History" icon={<ClipboardList size={14} />}>
      <ul className="divide-y divide-line">
        {mocks.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{m.testName}</p>
              <p className="text-[11px] text-inksoft">
                {formatDateShort(m.date)} · {m.subject} · {m.attempted}/{m.totalQuestions} attempted · {m.correct} ✓ {m.incorrect} ✗
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold tabular-nums text-ink">{formatPrelimsScore(m.calculatedScore)}</p>
              <p className="text-[10px] font-semibold text-inksoft">
                {csat
                  ? csatQualified(m.calculatedScore)
                    ? 'Qualified'
                    : 'Not qualified'
                  : `${formatPercent(m.accuracyRate)} acc · ${formatPercent(attemptRate(m.attempted, m.totalQuestions))} attempted`}
              </p>
            </div>
            <button
              className="hit text-inksoft hover:text-[#C0503C]"
              aria-label="Delete mock"
              onClick={() => m.id && confirm('Delete this mock record?') && void db.mockTests.delete(m.id)}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function MainsPanel({ mocks }: { mocks: MockTestRecord[] }) {
  return (
    <SectionCard title="Mains test series" icon={<ClipboardList size={14} />}>
      {mocks.length === 0 ? (
        <EmptyState emoji="📝" text="No Mains tests yet" sub="Record paper, marks obtained and mentor feedback tags to track improvement." />
      ) : (
        <ul className="divide-y divide-line">
          {mocks.map((m) => (
            <li key={m.id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{m.testName}</p>
                  <p className="text-[11px] text-inksoft">
                    {formatDateShort(m.date)} · {m.subject}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-right text-sm font-extrabold tabular-nums text-ink">
                    {m.subject === 'Answer writing' ? m.feedbackTags : `${m.marksObtained}/${m.totalMarks}`}
                  </p>
                  <button
                    className="hit text-inksoft hover:text-[#C0503C]"
                    aria-label="Delete test"
                    onClick={() => m.id && confirm('Delete this test record?') && void db.mockTests.delete(m.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {m.subject !== 'Answer writing' && m.feedbackTags && <p className="mt-1 text-xs text-inksoft">🏷️ {m.feedbackTags}</p>}
              {m.notes && <p className="mt-1 text-xs text-inksoft">{m.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function PaperMockModal({
  open,
  onClose,
  kind,
  dueCount,
  onReadMistakes
}: {
  open: boolean;
  onClose: () => void;
  kind: PaperKind;
  dueCount: number;
  onReadMistakes: () => void;
}) {
  const csat = kind === 'CSAT';
  const [form, setForm] = useState({
    testName: '',
    subject: csat ? 'CSAT' : 'Full Length',
    totalQuestions: csat ? 80 : 100,
    attempted: csat ? 80 : 100,
    correct: csat ? 40 : 60,
    date: todayISO()
  });
  const incorrect = form.attempted - form.correct;
  const inputError = prelimsInputError(form.totalQuestions, form.attempted, form.correct);
  const score = inputError ? null : csat ? csatScore(form.correct, incorrect) : prelimsScore(form.correct, incorrect);
  const accuracy = accuracyRate(form.correct, form.attempted);
  const attemptedPct = attemptRate(form.attempted, form.totalQuestions);

  const save = async () => {
    if (!form.testName.trim() || inputError) return;
    const input = {
      date: form.date,
      testName: form.testName.trim(),
      subject: form.subject,
      totalQuestions: form.totalQuestions,
      attempted: form.attempted,
      correct: form.correct
    };
    await db.mockTests.add(csat ? buildCsatRecord(input) : buildPrelimsRecord(input));
    onClose();
    setForm({ ...form, testName: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title={csat ? 'Log CSAT (Paper II)' : 'Log Prelims mock'}>
      <div className="space-y-3">
        <DueNudge count={dueCount} onRead={onReadMistakes} />
        <div>
          <p className="label">Test name</p>
          <input
            className="input"
            placeholder={csat ? 'e.g. CSAT sectional 3' : 'e.g. Vision IAS FLT 5'}
            value={form.testName}
            onChange={(e) => setForm({ ...form, testName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Subject</p>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <p className="label">Date</p>
            <input type="date" className="input" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="label">Total Qs</p>
            <input type="number" className="input" value={form.totalQuestions} onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })} />
          </div>
          <div>
            <p className="label">Attempted</p>
            <input type="number" className="input" value={form.attempted} onChange={(e) => setForm({ ...form, attempted: Number(e.target.value) })} />
          </div>
          <div>
            <p className="label">Correct</p>
            <input type="number" className="input" value={form.correct} onChange={(e) => setForm({ ...form, correct: Number(e.target.value) })} />
          </div>
        </div>
        <div className="rounded-xl bg-surface2 p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums text-ink">{score == null ? '—' : formatPrelimsScore(score)}</p>
          <p className="text-[11px] text-inksoft">
            {inputError
              ? inputError
              : csat
                ? `${csatQualified(score ?? 0) ? 'Qualified' : 'Not qualified'} · ${incorrect} wrong · accuracy ${formatPercent(accuracy)} · attempt rate ${formatPercent(attemptedPct)}`
                : `Score · ${incorrect} wrong (attempted − correct) · accuracy ${formatPercent(accuracy)} · attempt rate ${formatPercent(attemptedPct)}`}
          </p>
          <p className="mt-1 text-[10px] text-inksoft">
            {csat ? '+2.5 per correct, −2.5/3 per wrong. 66.67 qualifies.' : '−⅔ per incorrect, exact ⅓ of the 2 marks.'}
          </p>
        </div>
        <button className="btn-primary w-full" disabled={!!inputError || !form.testName.trim()} onClick={() => void save()}>
          {csat ? 'Save CSAT set' : 'Save mock (+100 XP)'}
        </button>
      </div>
    </Modal>
  );
}

function MainsMockModal({
  open,
  onClose,
  dueCount,
  onReadMistakes
}: {
  open: boolean;
  onClose: () => void;
  dueCount: number;
  onReadMistakes: () => void;
}) {
  const [form, setForm] = useState({ testName: '', subject: 'GS1', totalMarks: 250, marksObtained: 100, feedbackTags: '', date: todayISO() });

  const save = async () => {
    if (!form.testName.trim()) return;
    await db.mockTests.add(
      buildMainsRecord({
        date: form.date,
        testName: form.testName.trim(),
        subject: form.subject,
        totalMarks: form.totalMarks,
        marksObtained: form.marksObtained,
        feedbackTags: form.feedbackTags.trim() || undefined
      })
    );
    onClose();
    setForm({ ...form, testName: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Mains test">
      <div className="space-y-3">
        <DueNudge count={dueCount} onRead={onReadMistakes} />
        <div>
          <p className="label">Test name</p>
          <input className="input" placeholder="e.g. Forum GS2 Sectional 3" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Paper</p>
            <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {['GS1', 'GS2', 'GS3', 'GS4', 'Essay', 'Optional P1', 'Optional P2'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="label">Date</p>
            <input type="date" className="input" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Total marks</p>
            <input type="number" className="input" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} />
          </div>
          <div>
            <p className="label">Marks obtained</p>
            <input type="number" className="input" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <p className="label">Mentor feedback tags (optional)</p>
          <input className="input" placeholder="e.g. intro weak, good structure, more examples" value={form.feedbackTags} onChange={(e) => setForm({ ...form, feedbackTags: e.target.value })} />
        </div>
        <button className="btn-primary w-full" onClick={() => void save()}>
          Save test
        </button>
      </div>
    </Modal>
  );
}

function MistakeModal({ open, onClose, mocks }: { open: boolean; onClose: () => void; mocks: MockTestRecord[] }) {
  const [form, setForm] = useState<{
    subject: string;
    questionSummary: string;
    category: MistakeCategory;
    correctConcept: string;
    mockTestId: number | undefined;
    date: string;
  }>({ subject: 'Polity', questionSummary: '', category: 'silly_error', correctConcept: '', mockTestId: undefined, date: todayISO() });

  const save = async () => {
    if (!form.questionSummary.trim()) return;
    const entry: MistakeLog = {
      mockTestId: form.mockTestId,
      date: form.date,
      subject: form.subject,
      questionSummary: form.questionSummary.trim(),
      category: form.category,
      correctConcept: form.correctConcept.trim(),
      reviewDue: reviewDueAfter(form.date || todayISO()),
      reviewCount: 0,
      createdAt: Date.now()
    };
    await db.mistakeLogs.add(entry);
    setForm({ ...form, questionSummary: '', correctConcept: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Log a mistake">
      <div className="space-y-3">
        <div>
          <p className="label">Category</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MISTAKE_META) as MistakeCategory[]).map((c) => (
              <button key={c} onClick={() => setForm({ ...form, category: c })} className={`chip ${form.category === c ? 'chip-active' : ''}`}>
                {MISTAKE_META[c].emoji} {MISTAKE_META[c].label.split(' /')[0]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Question summary</p>
          <textarea className="input min-h-[60px] resize-none" placeholder="e.g. Q42 — Governor's discretionary powers" value={form.questionSummary} onChange={(e) => setForm({ ...form, questionSummary: e.target.value })} />
        </div>
        <div>
          <p className="label">Key takeaway / correct concept</p>
          <textarea
            className="input min-h-[5.5rem] resize-none"
            rows={4}
            placeholder={'What to remember next time.\nOne idea per line is fine.'}
            value={form.correctConcept}
            onChange={(e) => setForm({ ...form, correctConcept: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Subject</p>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <p className="label">Date</p>
            <input type="date" className="input" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        {mocks.length > 0 && (
          <div>
            <p className="label">Link to mock (optional)</p>
            <select className="input" value={form.mockTestId ?? ''} onChange={(e) => setForm({ ...form, mockTestId: e.target.value ? Number(e.target.value) : undefined })}>
              <option value="">— none —</option>
              {mocks.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.testName}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="btn-primary w-full" onClick={() => void save()}>
          Save mistake
        </button>
      </div>
    </Modal>
  );
}
