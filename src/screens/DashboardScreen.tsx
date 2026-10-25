import { useEffect, useMemo, useState } from 'react';
import { Play, Plus, Share2, Flame, Trophy, Target, ChevronRight, Moon, Sparkles } from 'lucide-react';
import { toBlob } from 'html-to-image';
import type { AppData } from '../hooks/useAppData';
import { minutesByDate } from '../hooks/useAppData';
import type { Route } from '../App';
import { db } from '../db';
import { ProgressRing, SectionCard, StarRating, StatPill, ConfettiBurst, Modal } from '../components/common';
import { Pip } from '../components/mascot/Pip';
import { ShareCard } from '../components/partner/ShareCard';
import { RetroLogModal } from '../components/timesheet/RetroLogModal';
import { TimerStartModal } from '../components/timer/TimerStartModal';
import { useTimer } from '../hooks/useTimer';
import { formatDateLong, formatMinutes, todayISO, daysUntil } from '../utils/dates';
import { quoteOfTheDay } from '../data/seedData';
import { buildDigestText, shareDailyDigest } from '../utils/share';
import { levelForXP, nextLevelProgress } from '../utils/gamification';
import { SUBJECT_META, type DailyRituals } from '../types';

export function DashboardScreen({ data, navigate }: { data: AppData; navigate: (r: Route) => void }) {
  const today = todayISO();
  const timer = useTimer();
  const [retroOpen, setRetroOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const todayMinutes = useMemo(
    () => data.timeLogs.filter((l) => l.date === today).reduce((s, l) => s + l.durationMinutes, 0),
    [data.timeLogs, today]
  );
  const targetMinutes = data.todayRecord?.targetMinutes ?? data.settings.defaultDailyTargetMinutes;
  const ringPct = Math.min(100, (todayMinutes / Math.max(1, targetMinutes)) * 100);
  const goalMet = todayMinutes >= targetMinutes;

  const tier = levelForXP(data.xp.total);
  const prog = nextLevelProgress(data.xp.total);
  const dday = data.settings.examDate ? daysUntil(data.settings.examDate) : null;

  const todaySubjects = useMemo(() => {
    const byS = new Map<string, number>();
    data.timeLogs.filter((l) => l.date === today).forEach((l) => byS.set(l.subject, (byS.get(l.subject) ?? 0) + l.durationMinutes));
    return [...byS.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.timeLogs, today]);

  const rituals = data.todayRituals;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // One-time daily-goal celebration
  useEffect(() => {
    if (goalMet && todayMinutes > 0 && !localStorage.getItem(`celebrated_${today}`)) {
      localStorage.setItem(`celebrated_${today}`, '1');
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 2800);
      return () => clearTimeout(t);
    }
  }, [goalMet, todayMinutes, today]);

  const setTarget = async (mins: number) => {
    await db.dailyRecords.put({ ...(data.todayRecord ?? { date: today, targetMinutes: mins }), targetMinutes: mins });
  };

  const toggleRitual = async (patch: Partial<DailyRituals>) => {
    if (!rituals) return;
    await db.dailyRituals.put({ ...rituals, ...patch });
    if (goalMet) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2600);
    }
  };

  const ritualDone = (r?: DailyRituals) =>
    r ? [r.newspaperRead, r.editorialNotes, r.mcqsCompleted > 0, r.answersWritten > 0, r.csatPracticed, r.currentAffairsMag].filter(Boolean).length : 0;

  const digest = {
    date: today,
    totalMinutes: todayMinutes,
    targetMinutes,
    logs: data.timeLogs.filter((l) => l.date === today),
    rituals: rituals ?? {
      date: today,
      newspaperRead: false,
      editorialNotes: false,
      mcqsCompleted: 0,
      answersWritten: 0,
      csatPracticed: false,
      currentAffairsMag: false
    },
    record: data.todayRecord,
    streak: data.streak.currentStreak
  };

  const doShare = async () => {
    const el = document.getElementById('share-card');
    let blob: Blob | null = null;
    if (el) {
      try {
        blob = await toBlob(el, { pixelRatio: 2 });
      } catch {
        blob = null;
      }
    }
    const text = buildDigestText(digest, data.settings);
    const result = blob ? await shareDailyDigest(blob, text) : await shareDailyDigest(new Blob(), text);
    if (result) {
      await db.dailyRecords.put({ ...(data.todayRecord ?? { date: today, targetMinutes }), partnerSharedAt: new Date().toISOString() });
    }
  };

  return (
    <div className="relative px-4 pt-safe">
      <ConfettiBurst show={confetti} />

      {/* ─── Greeting + Pip ─── */}
      <header className="flex items-center gap-3 pb-2 pt-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-inksoft">{formatDateLong(today)}</p>
          <h1 className="truncate text-xl font-extrabold text-ink">
            {greeting}, {data.settings.aspirantName}!
          </h1>
          {dday !== null && (
            <p className="mt-0.5 text-xs font-bold text-brand">
              {dday > 0 ? `🎯 Prelims ${data.settings.targetYear}: ${dday} days to go` : dday === 0 ? '🎯 Exam day — all the best!' : 'Prelims done. Onward!'}
            </p>
          )}
        </div>
        <Pip mood={goalMet ? 'celebrate' : data.streak.shieldUsedForYesterday ? 'sleep' : 'cheer'} xp={data.xp.total} size={72} />
      </header>

      {data.streak.shieldUsedForYesterday && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-brandsoft/60 px-3 py-2 text-xs font-semibold text-ink">
          <Moon size={14} /> A Streak Shield protected yesterday's rest. Sleep well, champion — your streak is safe.
        </div>
      )}

      {/* ─── Progress ring ─── */}
      <section className="card relative flex flex-col items-center gap-3 p-5">
        <ProgressRing pct={ringPct} size={190} stroke={14}>
          <Pip mood={goalMet ? 'celebrate' : 'cheer'} size={64} className="-mt-1" />
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{formatMinutes(todayMinutes)}</p>
          <p className="text-[11px] font-semibold text-inksoft">of {formatMinutes(targetMinutes)} target</p>
        </ProgressRing>

        {goalMet ? (
          <p className="text-center text-sm font-bold text-brand">🎉 Target crushed today! You're unstoppable!</p>
        ) : (
          <p className="max-w-[16rem] text-center text-xs italic text-inksoft">"{quoteOfTheDay(today)}"</p>
        )}

        <div className="flex w-full gap-2">
          <button className="btn-primary flex-1" onClick={() => setTimerOpen(true)}>
            <Play size={16} fill="currentColor" /> {timer.timer ? 'Session running' : 'Start timer'}
          </button>
          <button className="btn-ghost flex-1" onClick={() => setRetroOpen(true)}>
            <Plus size={16} /> Quick log
          </button>
        </div>
      </section>

      {/* ─── Rank / streak / shields ─── */}
      <section className="mt-3 grid grid-cols-3 gap-2">
        <StatPill label="Streak" value={`${data.streak.currentStreak} 🔥`} sub={data.streak.currentStreak > 0 ? 'days strong' : 'start today'} />
        <StatPill label="Rank" value={`${tier.level} · ${tier.accessoryEmoji}`} sub={tier.title.split(' ').slice(0, 2).join(' ')} />
        <StatPill label="Shields" value={`${data.streak.shields} 🛡️`} sub={`${7 - data.streak.daysTowardShield}d to next`} />
      </section>

      <SectionCard title="Rank progress" icon={<Trophy size={14} />} className="mt-3">
        <div className="flex items-center justify-between text-xs font-semibold text-ink">
          <span>{tier.title}</span>
          <span className="text-inksoft">
            {prog.next ? `${data.xp.total} / ${prog.next.minXP} XP` : `${data.xp.total} XP · MAX`}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${prog.pct}%` }} />
        </div>
        {prog.next && (
          <p className="mt-1.5 text-[11px] text-inksoft">
            {prog.toNext} XP to <b>{prog.next.title}</b> {prog.next.accessoryEmoji}
          </p>
        )}
      </SectionCard>

      {/* ─── Daily rituals ─── */}
      <SectionCard title="Today's rituals" icon={<Sparkles size={14} />} className="mt-3">
        <div className="space-y-1">
          <RitualRow label="Newspaper read (The Hindu / IE)" checked={rituals?.newspaperRead} onToggle={(v) => void toggleRitual({ newspaperRead: v })} />
          <RitualRow label="Editorial summary notes" checked={rituals?.editorialNotes} onToggle={(v) => void toggleRitual({ editorialNotes: v })} />
          <div className="flex items-center justify-between rounded-lg px-1 py-1.5">
            <span className="text-sm text-ink">Daily MCQs practice</span>
            <div className="flex items-center gap-1.5">
              {[10, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => void toggleRitual({ mcqsCompleted: rituals?.mcqsCompleted === n ? 0 : n })}
                  className={`chip px-2.5 py-1 text-xs ${(rituals?.mcqsCompleted ?? 0) >= n ? 'chip-active' : ''}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg px-1 py-1.5">
            <span className="text-sm text-ink">Answer writing</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => void toggleRitual({ answersWritten: rituals?.answersWritten === n ? 0 : n })}
                  className={`chip px-2.5 py-1 text-xs ${(rituals?.answersWritten ?? 0) >= n ? 'chip-active' : ''}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <RitualRow label="CSAT practice drill" checked={rituals?.csatPracticed} onToggle={(v) => void toggleRitual({ csatPracticed: v })} />
          <RitualRow label="Monthly CA magazine" checked={rituals?.currentAffairsMag} onToggle={(v) => void toggleRitual({ currentAffairsMag: v })} />
        </div>
        <p className="mt-2 text-right text-[11px] font-semibold text-inksoft">{ritualDone(rituals)}/6 rituals today</p>
      </SectionCard>

      {/* ─── Today's timesheet ─── */}
      <SectionCard
        title="Today's timesheet"
        icon={<Target size={14} />}
        className="mt-3"
        action={
          <button onClick={() => navigate('study')} className="flex items-center text-xs font-bold text-brand">
            All logs <ChevronRight size={14} />
          </button>
        }
      >
        {todaySubjects.length === 0 ? (
          <p className="py-3 text-center text-xs text-inksoft">No sessions logged yet — start the timer or quick-log an offline session.</p>
        ) : (
          <ul className="space-y-2">
            {todaySubjects.map(([subject, mins]) => {
              const meta = SUBJECT_META[subject as keyof typeof SUBJECT_META];
              return (
                <li key={subject} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{meta.label}</span>
                  <span className="text-sm font-bold tabular-nums text-ink">{formatMinutes(mins)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* ─── Energy & reflection ─── */}
      <SectionCard title="How was today?" icon={<Flame size={14} />} className="mt-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Energy</p>
            <StarRating value={data.todayRecord?.energyRating ?? 0} onChange={(v) => void db.dailyRecords.put({ ...(data.todayRecord ?? { date: today, targetMinutes }), energyRating: v })} />
          </div>
          <div>
            <p className="label">Focus</p>
            <StarRating value={data.todayRecord?.focusRating ?? 0} onChange={(v) => void db.dailyRecords.put({ ...(data.todayRecord ?? { date: today, targetMinutes }), focusRating: v })} />
          </div>
        </div>
        <textarea
          className="input mt-3 min-h-[60px] resize-none"
          placeholder="What went well today? What will I adjust tomorrow?"
          defaultValue={data.todayRecord?.reflection ?? ''}
          onBlur={(e) => void db.dailyRecords.put({ ...(data.todayRecord ?? { date: today, targetMinutes }), reflection: e.target.value })}
        />
      </SectionCard>

      {/* ─── Share digest ─── */}
      <button className="btn-primary mt-3 w-full py-3 text-base" onClick={() => setShareOpen(true)}>
        <Share2 size={18} /> Share daily digest with {data.settings.partnerName}
      </button>
      <p className="mb-4 mt-2 text-center text-[11px] text-inksoft">
        {data.todayRecord?.partnerSharedAt
          ? `Last shared ${new Date(data.todayRecord.partnerSharedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} 💛`
          : 'A beautiful card with Pip, hours, rituals & mood — in 1 tap.'}
      </p>

      {/* ─── Target setter ─── */}
      <SectionCard title="Daily target" icon={<Target size={14} />} className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[360, 420, 480, 540, 600].map((m) => (
            <button key={m} onClick={() => void setTarget(m)} className={`chip ${targetMinutes === m ? 'chip-active' : ''}`}>
              {m / 60}h
            </button>
          ))}
          <span className="chip cursor-default">{formatMinutes(targetMinutes)}</span>
        </div>
      </SectionCard>

      {/* Offscreen share card (rendered for html-to-image) */}
      <div style={{ position: 'fixed', left: -9999, top: 0 }}>
        <ShareCard digest={digest} settings={data.settings} />
      </div>

      {/* Share preview modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title={`Send to ${data.settings.partnerName} 💛`} wide>
        <div className="mb-4 rounded-xl" style={{ zoom: 0.55 }}>
          <ShareCard digest={digest} settings={data.settings} />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn-primary flex-1 py-3" onClick={() => void doShare()}>
            <Share2 size={16} /> Share card (PNG + text)
          </button>
          <button
            className="btn-ghost"
            onClick={() => void navigator.clipboard.writeText(buildDigestText(digest, data.settings))}
          >
            Copy text
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-inksoft">
          Uses your share sheet (WhatsApp/Telegram) — falls back to clipboard + WhatsApp link.
        </p>
      </Modal>

      <RetroLogModal open={retroOpen} onClose={() => setRetroOpen(false)} defaultDate={today} />
      <TimerStartModal open={timerOpen} onClose={() => setTimerOpen(false)} settings={data.settings} />
    </div>
  );
}

function RitualRow({ label, checked, onToggle }: { label: string; checked?: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button onClick={() => onToggle(!checked)} className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left active:bg-surface2">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          checked ? 'border-brand bg-brand text-white' : 'border-line bg-surface'
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-sm ${checked ? 'text-inksoft line-through' : 'text-ink'}`}>{label}</span>
    </button>
  );
}
