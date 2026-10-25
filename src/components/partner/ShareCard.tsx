import type { AppSettings } from '../../types';
import { subjectShareLabel, type DigestData } from '../../utils/share';
import { formatDateLong, formatMinutes } from '../../utils/dates';
import { quoteOfTheDay } from '../../data/seedData';

const ENERGY_EMOJI = ['', '😴', '😪', '🙂', '💪', '🔥'];
const ENERGY_LABEL = ['', 'Exhausted but proud', 'Tired but steady', 'Calm & steady', 'Strong & focused', 'High Focus'];

/**
 * The 1-Tap Partner Daily Summary card (rendered offscreen, converted to PNG
 * via html-to-image — zero backend, PRD Module 9).
 */
export function ShareCard({ digest, settings }: { digest: DigestData; settings: AppSettings }) {
  const sessions = digest.logs;

  const ritualBits: string[] = [];
  if (digest.rituals.newspaperRead) ritualBits.push('The Hindu ✓');
  if (digest.rituals.editorialNotes) ritualBits.push('Editorial notes ✓');
  if (digest.rituals.mcqsCompleted > 0) ritualBits.push(`${digest.rituals.mcqsCompleted} MCQs ✓`);
  if (digest.rituals.answersWritten > 0) ritualBits.push(`${digest.rituals.answersWritten} answers ✓`);
  if (digest.rituals.csatPracticed) ritualBits.push('CSAT drill ✓');
  if (digest.rituals.currentAffairsMag) ritualBits.push('CA magazine ✓');

  const energy = digest.record?.energyRating ?? 0;
  const goalMet = digest.totalMinutes >= digest.targetMinutes;

  return (
    <div
      id="share-card"
      style={{
        width: 640,
        backgroundColor: '#FBF9F5',
        borderRadius: 28,
        padding: 36,
        fontFamily: 'Georgia, Cambria, serif',
        color: '#2E2A26',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, letterSpacing: 2, fontWeight: 700, color: '#8A7B68', textTransform: 'uppercase' }}>🕊️ PrepStride Daily Digest</p>
          <p style={{ margin: '4px 0 0', fontSize: 19, fontWeight: 700 }}>{formatDateLong(digest.date)}</p>
        </div>
        <div style={{ position: 'relative', width: 104, height: 104 }}>
          {/* Pip as the Daily Share Ambassador with cheer flag */}
          <img src="assets/mascot.png" width={104} height={104} style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }} alt="Pip" />
          <span style={{ position: 'absolute', right: -8, top: -6, fontSize: 26 }}>🚩</span>
        </div>
      </div>

      {/* Hours hero */}
      <div
        style={{
          background: goalMet ? 'linear-gradient(135deg,#F7E2BB,#F4C878)' : 'linear-gradient(135deg,#EFE9DD,#E7DEC9)',
          borderRadius: 20,
          padding: '22px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{formatMinutes(digest.totalMinutes)}</p>
          <p style={{ margin: '6px 0 0', fontSize: 15, color: '#6B5F4E' }}>of {formatMinutes(digest.targetMinutes)} target {goalMet ? '· crushed! 🎉' : ''}</p>
        </div>
        {digest.streak > 0 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 30 }}>🔥</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{digest.streak}-day streak</p>
          </div>
        )}
      </div>

      {/* Subjects */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#8A7B68' }}>Subjects tackled</p>
        {sessions.length === 0 ? (
          <p style={{ margin: 0, fontSize: 17 }}>Rest day 🌱</p>
        ) : (
          sessions.map((l, i) => (
            <p key={l.id ?? i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: 17, lineHeight: 1.35 }}>
              {subjectShareLabel(l.subject)}
              {l.topic ? <span style={{ display: 'block', fontSize: 15, color: '#6B5F4E' }}>{l.topic}</span> : null}
            </p>
          ))
        )}
      </div>

      {/* Rituals */}
      {ritualBits.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#8A7B68' }}>Rituals completed</p>
          <p style={{ margin: 0, fontSize: 17 }}>{ritualBits.join(' · ')}</p>
        </div>
      )}

      {/* Energy */}
      {energy > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#8A7B68' }}>Energy</p>
          <p style={{ margin: 0, fontSize: 17 }}>
            {ENERGY_EMOJI[energy]} {ENERGY_LABEL[energy]}
          </p>
        </div>
      )}

      {/* Reflection */}
      {digest.record?.reflection && (
        <div style={{ background: '#F1EAE0', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic' }}>“{digest.record.reflection}”</p>
        </div>
      )}

      {/* Quote + footer */}
      <div style={{ borderTop: '2px dashed #D8CDB8', paddingTop: 14, textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', fontSize: 15, fontStyle: 'italic' }}>“{quoteOfTheDay(digest.date)}”</p>
        <p style={{ margin: 0, fontSize: 13, color: '#8A7B68' }}>
          With love, {settings.aspirantName} · sent via PrepStride for {settings.partnerName} 💛
        </p>
      </div>
    </div>
  );
}
