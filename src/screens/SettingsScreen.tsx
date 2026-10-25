import { useRef, useState } from 'react';
import { Settings as SettingsIcon, Palette, Download, Upload, Check, Volume2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { DAILY_TARGET_MAX, DAILY_TARGET_MIN, DAILY_TARGET_STEP, db, setDailyTarget } from '../db';
import { applyBackup, exportBackup } from '../db/backup';
import { Modal, SectionCard, showToast } from '../components/common';
import { formatDateShort } from '../utils/dates';
import { parseBackupText, summarizeBackup, type BackupPreview } from '../utils/backupParse';
import type { ThemeName } from '../types';

const THEMES: { id: ThemeName; label: string; emoji: string; note: string }[] = [
  { id: 'warm-paper', label: 'Warm Parchment', emoji: '📜', note: 'Sepia reader' },
  { id: 'midnight', label: 'Old Rajinder Nagar Midnight', emoji: '🌙', note: 'Focus dark' },
  { id: 'mussoorie-mist', label: 'Mussoorie Mist', emoji: '🌲', note: 'Forest calm' },
  { id: 'zen-forest', label: 'Zen Forest', emoji: '🍃', note: 'Deep green' },
  { id: 'lbsnaa-gold', label: 'LBSNAA Gold', emoji: '🏅', note: 'Celebratory' }
];

export function SettingsScreen({ data, onRunSetup }: { data: AppData; onRunSetup: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const s = data.settings;

  const patch = async (partial: Partial<typeof s>) => {
    await db.settings.put({ ...s, ...partial });
  };

  const onRestoreFile = async (file: File) => {
    try {
      const preview = summarizeBackup(parseBackupText(await file.text()), file.name);
      setPending(preview);
    } catch (e) {
      showToast({ message: (e as Error).message });
    }
  };

  const confirmRestore = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const result = await applyBackup(pending.payload);
      setPending(null);
      showToast({ message: `Restored ${result.rows} records across ${result.tables} tables.` });
    } catch (e) {
      showToast({ message: (e as Error).message });
    } finally {
      setBusy(false);
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
              <p className="label">Expected prelims date</p>
              <input type="date" className="input" value={s.examDate ?? ''} onChange={(e) => void patch({ examDate: e.target.value || undefined })} />
            </div>
            <div className="col-span-2">
              <p className="label">Official prelims date</p>
              <input
                type="date"
                className="input"
                value={s.officialExamDate ?? ''}
                onChange={(e) => void patch({ officialExamDate: e.target.value || undefined })}
              />
              <p className="mt-1 text-[10px] text-inksoft">Leave this blank until the notification. The countdown stays “expected” until then.</p>
            </div>
          </div>
          <div>
            <p className="label">Daily target: {s.defaultDailyTargetMinutes / 60} hours</p>
            <input
              type="range"
              min={DAILY_TARGET_MIN}
              max={Math.max(DAILY_TARGET_MAX, s.defaultDailyTargetMinutes)}
              step={DAILY_TARGET_STEP}
              value={s.defaultDailyTargetMinutes}
              onChange={(e) => void setDailyTarget(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[10px] text-inksoft">Applies right away, including today. Home chips use this same 2–10h range.</p>
          </div>
          <button className="btn-ghost w-full" onClick={onRunSetup}>
            Run setup again
          </button>
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
            const active = s.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => void patch({ theme: t.id })}
                className={`min-h-11 rounded-xl border p-3 text-left transition-colors ${active ? 'border-brand bg-brandsoft/40' : 'border-line'}`}
              >
                <p className="text-lg">{t.emoji}</p>
                <p className="text-xs font-bold text-ink">{t.label}</p>
                <p className="text-[10px] text-inksoft">{t.note}</p>
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
      <SectionCard title="Backup & restore" icon={<Download size={14} />} className="mb-16">
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
        <p className="mt-2 text-center text-[10px] text-inksoft">Nothing is replaced until you confirm the summary.</p>
      </SectionCard>

      <Modal open={pending !== null} onClose={() => !busy && setPending(null)} title="Replace all data?">
        {pending && (
          <div className="space-y-3">
            <p className="text-sm text-ink">
              {pending.sessions} sessions · {pending.tests} tests · {pending.mistakes} mistakes · {pending.syllabus} syllabus items
            </p>
            <p className="text-xs text-inksoft">
              {pending.from && pending.to ? `${formatDateShort(pending.from)} – ${formatDateShort(pending.to)}` : 'No dated records'} · {pending.filename}
            </p>
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" disabled={busy} onClick={() => setPending(null)}>
                Cancel
              </button>
              <button className="btn-danger flex-1" disabled={busy} onClick={() => void confirmRestore()}>
                Replace all data
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
