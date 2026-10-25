import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../common';
import { db } from '../../db';
import { SUBJECT_META, type SubjectCategory, type TimeLog } from '../../types';
import { fromISODate, todayISO } from '../../utils/dates';

const QUICK_MINUTES = [30, 45, 60, 90, 120, 180];
const SUBJECTS = Object.keys(SUBJECT_META) as SubjectCategory[];

/** Quick Retrospective Entry — the <3-second offline logger (PRD Module 1). */
export function RetroLogModal({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate?: string }) {
  const [date, setDate] = useState(defaultDate ?? todayISO());
  const [subject, setSubject] = useState<SubjectCategory>('GS2');
  const [minutes, setMinutes] = useState(60);
  const [topic, setTopic] = useState('');
  const [startClock, setStartClock] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(defaultDate ?? todayISO());
      setSaved(false);
      setTopic('');
      setStartClock('');
    }
  }, [open, defaultDate]);

  const save = async () => {
    const log: TimeLog = {
      date,
      durationMinutes: minutes,
      subject,
      topic: topic.trim(),
      mode: 'manual',
      createdAt: Date.now()
    };
    // Only store times the user actually entered — blank means "no time recorded".
    if (startClock) {
      const [hh, mm] = startClock.split(':').map(Number);
      const start = fromISODate(date);
      start.setHours(hh, mm, 0, 0);
      log.startTime = start.toISOString();
      log.endTime = new Date(start.getTime() + minutes * 60_000).toISOString();
    }
    await db.timeLogs.add(log);
    setSaved(true);
    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 650);
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick retro log">
      <div className="space-y-4">
        <div>
          <p className="label">Subject (1 tap)</p>
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
          <p className="label">Duration</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_MINUTES.map((m) => (
              <button key={m} onClick={() => setMinutes(m)} className={`chip ${minutes === m ? 'chip-active' : ''}`}>
                {m >= 60 ? `${m / 60}h` : `${m}m`}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input type="range" min={15} max={600} step={15} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="flex-1" />
            <span className="w-16 text-right text-sm font-bold tabular-nums text-ink">
              {Math.floor(minutes / 60)}h {minutes % 60}m
            </span>
          </div>
        </div>

        <div>
          <p className="label">Topic note (optional)</p>
          <input className="input" placeholder="e.g. Polity — Fundamental Rights" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>

        <div>
          <p className="label">Start time (optional)</p>
          <input
            type="time"
            className="input"
            value={startClock}
            onChange={(e) => setStartClock(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-inksoft">Leave blank if unsure — only the duration is saved, no time is guessed.</p>
        </div>

        <div>
          <p className="label">Date</p>
          <input type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </div>

        <button className="btn-primary w-full py-3" onClick={() => void save()} disabled={saved}>
          {saved ? (
            <>
              <Check size={18} /> Logged! +{Math.floor(minutes / 30) * 10} XP
            </>
          ) : (
            'Save session'
          )}
        </button>
      </div>
    </Modal>
  );
}
