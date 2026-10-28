import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, CornerDownRight, ListChecks, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import type { Route } from '../App';
import type { PlanActivity, PlanPaper, SyllabusItem, WeeklyTarget } from '../types';
import { STATUS_META } from '../types';
import { db } from '../db';
import { carryTargets, saveTargets } from '../db/planner';
import { Modal, ProgressBar, showToast } from '../components/common';
import { addDays, formatDateShort, formatMinutes, fromISODate, todayISO, weekStartISO } from '../utils/dates';
import { ACTIVITY_META, carryCandidates, PLAN_PAPERS, validTarget, weekDates, weeklySummary } from '../utils/planner';
import { TimerStartModal } from '../components/timer/TimerStartModal';
import { useTimer } from '../hooks/useTimer';

const dayLabel = (date: string) => fromISODate(date).toLocaleDateString('en-IN', { weekday: 'short' });
const fullDayLabel = (date: string) => `${dayLabel(date)}, ${formatDateShort(date)}`;
const weekLabel = (week: string) => `${formatDateShort(week)} – ${formatDateShort(addDays(week, 6))}, ${fromISODate(addDays(week, 6)).getFullYear()}`;

export function WeeklyPlannerCard({ data, navigate }: { data: AppData; navigate: (route: Route) => void }) {
  const summary = weeklySummary(weekStartISO(), data.weeklyTargets, data.timeLogs);
  const todayCount = summary.items.filter((target) => !target.completed && target.scheduledDate === todayISO()).length;
  return (
    <button className="card my-3 flex w-full items-center gap-3 p-4 text-left" onClick={() => navigate('planner')}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brandsoft text-ink"><CalendarDays size={22} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">Your weekly plan</span>
        <span className="mt-0.5 block text-xs text-inksoft">{summary.items.length ? `${summary.completed}/${summary.items.length} targets done${todayCount ? ` · ${todayCount} for today` : ''}` : 'Give this week a direction. Pick your topics.'}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-inksoft" />
    </button>
  );
}

