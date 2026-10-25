import { SUBJECT_META, type AppSettings, type DailyRecord, type DailyRituals, type PartnerTreat, type SubjectCategory, type TimeLog } from '../types';
import { formatDateLong, formatMinutes } from './dates';
import { quoteOfTheDay } from '../data/seedData';

export interface DigestData {
  date: string;
  totalMinutes: number;
  targetMinutes: number;
  logs: TimeLog[];
  rituals: DailyRituals;
  record?: DailyRecord;
  streak: number;
}

const ENERGY_LABELS = ['', '😴 Running on fumes', '😪 Tired but pushing', '🙂 Steady', '💪 Strong', '🔥 High Focus'];

/** "Polity & Governance (GS2)" — the paper name, then the short code. */
export function subjectShareLabel(subject: SubjectCategory): string {
  const meta = SUBJECT_META[subject];
  const name = meta.label.includes('·') ? meta.label.split('·').slice(1).join('·').trim() : meta.label;
  return `${name} (${meta.short})`;
}

export function buildDigestText(d: DigestData, settings: AppSettings): string {
  const subjects = d.logs.map((l) => {
    const label = subjectShareLabel(l.subject);
    return l.topic ? `${label} — ${l.topic}` : label;
  });

  const ritualBits: string[] = [];
  if (d.rituals.newspaperRead) ritualBits.push('Newspaper ✓');
  if (d.rituals.editorialNotes) ritualBits.push('Editorial notes ✓');
  if (d.rituals.mcqsCompleted > 0) ritualBits.push(`${d.rituals.mcqsCompleted} MCQs ✓`);
  if (d.rituals.answersWritten > 0) ritualBits.push(`${d.rituals.answersWritten} answers written ✓`);
  if (d.rituals.csatPracticed) ritualBits.push('CSAT drill ✓');
  if (d.rituals.currentAffairsMag) ritualBits.push('CA magazine ✓');

  const energy = d.record?.energyRating ? ENERGY_LABELS[d.record.energyRating] : '';

  const lines = [
    `🕊️ PrepStride Daily Digest — ${formatDateLong(d.date)}`,
    '',
    `⏳ Studied: ${formatMinutes(d.totalMinutes)} / ${formatMinutes(d.targetMinutes)} target`,
    `📚 ${subjects.length > 0 ? subjects.join('\n') : 'Subjects: rest day'}`,
    ritualBits.length > 0 ? `✅ Rituals: ${ritualBits.join(' · ')}` : '🌱 Rituals: fresh start tomorrow',
    d.streak > 0 ? `🔥 Streak: ${d.streak} day${d.streak > 1 ? 's' : ''}` : '',
    energy ? `⚡ Energy: ${energy}` : '',
    d.record?.reflection ? `📝 "${d.record.reflection}"` : '',
    '',
    `💛 "${quoteOfTheDay(d.date)}"`,
    `— ${settings.aspirantName || 'you'}, for ${settings.partnerName || 'you'} · PrepStride 🐦`
  ];
  return lines.filter((l) => l !== '').join('\n');
}

export async function shareDailyDigest(cardBlob: Blob, textSummary: string): Promise<'shared' | 'copied'> {
  const file = new File([cardBlob], 'prepstride-day.png', { type: 'image/png' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ title: 'PrepStride Daily Summary', text: textSummary, files: [file] });
      return 'shared';
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(textSummary);
  } catch {
    /* clipboard may need permission; still open WhatsApp */
  }
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textSummary)}`;
  window.open(whatsappUrl, '_blank');
  return 'copied';
}

/** Treat copy uses the names from setup. Seeded rows keep their ids, so this fixes already-saved coupons too. */
export function treatBlurb(treat: { id: string; description: string }, aspirantName: string, partnerName: string): string {
  const who = aspirantName.trim() || 'you';
  const partner = partnerName.trim() || 'your partner';
  if (treat.id === 'chefs_special') return `${partner} cooks ${who}'s favorite dinner.`;
  if (treat.id === 'book_spree') return `A shopping spree for ${who}, on ${partner}.`;
  return treat.description;
}

export async function redeemPartnerTreat(treat: PartnerTreat, aspirantName: string, partnerName = ''): Promise<void> {
  const blurb = treatBlurb(treat, aspirantName, partnerName);
  const message = `🎉 PrepStride Milestone Reward!\n\n${aspirantName} just redeemed the reward coupon: "${treat.title}" (${blurb})! ❤️\nLooking forward to celebrating this milestone together!\n\n— Pip 🐦✨`;
  const shareData = { title: 'PrepStride Treat Redeemed!', text: message };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch {
      /* fall through to WhatsApp */
    }
  }
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

/** Gentle Tibetan-singing-bowl-style chime via WebAudio (no asset needed). */
export function playChime(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [432, 648].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.28 : 0.16, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    });
    setTimeout(() => ctx.close(), 3000);
  } catch {
    /* audio not available — silent is fine */
  }
}
