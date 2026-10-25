import { useEffect, useState } from 'react';
import { Modal } from '../common';
import { timerEngine } from '../../hooks/useTimer';
import type { AppSettings, SubjectCategory } from '../../types';
import { SUBJECT_META } from '../../types';

const SUBJECTS = Object.keys(SUBJECT_META) as SubjectCategory[];

/** Choose mode + subject + topic, then hand off to the persistent TimerEngine. */
export function TimerStartModal({
  open,
  onClose,
  settings
}: {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
}) {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [subject, setSubject] = useState<SubjectCategory>('GS2');
  const [topic, setTopic] = useState('');
  const [workMin, setWorkMin] = useState(settings.timerSettings.workDuration);
  const [breakMin, setBreakMin] = useState(settings.timerSettings.breakDuration);

  useEffect(() => {
    if (open) {
      setWorkMin(settings.timerSettings.workDuration);
      setBreakMin(settings.timerSettings.breakDuration);
    }
  }, [open, settings.timerSettings]);

  const start = () => {
    timerEngine.start({
      mode,
      subject,
      topic: topic.trim(),
      workMin,
      breakMin,
      soundEnabled: settings.timerSettings.soundEnabled
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Start a focus session">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMode('pomodoro')} className={`chip justify-center py-2.5 ${mode === 'pomodoro' ? 'chip-active' : ''}`}>
            🍅 Pomodoro
          </button>
          <button onClick={() => setMode('stopwatch')} className={`chip justify-center py-2.5 ${mode === 'stopwatch' ? 'chip-active' : ''}`}>
            ⏱️ Stopwatch
          </button>
        </div>

        {mode === 'pomodoro' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Focus (min)</p>
              <input type="number" min={10} max={120} className="input" value={workMin} onChange={(e) => setWorkMin(Math.max(5, Math.min(180, Number(e.target.value))))} />
            </div>
            <div>
              <p className="label">Break (min)</p>
              <input type="number" min={5} max={60} className="input" value={breakMin} onChange={(e) => setBreakMin(Math.max(1, Math.min(90, Number(e.target.value))))} />
            </div>
          </div>
        )}

        <div>
          <p className="label">Subject</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`chip ${subject === s ? 'chip-active' : ''}`}
                style={subject === s ? { backgroundColor: SUBJECT_META[s].color } : { borderColor: SUBJECT_META[s].color + '55' }}
              >
                {SUBJECT_META[s].short}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">Topic (optional)</p>
          <input className="input" placeholder="e.g. Spectrum — Swadeshi Movement" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>

        <button className="btn-primary w-full py-3" onClick={start}>
          {mode === 'pomodoro' ? `Start ${workMin}/${breakMin} cycle` : 'Start stopwatch'}
        </button>
        <p className="text-center text-[11px] text-inksoft">
          Timer keeps running accurately even if you switch apps or lock the screen. Each completed focus block auto-saves.
        </p>
      </div>
    </Modal>
  );
}