export function PlannerScreen({ data, navigate }: { data: AppData; navigate: (route: Route) => void }) {
  const today = todayISO();
  const currentWeek = weekStartISO(today);
  const [week, setWeek] = useState(currentWeek);
  const [day, setDay] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<WeeklyTarget | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [carryOpen, setCarryOpen] = useState(false);
  const [timerTarget, setTimerTarget] = useState<WeeklyTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useTimer();
  const dates = weekDates(week);
  const summary = weeklySummary(week, data.weeklyTargets, data.timeLogs);
  const budget = data.weeklyPlans.find((plan) => plan.weekStart === week)?.targetMinutes;
  const candidates = carryCandidates(week, data.weeklyTargets);
  const completedPct = summary.items.length ? summary.completed / summary.items.length * 100 : 0;
  const visible = summary.items.filter((target) => day === 'all' || (day === 'any' ? !target.scheduledDate : target.scheduledDate === day));
  const groups = [...dates, 'any'].map((date) => ({
    date, items: visible.filter((target) => date === 'any' ? !target.scheduledDate : target.scheduledDate === date)
      .slice().sort((a, b) => Number(a.completed) - Number(b.completed) || a.createdAt - b.createdAt)
  })).filter((group) => group.items.length > 0);

  async function run(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    try { await action(); }
    catch { showToast({ message: 'Could not save your plan. Please try again.' }); }
    finally { setBusy(false); }
  }

  function changeWeek(next: string) { setWeek(next); setDay('all'); }

  return (
    <div className="planner px-4 pt-safe">
      <header className="flex items-center gap-2 pb-4 pt-3">
        <button className="hit -ml-2 shrink-0 rounded-xl text-inksoft" aria-label="Back to Home" onClick={() => navigate('home')}><ArrowLeft size={20} /></button>
        <div className="min-w-0 flex-1"><h1 className="text-2xl font-extrabold tracking-tight text-ink">Weekly planner</h1><p className="mt-1 text-xs text-inksoft">A steady week, one topic at a time.</p></div>
        <CalendarDays size={22} className="shrink-0 text-inksoft" />
      </header>

      <section className="card overflow-hidden" aria-label="Week overview">
        <div className="flex items-center justify-between gap-1 border-b border-line p-2">
          <button className="hit rounded-xl hover:bg-surface2" aria-label="Previous week" onClick={() => changeWeek(addDays(week, -7))}><ArrowLeft size={18} /></button>
          <div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-inksoft">{week === currentWeek ? 'This week' : week < currentWeek ? 'Past week' : 'Upcoming week'}</p><h2 className="mt-1 text-sm font-bold text-ink">{weekLabel(week)}</h2></div>
          <button className="hit rounded-xl hover:bg-surface2" aria-label="Next week" onClick={() => changeWeek(addDays(week, 7))}><ArrowRight size={18} /></button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div><p className="text-xs font-semibold text-inksoft">Weekly study goal</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{budget ? formatMinutes(budget) : 'Set your pace'}</p></div>
            <button className="btn-ghost px-3 text-xs" onClick={() => setBudgetOpen(true)}><Pencil size={13} /> {budget ? 'Edit goal' : 'Set goal'}</button>
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-line">
            <PlanStat label="Planned" value={formatMinutes(summary.plannedMinutes)} />
            <PlanStat label="Study logged" value={formatMinutes(summary.loggedMinutes)} />
            <PlanStat label="Targets done" value={`${summary.completed}/${summary.items.length}`} />
          </div>
          <div role="progressbar" aria-label="Targets completed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(completedPct)}><ProgressBar pct={completedPct} className="mt-4" /></div>
          {summary.items.length > 0 && summary.completed === summary.items.length && <p className="mt-2 text-xs font-semibold text-ink">Your planned outcomes are complete. Make room for rest.</p>}
          {budget && <p className={`mt-3 rounded-xl text-xs leading-relaxed ${summary.plannedMinutes > budget ? 'border border-[#C0503C]/30 bg-[#C0503C]/10 px-3 py-2 text-ink' : 'text-inksoft'}`}>
            {summary.plannedMinutes > budget ? `${formatMinutes(summary.plannedMinutes - budget)} over your goal. Move a few targets or adjust your estimates.` : summary.plannedMinutes === budget ? 'Your week is fully allocated. Consider leaving a little catch-up time.' : `${formatMinutes(budget - summary.plannedMinutes)} unallocated. Leave a catch-up buffer.`}
          </p>}
        </div>
      </section>
      {week !== currentWeek && <button className="mt-1 min-h-11 w-full text-xs font-bold text-ink underline underline-offset-4" onClick={() => changeWeek(currentWeek)}>Back to this week</button>}

      <section className="mt-5" aria-label="Weekly targets">
        <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-extrabold text-ink">Your targets</h2><button className="planner-primary px-3 text-xs" onClick={() => setAddOpen(true)}><Plus size={16} /> Add targets</button></div>
        {candidates.length > 0 && <button className="btn-ghost mt-2 w-full text-xs" onClick={() => setCarryOpen(true)}><CornerDownRight size={16} /> Review {candidates.length} unfinished from last week</button>}

        <div className="mt-5 flex items-center justify-between gap-2">
          <button className={`min-h-11 rounded-xl px-3 text-xs font-bold ${day === 'all' ? 'bg-ink text-paper' : 'text-inksoft'}`} aria-pressed={day === 'all'} onClick={() => setDay('all')}>Whole week</button>
          <button className={`min-h-11 rounded-xl px-3 text-xs font-bold ${day === 'any' ? 'bg-ink text-paper' : 'text-inksoft'}`} aria-pressed={day === 'any'} onClick={() => setDay('any')}>Any day · {summary.items.filter((target) => !target.scheduledDate).length}</button>
        </div>
        <div className="my-2 overflow-x-auto"><div className="grid min-w-[332px] grid-cols-7 gap-1" aria-label="Filter targets by day">
          {dates.map((date) => {
            const count = summary.items.filter((target) => target.scheduledDate === date).length;
            return <button key={date} aria-label={`${fullDayLabel(date)}${date === today ? ', today' : ''}, ${count} ${count === 1 ? 'target' : 'targets'}`} aria-pressed={day === date} onClick={() => setDay(date)} className={`flex min-h-16 flex-col items-center justify-center rounded-xl border text-xs ${day === date ? 'border-ink bg-ink text-paper' : date === today ? 'border-brand bg-brandsoft/40 text-ink' : 'border-transparent bg-surface2/70 text-inksoft'}`}>
              <span className="text-[10px] font-semibold">{dayLabel(date)}</span><span className="my-1 text-sm font-extrabold">{fromISODate(date).getDate()}</span><span className={`h-1 w-1 rounded-full ${count ? 'bg-current' : 'bg-transparent'}`} />
            </button>;
          })}
        </div></div>
        {!visible.length ? <div className="card mt-4 flex flex-col items-center px-5 py-7 text-center">
          <ListChecks size={30} className="mb-3 text-inksoft" /><h3 className="text-sm font-bold text-ink">{summary.items.length ? 'A little breathing room' : 'Start with a manageable week'}</h3>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-inksoft">{summary.items.length ? 'No targets here yet. Add one for this day, or view the whole week.' : 'Choose a few syllabus topics. Give each a clear outcome, then leave space for revision and catch-up.'}</p>
          <button className="mt-3 min-h-11 text-sm font-bold text-ink underline underline-offset-4" onClick={() => setAddOpen(true)}>{summary.items.length ? 'Add a target here' : 'Choose your first topics'}</button>
        </div> : <div className="mt-4 space-y-5">{groups.map(({ date, items }) => <section key={date}>
          <div className="mb-2 flex items-center justify-between gap-2 px-1"><h3 className="text-xs font-bold text-ink">{date === 'any' ? 'Any day this week' : `${fullDayLabel(date)}${date === today ? ' · Today' : ''}`}</h3><span className="text-[11px] text-inksoft">{formatMinutes(items.reduce((sum, target) => sum + target.plannedMinutes, 0))} planned</span></div>
          <ul className="space-y-2">{items.map((target) => <li key={target.id} className={`card p-3 ${target.completed ? 'bg-surface2/60' : ''}`}>
            <div className="flex items-start gap-2">
              <button role="checkbox" aria-checked={target.completed} aria-label={`${target.completed ? 'Reopen' : 'Complete'} ${target.title}`} disabled={busy} className="hit -ml-1 -mt-1 shrink-0 rounded-xl" onClick={() => void run(() => db.weeklyTargets.update(target.id, { completed: !target.completed }))}><span className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 ${target.completed ? 'border-ink bg-ink text-paper' : 'border-inksoft/50'}`}>{target.completed && <Check size={16} />}</span></button>
              <div className="min-w-0 flex-1"><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-inksoft">{PLAN_PAPERS[target.paper]} · {ACTIVITY_META[target.activity].label}</p><h4 className={`break-words text-sm font-bold leading-snug text-ink ${target.completed ? 'line-through decoration-inksoft/50' : ''}`}>{target.title}</h4>{target.outcome && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-inksoft">{target.outcome}</p>}<p className="mt-2 flex items-center gap-1 text-[11px] text-inksoft"><Clock3 size={12} /> {formatMinutes(target.plannedMinutes)} planned{target.carriedFrom && <span> · carried forward</span>}{!target.completed && target.scheduledDate && target.scheduledDate < today && <span> · reschedule if needed</span>}</p></div>
              <button className="hit -mr-1 -mt-1 shrink-0 rounded-xl text-inksoft" aria-label={`Edit ${target.title}`} onClick={() => setEditing(target)}><Pencil size={15} /></button>
            </div>
            {!target.completed && <button className="ml-11 mt-1 min-h-11 text-xs font-bold text-ink underline underline-offset-4" onClick={() => timer.timer ? timer.openZen() : setTimerTarget(target)}>{timer.timer ? 'Back to session' : 'Study this target'} <ChevronRight size={12} className="inline" /></button>}
          </li>)}</ul>
        </section>)}</div>}
      </section>
      <p className="mt-6 text-center text-[11px] leading-relaxed text-inksoft">Checked targets track outcomes; study hours come from your timer and logs. Syllabus status stays unchanged.<br />Saved on this device and included in your JSON backup.</p>

      {addOpen && <TargetComposer data={data} week={week} initialDay={day !== 'all' && day !== 'any' ? day : ''} onClose={() => setAddOpen(false)} />}
      {editing && <TargetEditor target={editing} week={week} onClose={() => setEditing(null)} />}
      {budgetOpen && <BudgetEditor week={week} budget={budget} suggested={data.settings.defaultDailyTargetMinutes * 6} onClose={() => setBudgetOpen(false)} />}
      {carryOpen && <CarryReview week={week} candidates={candidates} onClose={() => setCarryOpen(false)} />}
      <TimerStartModal open={timerTarget !== null} onClose={() => setTimerTarget(null)} settings={data.settings} initialSubject={timerTarget ? (timerTarget.paper.startsWith('OPTIONAL') ? 'OPTIONAL' : timerTarget.paper as Exclude<PlanPaper, 'OPTIONAL_P1' | 'OPTIONAL_P2'>) : undefined} initialTopic={timerTarget?.title} />
    </div>
  );
}

function PlanStat({ label, value }: { label: string; value: string }) {
  return <div className="px-1 text-center"><p className="text-lg font-extrabold tabular-nums text-ink">{value}</p><p className="mt-0.5 text-[10px] font-semibold text-inksoft">{label}</p></div>;
}

function TargetComposer({ data, week, initialDay, onClose }: { data: AppData; week: string; initialDay: string; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState<'syllabus' | 'custom'>('syllabus');
  const [paper, setPaper] = useState<PlanPaper>('PRELIMS');
  const [search, setSearch] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const [selected, setSelected] = useState<SyllabusItem[]>([]);
  const [title, setTitle] = useState('');
  const [activity, setActivity] = useState<PlanActivity>('reading');
  const [minutes, setMinutes] = useState('60');
  const [date, setDate] = useState(initialDay);
  const [outcome, setOutcome] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const topics = useMemo(() => data.syllabus.filter((topic) => topic.paper === paper &&
    `${topic.microTopic} ${topic.category}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!dueOnly || (topic.status !== 'mastered' && topic.nextRevisionDue && topic.nextRevisionDue <= addDays(week, 6))))
    .sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity)), [data.syllabus, paper, search, dueOnly, week]);
  const count = source === 'custom' ? (title.trim() ? 1 : 0) : selected.length;
  const valid = count > 0 && validTarget(Number(minutes), date || undefined, week);
  const existing = data.weeklyTargets.filter((target) => target.weekStart === week);

  const save = async () => {
    if (!valid || busy) return;
    setBusy(true); setError('');
    try {
      const picks = source === 'syllabus' ? selected.map((topic) => ({ title: topic.microTopic, paper: topic.paper, topicId: topic.id })) : [{ title: title.trim(), paper, topicId: undefined }];
      const targets = picks.map((pick): WeeklyTarget => ({ ...pick, id: crypto.randomUUID(), weekStart: week, activity, outcome: outcome.trim(), plannedMinutes: Number(minutes), scheduledDate: date || undefined, completed: false, createdAt: Date.now() }));
      await saveTargets(targets);
      showToast({ message: `${targets.length} ${targets.length === 1 ? 'target' : 'targets'} added to your week.` });
      onClose();
    } catch { setError('Could not save. Your selections are still here; please try again.'); }
    finally { setBusy(false); }
  };

  return <Modal open onClose={onClose} title={step === 1 ? 'Choose your targets' : 'Give each target a plan'}>
    <p className="mb-4 text-xs text-inksoft">Step {step} of 2 · {weekLabel(week)}</p>
    {step === 1 ? <>
      <div className="mb-4 grid grid-cols-2 gap-2">{(['syllabus', 'custom'] as const).map((value) => <button key={value} className={`planner-choice ${source === value ? 'planner-choice-active' : ''}`} aria-pressed={source === value} onClick={() => setSource(value)}>{value === 'syllabus' ? 'From syllabus' : 'Custom target'}</button>)}</div>
      <label className="label" htmlFor="plan-paper">Paper / subject</label><select id="plan-paper" className="input mb-3" value={paper} onChange={(event) => setPaper(event.target.value as PlanPaper)}>{Object.entries(PLAN_PAPERS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      {source === 'custom' ? <><label className="label" htmlFor="plan-title">Target</label><input id="plan-title" className="input" maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. October current affairs consolidation" /><p className="mt-2 text-xs text-inksoft">Use this for current affairs, test series, essays or your own resources.</p></> : <>
        <div className="relative"><Search className="absolute left-3 top-3 text-inksoft" size={17} /><input className="input pl-9" aria-label="Search syllabus topics" placeholder="Search topics or categories" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <label className="my-1 flex min-h-11 items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--c-ink))]" checked={dueOnly} onChange={(event) => setDueOnly(event.target.checked)} /> Due for revision by this Sunday</label>
        <div className="max-h-[30vh] overflow-y-auto rounded-xl border border-line">
          {topics.length ? topics.map((topic) => {
            const checked = selected.some((item) => item.id === topic.id);
            const already = existing.some((target) => target.topicId === topic.id);
            return <label key={topic.id} className={`flex min-h-16 cursor-pointer items-start gap-3 border-b border-line px-3 py-3 last:border-b-0 ${checked ? 'bg-brandsoft/40' : 'bg-surface'}`}>
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--c-ink))]" checked={checked} onChange={() => setSelected((items) => checked ? items.filter((item) => item.id !== topic.id) : [...items, topic])} /><span className="min-w-0"><span className="block text-sm font-semibold leading-snug text-ink">{topic.microTopic}</span><span className="mt-1 block text-[11px] leading-relaxed text-inksoft">{topic.category} · {STATUS_META[topic.status].label}{already ? ' · Already in this week' : ''}{topic.nextRevisionDue && topic.status !== 'mastered' && topic.nextRevisionDue <= addDays(week, 6) ? ' · Revision due' : ''}</span></span>
            </label>;
          }) : <p className="p-4 text-xs leading-relaxed text-inksoft">{paper.startsWith('OPTIONAL') ? 'No matching optional topics. Load your optional in Syllabus, or use a custom target.' : paper === 'CURRENT_AFFAIRS' ? 'Use a custom target for your newspaper, magazine or current affairs topics.' : 'No matching topics. Try another search or turn off the revision filter.'}</p>}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-inksoft" role="status">{selected.length} selected across papers · {topics.length} matching</p>{selected.length > 0 && <button className="min-h-11 shrink-0 px-2 text-xs font-bold underline" onClick={() => setSelected([])}>Clear</button>}</div>
      </>}
      <div className="planner-modal-footer"><button className="planner-primary w-full" disabled={!count} onClick={() => { if (dueOnly && source === 'syllabus') setActivity('revision'); setStep(2); }}>Plan {count || ''} {count === 1 ? 'target' : 'targets'} <ArrowRight size={16} /></button></div>
    </> : <>
      <div className="mb-4 rounded-xl bg-surface2 p-3"><p className="text-sm font-bold text-ink">{source === 'custom' ? title : selected.length === 1 ? selected[0].microTopic : `${selected.length} syllabus topics selected`}</p><button className="mt-1 min-h-11 text-xs font-semibold underline underline-offset-4" onClick={() => setStep(1)}>Change selection</button></div>
      {source === 'syllabus' && selected.length > 1 && <details className="mb-4 rounded-xl border border-line bg-surface p-3"><summary className="min-h-11 cursor-pointer text-xs font-semibold text-ink">Review selected topics ({selected.length})</summary><ul className="mt-2 max-h-32 space-y-2 overflow-y-auto">{selected.map((topic) => <li key={topic.id} className="text-xs text-inksoft">{PLAN_PAPERS[topic.paper]} · {topic.microTopic}</li>)}</ul></details>}
      <TargetFields week={week} activity={activity} setActivity={setActivity} minutes={minutes} setMinutes={setMinutes} date={date} setDate={setDate} outcome={outcome} setOutcome={setOutcome} />
      <p className="mt-3 rounded-xl bg-surface2 p-3 text-xs leading-relaxed text-ink">{count > 1 ? `${formatMinutes(Number(minutes) || 0)} per topic × ${count} topics = ${formatMinutes((Number(minutes) || 0) * count)} planned. Day, activity and outcome apply to each; you can edit targets individually later.` : `${formatMinutes(Number(minutes) || 0)} planned. You can change the day or estimate later.`}</p>
      {error && <p role="alert" className="mt-3 text-sm text-[#C0503C]">{error}</p>}
      <div className="planner-modal-footer"><button className="planner-primary w-full" disabled={!valid || busy} onClick={() => void save()}>{busy ? 'Saving…' : `Add ${count} ${count === 1 ? 'target' : 'targets'} to week`}</button></div>
    </>}
  </Modal>;
}

