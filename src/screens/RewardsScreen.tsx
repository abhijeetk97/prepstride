import { useState } from 'react';
import { Trophy, Shield, Gift, Plus, Lock, Check, Trash2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { db } from '../db';
import { SectionCard, ProgressBar, Modal, ConfettiBurst } from '../components/common';
import { Pip } from '../components/mascot/Pip';
import { LEVEL_THRESHOLDS, levelForXP, nextLevelProgress } from '../utils/gamification';
import { redeemPartnerTreat, treatBlurb } from '../utils/share';
import type { PartnerTreat } from '../types';
import { formatDateShort, toISODate } from '../utils/dates';

export function RewardsScreen({ data }: { data: AppData }) {
  const [customOpen, setCustomOpen] = useState(false);
  const [redeemConfirm, setRedeemConfirm] = useState<PartnerTreat | null>(null);
  const [confetti, setConfetti] = useState(false);

  const tier = levelForXP(data.xp.total);
  const prog = nextLevelProgress(data.xp.total);
  const unlockedBadges = data.badges.filter((b) => b.unlockedAt);
  const unlockedTreats = data.treats.filter((t) => t.isUnlocked);

  const doRedeem = async (t: PartnerTreat) => {
    await db.partnerTreats.put({ ...t, isRedeemed: true, redeemedAt: new Date().toISOString() });
    setRedeemConfirm(null);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2600);
    await redeemPartnerTreat(t, data.settings.aspirantName, data.settings.partnerName);
  };

  return (
    <div className="relative px-4 pt-safe">
      <ConfettiBurst show={confetti} />

      <header className="flex items-center gap-3 pb-3 pt-4">
        <Pip mood="celebrate" xp={data.xp.total} size={76} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold leading-tight text-ink">Rank {tier.level}</h1>
          <p className="text-sm font-bold leading-snug text-ink [overflow-wrap:anywhere]">{tier.title}</p>
          <p className="text-xs font-semibold text-inksoft">
            {data.xp.total.toLocaleString()} XP earned · {tier.accessoryEmoji} {tier.mascotAccessory}
          </p>
        </div>
      </header>

      {/* Level track */}
      <SectionCard title="Civil Services journey" icon={<Trophy size={14} />} className="mb-3">
        {prog.next && (
          <div className="mb-2">
            <ProgressBar pct={prog.pct} />
            <p className="mt-1 text-[11px] text-inksoft">
              {prog.toNext} XP to <b>{prog.next.title}</b> {prog.next.accessoryEmoji}
            </p>
          </div>
        )}
        <ul className="mt-3 space-y-1.5">
          {LEVEL_THRESHOLDS.map((t) => {
            const reached = data.xp.total >= t.minXP;
            return (
              <li key={t.level} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${t.level === tier.level ? 'bg-brandsoft/60' : ''}`}>
                <span className={`text-lg ${reached ? '' : 'grayscale opacity-40'}`}>{t.accessoryEmoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${reached ? 'text-ink' : 'text-inksoft'}`}>
                    Rank {t.level} · {t.title}
                  </p>
                  <p className="text-[10px] text-inksoft">{t.minXP.toLocaleString()}+ XP</p>
                </div>
                {t.level === tier.level && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">YOU</span>}
              </li>
            );
          })}
        </ul>
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-line pt-3 text-center">
          <MiniXP label="Study" xp={data.xp.study} emoji="⏳" />
          <MiniXP label="Rituals" xp={data.xp.rituals} emoji="✅" />
          <MiniXP label="Revision" xp={data.xp.revisions} emoji="🔁" />
          <MiniXP label="Mocks" xp={data.xp.mocks} emoji="📝" />
        </div>
      </SectionCard>

      {/* Streak shields */}
      <SectionCard title="Streak shields — rest day grace" icon={<Shield size={14} />} className="mb-3">
        <div className="mb-2 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`text-2xl transition-all ${i < data.streak.shields ? '' : 'grayscale opacity-25'}`} aria-label={i < data.streak.shields ? 'Shield available' : 'Empty slot'}>
              🛡️
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-inksoft">
          {data.streak.shields}/3 shields · {7 - data.streak.daysTowardShield} more target-met days to earn the next one.
          <br />
          Current streak <b className="text-ink">{data.streak.currentStreak} days</b> · longest <b className="text-ink">{data.streak.longestStreak} days</b>
        </p>
        <div className="mt-2 flex justify-center">
          <Pip mood={data.streak.shieldUsedForYesterday ? 'sleep' : 'cheer'} size={56} />
        </div>
        {data.streak.shieldUsedForYesterday && (
          <p className="text-center text-[11px] font-semibold text-brand">
            A shield quietly protected yesterday's rest. Recovery is part of the strategy. 🍃
          </p>
        )}
      </SectionCard>

      {/* Badges */}
      <SectionCard title={`Badges of honor (${unlockedBadges.length}/${data.badges.length})`} icon={<Trophy size={14} />} className="mb-3">
        <div className="grid grid-cols-2 gap-2">
          {data.badges.map((b) => {
            const unlocked = !!b.unlockedAt;
            return (
              <div key={b.id} className={`rounded-xl border p-3 ${unlocked ? 'border-brand/50 bg-brandsoft/30' : 'border-line opacity-60'}`}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>{b.icon}</span>
                  {unlocked ? <Check size={14} className="text-brand" /> : <Lock size={13} className="text-inksoft" />}
                </div>
                <p className="text-xs font-bold text-ink">{b.title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-inksoft">{b.description}</p>
                {unlocked && b.unlockedAt && <p className="mt-1 text-[9px] font-semibold text-brand">Unlocked {formatDateShort(toISODate(new Date(b.unlockedAt)))}</p>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Treat box */}
      <SectionCard
        title={`Partner treat box (${unlockedTreats.length}/${data.treats.length} unlocked)`}
        icon={<Gift size={14} />}
        className="mb-6"
        action={
          <button className="flex items-center gap-1 text-xs font-bold text-brand" onClick={() => setCustomOpen(true)}>
            <Plus size={13} /> Custom
          </button>
        }
      >
        <p className="mb-3 text-[11px] text-inksoft">Real-world couple rewards — milestones turn into quality time. 💛</p>
        <ul className="space-y-2">
          {[...data.treats]
            .sort((a, b) => a.requiredXP - b.requiredXP)
            .map((t) => {
              const unlocked = t.isUnlocked || data.xp.total >= t.requiredXP;
              return (
                <li key={t.id} className={`rounded-xl border p-3 ${unlocked ? 'border-brand/40 bg-surface' : 'border-line bg-surface2/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>{t.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">{t.title}</p>
                      <p className="text-[11px] text-inksoft">{treatBlurb(t, data.settings.aspirantName, data.settings.partnerName)}</p>
                    </div>
                    {unlocked ? (
                      t.isRedeemed ? (
                        <span className="shrink-0 rounded-full bg-surface2 px-2.5 py-1 text-[10px] font-bold text-inksoft">
                          Redeemed {t.redeemedAt ? formatDateShort(toISODate(new Date(t.redeemedAt))) : ''}
                        </span>
                      ) : (
                        <button className="btn-primary shrink-0 px-3 py-1.5 text-xs" onClick={() => setRedeemConfirm(t)}>
                          Redeem 💛
                        </button>
                      )
                    ) : (
                      <span className="shrink-0 text-right">
                        <Lock size={13} className="mx-auto mb-0.5 text-inksoft" />
                        <span className="text-[10px] font-bold text-inksoft">{Math.max(0, t.requiredXP - data.xp.total)} XP</span>
                      </span>
                    )}
                  </div>
                  {t.isCustom && (
                    <button
                      className="mt-1 min-h-11 text-[10px] text-inksoft hover:text-[#C0503C]"
                      onClick={() => confirm('Delete this custom coupon?') && void db.partnerTreats.delete(t.id)}
                    >
                      <Trash2 size={11} className="inline" /> remove custom coupon
                    </button>
                  )}
                </li>
              );
            })}
        </ul>
      </SectionCard>

      {/* Redeem confirm */}
      <Modal open={redeemConfirm !== null} onClose={() => setRedeemConfirm(null)} title="Redeem this treat? 💛">
        {redeemConfirm && (
          <div className="space-y-3 text-center">
            <span className="text-4xl">{redeemConfirm.icon}</span>
            <p className="text-sm font-bold text-ink">{redeemConfirm.title}</p>
            <p className="text-xs text-inksoft">{treatBlurb(redeemConfirm, data.settings.aspirantName, data.settings.partnerName)}</p>
            <p className="text-xs text-inksoft">
              Tapping confirm marks it redeemed and opens a pre-composed, affectionate message for {data.settings.partnerName} with Pip cheering!
            </p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={() => void doRedeem(redeemConfirm)}>
                Redeem & notify
              </button>
              <button className="btn-ghost flex-1" onClick={() => setRedeemConfirm(null)}>
                Not yet
              </button>
            </div>
          </div>
        )}
      </Modal>

      <CustomTreatModal open={customOpen} onClose={() => setCustomOpen(false)} xp={data.xp.total} />
    </div>
  );
}

function MiniXP({ label, xp, emoji }: { label: string; xp: number; emoji: string }) {
  return (
    <div className="rounded-lg bg-surface2 py-1.5">
      <p className="text-sm">{emoji}</p>
      <p className="text-xs font-extrabold text-ink">{xp.toLocaleString()}</p>
      <p className="text-[9px] font-semibold uppercase text-inksoft">{label} XP</p>
    </div>
  );
}

function CustomTreatModal({ open, onClose, xp }: { open: boolean; onClose: () => void; xp: number }) {
  const [icon, setIcon] = useState('💝');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [requiredXP, setRequiredXP] = useState(500);

  const save = async () => {
    if (!title.trim()) return;
    const id = `custom-${Date.now().toString(36)}`;
    await db.partnerTreats.put({
      id,
      title: title.trim(),
      description: desc.trim() || 'A custom couple reward',
      requiredXP: Math.max(0, requiredXP),
      icon,
      isCustom: true,
      isUnlocked: xp >= requiredXP,
      isRedeemed: false
    });
    setTitle('');
    setDesc('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Build a custom treat coupon">
      <div className="space-y-3">
        <div className="flex gap-2">
          {['💝', '🎂', '🍦', '🛍️', '🚗', '🎮'].map((e) => (
            <button key={e} onClick={() => setIcon(e)} className={`chip px-3 ${icon === e ? 'chip-active' : ''}`}>
              {e}
            </button>
          ))}
        </div>
        <div>
          <p className="label">Title</p>
          <input className="input" placeholder="e.g. Sunday breakfast in bed" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <p className="label">Description</p>
          <input className="input" placeholder="What does this reward mean?" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div>
          <p className="label">Unlocks at XP: {requiredXP.toLocaleString()}</p>
          <input type="range" min={0} max={20000} step={100} value={requiredXP} onChange={(e) => setRequiredXP(Number(e.target.value))} className="w-full" />
        </div>
        <button className="btn-primary w-full" onClick={() => void save()}>
          Add coupon
        </button>
      </div>
    </Modal>
  );
}
