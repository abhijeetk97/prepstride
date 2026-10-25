import { useRef, useState } from 'react';
import { Settings as SettingsIcon, Palette, Download, Upload, Check, Volume2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { db } from '../db';
import { exportBackup, restoreBackup } from '../db/backup';
import { SectionCard } from '../components/common';
import { LEVEL_THRESHOLDS } from '../utils/gamification';
import type { ThemeName } from '../types';

const THEMES: { id: ThemeName; label: string; emoji: string; note: string; unlockLevel: number }[] = [
  { id: 'warm-paper', label: 'Warm Parchment', emoji: '📜', note: 'Sepia reader', unlockLevel: 1 },
  { id: 'midnight', label: 'Old Rajinder Nagar Midnight', emoji: '🌙', note: 'Focus dark', unlockLevel: 1 },
  { id: 'mussoorie-mist', label: 'Mussoorie Mist', emoji: '🌲', note: 'Forest calm', unlockLevel: 3 },
  { id: 'zen-forest', label: 'Zen Forest', emoji: '🍃', note: 'Deep green', unlockLevel: 4 },
  { id: 'lbsnaa-gold', label: 'LBSNAA Gold', emoji: '🏅', note: 'Celebratory', unlockLevel: 5 }
];

export function SettingsScreen({ data }: { data: AppData }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const s = data.settings;

  const patch = async (partial: Partial<typeof s>) => {
    await db.settings.put({ ...s, ...partial });
  };

  const onRestoreFile = async (file: File) => {
    setRestoreMsg('Restoring…');
    try {
      const result = await restoreBackup(file);
      setRestoreMsg(`✅ Restored ${result.rows} records across ${result.tables} tables.`);
    } catch (e) {
      setRestoreMsg(`❌ ${(e as Error).message}`);
    }
  };

  return (
    <div className="px-4 pt-safe">
      <header className="pb-3 pt-4">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-ink">
          <SettingsIcon size={20} /> Settings & Data
        </h1>
      </header>

      {/* Exam & identity */}
      <SectionCard title="Exam & you" className="mb-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Your name</p>
              <input className="input" value={s.aspirantName} onChange={(e) => void patch({ aspirantName: e.target.value })} />
            </div>
            <div>
              <p className="label">Partner's name</p>
              <input className="input" value={s.partnerName} onChange={(e) => void patch({ partnerName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Target year</p>
              <input type="number" className="input" value={s.targetYear} onChange={(e) => void patch({ targetYear: Number(e.target.value) })} />
            </div>
            <div>
              <p className="label">Prelims date</p>
              <input type="date" className="input" value={s.examDate ?? ''} onChange={(e) => void patch({ examDate: e.target.value || undefined })} />
            </div>
          </div>
          <div>
            <p className="label">Daily target: {s.defaultDailyTargetMinutes / 60} hours</p>
            <input
              type="range"
              min={120}
              max={720}
              step={30}
              value={s.defaultDailyTargetMinutes}
              onChange={(e) => void patch({ defaultDailyTargetMinutes: Number(e.target.value) })}
              className="w-full"
            />
            <p className="text-[10px] text-inksoft">Applies to new days (today's target can be changed on the Dashboard).</p>
          </div>
        </div>
      </SectionCard>

      {/* Timer */}
      <SectionCard title="Timer defaults" className="mb-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Focus (min)</p>
            <input
              type="number"
              className="input"
              value={s.timerSettings.workDuration}
              onChange={(e) => void patch({ timerSettings: { ...s.timerSettings, workDuration: Math.max(5, Math.min(180, Number(e.target.value))) } })}
            />
          </div>
          <div>
            <p className="label">Break (min)</p>
            <input
              type="number"
              className="input"
              value={s.timerSettings.breakDuration}
              onChange={(e) => void patch({ timerSettings: { ...s.timerSettings, breakDuration: Math.max(1, Math.min(90, Number(e.target.value))) } })}
            />
          </div>
        </div>
        <button
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-surface2 px-3 py-2.5"
          onClick={() => void patch({ timerSettings: { ...s.timerSettings, soundEnabled: !s.timerSettings.soundEnabled } })}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Volume2 size={16} /> Zen chime on session end
          </span>
          <span className={`h-6 w-11 rounded-full p-0.5 transition-colors ${s.timerSettings.soundEnabled ? 'bg-brand' : 'bg-line'}`}>
            <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${s.timerSettings.soundEnabled ? 'translate-x-5' : ''}`} />
          </span>
        </button>
      </SectionCard>

      {/* Themes */}
      <SectionCard title="Appearance" icon={<Palette size={14} />} className="mb-3">
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const rankUnlocked = t.unlockLevel <= 1 || data.xp.total >= LEVEL_THRESHOLDS[t.unlockLevel - 1].minXP;
            const active = s.theme === t.id;
            return (
              <button
                key={t.id}
                disabled={!rankUnlocked}
                onClick={() => void patch({ theme: t.id })}
                className={`rounded-xl border p-3 text-left transition-colors ${active ? 'border-brand bg-brandsoft/40' : 'border-line'} ${rankUnlocked ? '' : 'opacity-40'}`}
              >
                <p className="text-lg">{t.emoji}</p>
                <p className="text-xs font-bold text-ink">{t.label}</p>
                <p className="text-[10px] text-inksoft">{rankUnlocked ? t.note : `Unlocks at Rank ${t.unlockLevel}`}</p>
                {active && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-brand">
                    <Check size={11} /> active
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Data sovereignty */}
      <SectionCard title="Backup & restore" icon={<Download size={14} />} className="mb-6">
        <p className="mb-3 text-[11px] text-inksoft">
          Everything lives in this browser (IndexedDB). Export weekly and keep a copy in Google Drive — restore works on any device.
        </p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => void exportBackup()}>
            <Download size={15} /> Export JSON
          </button>
          <button className="btn-ghost flex-1" onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Restore
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onRestoreFile(f);
            e.target.value = '';
          }}
        />
        {restoreMsg && <p className="mt-2 rounded-lg bg-surface2 px-3 py-2 text-center text-xs font-semibold text-ink">{restoreMsg}</p>}
        <p className="mt-2 text-center text-[10px] text-inksoft">
          Restore replaces all current data. Pip guards it with a full transaction — zero partial states.
        </p>
      </SectionCard>
    </div>
  );
}