function TargetFields({ week, activity, setActivity, minutes, setMinutes, date, setDate, outcome, setOutcome }: {
  week: string; activity: PlanActivity; setActivity: (value: PlanActivity) => void; minutes: string; setMinutes: (value: string) => void; date: string; setDate: (value: string) => void; outcome: string; setOutcome: (value: string) => void;
}) {
  return <div className="space-y-4">
    <div><label className="label" htmlFor="plan-activity">What will you do?</label><select id="plan-activity" className="input" value={activity} onChange={(event) => setActivity(event.target.value as PlanActivity)}>{Object.entries(ACTIVITY_META).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div>
    <div><label className="label" htmlFor="plan-outcome">Done looks like <span className="normal-case font-normal">(optional)</span></label><textarea id="plan-outcome" className="input min-h-20" maxLength={500} rows={2} placeholder={ACTIVITY_META[activity].hint} value={outcome} onChange={(event) => setOutcome(event.target.value)} /></div>
    <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="plan-day">When</label><select id="plan-day" className="input" value={date} onChange={(event) => setDate(event.target.value)}><option value="">Any day this week</option>{weekDates(week).map((day) => <option key={day} value={day}>{fullDayLabel(day)}</option>)}</select></div><div><label className="label" htmlFor="plan-minutes">Minutes per target</label><input id="plan-minutes" className="input" type="number" min={15} max={1440} step={1} value={minutes} onChange={(event) => setMinutes(event.target.value)} /><p className="mt-1 text-[10px] text-inksoft">15–1,440 minutes</p></div></div>
  </div>;
}

function BudgetEditor({ week, budget, suggested, onClose }: { week: string; budget?: number; suggested: number; onClose: () => void }) {
  const [hours, setHours] = useState(String((budget ?? suggested) / 60));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = Number(hours) >= 1 && Number(hours) <= 168;
  return <Modal open onClose={onClose} title="Set a realistic weekly goal">
    <p className="mb-4 text-sm leading-relaxed text-inksoft">{weekLabel(week)}<br />Budget for focused study, with room for breaks and catch-up. This goal applies only to this week.</p>
    <label className="label" htmlFor="weekly-hours">Study hours this week</label><input id="weekly-hours" type="number" min={1} max={168} step="any" className="input" value={hours} onChange={(event) => setHours(event.target.value)} />
    {!budget && <p className="mt-2 text-xs leading-relaxed text-inksoft">Suggested: {formatMinutes(suggested)}, based on six days at your daily goal. Adjust it to your week.</p>}
    <div className="my-4 flex flex-wrap gap-2">{[12, 18, 24, 30, 36].map((value) => <button key={value} className={`planner-choice ${Number(hours) === value ? 'planner-choice-active' : ''}`} aria-pressed={Number(hours) === value} onClick={() => setHours(String(value))}>{value}h</button>)}</div>
    <p className="mb-4 rounded-xl bg-surface2 p-3 text-xs leading-relaxed text-inksoft">Keep current affairs and CSAT in view, and leave a buffer for revision. A doable plan beats a crowded one.</p>
    {error && <p role="alert" className="mb-3 text-sm text-[#C0503C]">{error}</p>}
    <button className="planner-primary w-full" disabled={!valid || busy} onClick={async () => { setBusy(true); try { await db.weeklyPlans.put({ weekStart: week, targetMinutes: Math.round(Number(hours) * 60) }); showToast({ message: 'Weekly goal saved.' }); onClose(); } catch { setError('Could not save your goal. Please try again.'); } finally { setBusy(false); } }}>{busy ? 'Saving…' : 'Save weekly goal'}</button>
  </Modal>;
}

function TargetEditor({ target, week, onClose }: { target: WeeklyTarget; week: string; onClose: () => void }) {
  const [title, setTitle] = useState(target.title);
  const [activity, setActivity] = useState(target.activity);
  const [minutes, setMinutes] = useState(String(target.plannedMinutes));
  const [date, setDate] = useState(target.scheduledDate ?? '');
  const [outcome, setOutcome] = useState(target.outcome);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(remove = false) {
    if (busy) return;
    setBusy(true);
    try {
      if (remove) {
        await db.weeklyTargets.delete(target.id);
        showToast({ message: 'Target removed.', actionLabel: 'Undo', duration: 6000, onAction: () => { void db.weeklyTargets.put(target).catch(() => showToast({ message: 'Could not restore target. Please try again.' })); } });
      } else {
        await saveTargets([{ ...target, title: title.trim(), activity, plannedMinutes: Number(minutes), scheduledDate: date || undefined, outcome: outcome.trim() }]);
        showToast({ message: 'Target updated.' });
      }
      onClose();
    } catch { setError('Could not save your change. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Modal open onClose={onClose} title="Edit target">
    <label className="label" htmlFor="edit-target-title">Target · {PLAN_PAPERS[target.paper]}</label><input id="edit-target-title" className="input mb-4" maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} />
    <TargetFields week={week} activity={activity} setActivity={setActivity} minutes={minutes} setMinutes={setMinutes} date={date} setDate={setDate} outcome={outcome} setOutcome={setOutcome} />
    {error && <p role="alert" className="mt-3 text-sm text-[#C0503C]">{error}</p>}
    <div className="mt-5 flex gap-2"><button className="btn-ghost px-3" aria-label="Remove target" disabled={busy} onClick={() => void save(true)}><Trash2 size={17} /></button><button className="planner-primary flex-1" disabled={busy || !title.trim() || !validTarget(Number(minutes), date || undefined, week)} onClick={() => void save()}>{busy ? 'Saving…' : 'Save changes'}</button></div>
  </Modal>;
}

function CarryReview({ week, candidates, onClose }: { week: string; candidates: WeeklyTarget[]; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <Modal open onClose={onClose} title="A fresh week, a conscious choice">
    <p className="mb-4 text-xs leading-relaxed text-inksoft">Choose what still matters from last week. Selected targets will be copied into {weekLabel(week)}, with the day left open. Last week’s history stays intact.</p>
    <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-line">{candidates.map((target) => <label key={target.id} className="flex min-h-16 cursor-pointer items-center gap-3 border-b border-line bg-surface p-3 last:border-b-0"><input type="checkbox" className="h-4 w-4 shrink-0 accent-[rgb(var(--c-ink))]" checked={selected.includes(target.id)} onChange={() => setSelected((items) => items.includes(target.id) ? items.filter((id) => id !== target.id) : [...items, target.id])} /><span><span className="block text-sm font-semibold text-ink">{target.title}</span><span className="text-[11px] text-inksoft">{ACTIVITY_META[target.activity].label} · {formatMinutes(target.plannedMinutes)}</span></span></label>)}</div>
    {error && <p role="alert" className="mt-3 text-sm text-[#C0503C]">{error}</p>}
    <div className="planner-modal-footer"><button className="planner-primary w-full" disabled={!selected.length || busy} onClick={async () => { setBusy(true); try { const count = await carryTargets(week, selected); showToast({ message: `${count} ${count === 1 ? 'target' : 'targets'} carried into this week.` }); onClose(); } catch { setError('Could not carry your targets forward. Please try again.'); } finally { setBusy(false); } }}>{busy ? 'Saving…' : `Carry ${selected.length || ''} ${selected.length === 1 ? 'target' : 'targets'} forward`}</button></div>
  </Modal>;
}
