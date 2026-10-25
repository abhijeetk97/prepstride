import { useEffect, useState } from 'react';
import { db, setDailyTarget } from '../../db';
import { loadOptionalTemplate } from '../../db/seed';
import { OPTIONAL_TEMPLATES } from '../../data/optionals';
import { Modal } from '../common';
import { Pip } from '../mascot/Pip';

const TARGETS = [120, 180, 240, 360];

/** Three-step first run: names, optional, daily target. Skip keeps current defaults. */
export function OnboardingModal({ open, onDone }: { open: boolean; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [aspirant, setAspirant] = useState('');
  const [partner, setPartner] = useState('');
  const [optionalKey, setOptionalKey] = useState<string | null>(null);
  const [target, setTarget] = useState(240);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setAspirant('');
    setPartner('');
    setOptionalKey(null);
    setTarget(240);
  }, [open]);

  const skip = async () => {
    setBusy(true);
    try {
      await db.settings.update('current_settings', { onboardedAt: new Date().toISOString() });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      const s = await db.settings.get('current_settings');
      if (s) {
        await db.settings.put({
          ...s,
          aspirantName: aspirant.trim() || s.aspirantName,
          partnerName: partner.trim() || s.partnerName,
          onboardedAt: new Date().toISOString()
        });
      }
      await setDailyTarget(target);
      if (optionalKey) {
        const tmpl = OPTIONAL_TEMPLATES.find((t) => t.key === optionalKey);
        if (tmpl) await loadOptionalTemplate(tmpl.key, tmpl.name);
      }
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={() => void skip()} title={step === 0 ? 'Welcome' : step === 1 ? 'Optional subject' : 'Daily target'}>
      <div className="flex flex-col items-center gap-3 text-center">
        <Pip mood="wave" size={72} />
        {step === 0 && (
          <>
            <p className="text-sm text-ink">What should Pip call you, and the person who gets the daily digest?</p>
            <div className="w-full space-y-3 text-left">
              <div>
                <p className="label">Your name</p>
                <input className="input" placeholder="Leave blank to keep Champion" value={aspirant} onChange={(e) => setAspirant(e.target.value)} />
              </div>
              <div>
                <p className="label">Partner's name</p>
                <input className="input" placeholder="Leave blank to keep Partner" value={partner} onChange={(e) => setPartner(e.target.value)} />
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="text-sm text-ink">Load an optional syllabus now, or decide later. You can change this in Syllabus.</p>
            <div className="max-h-52 w-full space-y-2 overflow-y-auto text-left">
              <button
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold ${optionalKey === null ? 'border-brand bg-brandsoft/40' : 'border-line'}`}
                onClick={() => setOptionalKey(null)}
              >
                Decide later
              </button>
              {OPTIONAL_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left ${optionalKey === t.key ? 'border-brand bg-brandsoft/40' : 'border-line'}`}
                  onClick={() => setOptionalKey(t.key)}
                >
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-[11px] text-inksoft">{t.popularity}</p>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-sm text-ink">A humane daily target. 4 hours is the default — it can change any day.</p>
            <div className="flex w-full flex-wrap justify-center gap-2">
              {TARGETS.map((m) => (
                <button key={m} className={`chip px-4 py-2 ${target === m ? 'chip-active' : ''}`} onClick={() => setTarget(m)}>
                  {m / 60}h
                </button>
              ))}
            </div>
          </>
        )}
        <div className="mt-1 flex w-full gap-2">
          {step < 2 ? (
            <button className="btn-primary flex-1 py-3" disabled={busy} onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn-primary flex-1 py-3" disabled={busy} onClick={() => void finish()}>
              Start prep
            </button>
          )}
          <button className="btn-ghost px-4" disabled={busy} onClick={() => void skip()}>
            Skip
          </button>
        </div>
      </div>
    </Modal>
  );
}
