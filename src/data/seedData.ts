import type { Badge, PartnerTreat, ResourceItem } from '../types';

// ─── Standard Reference Booklist (PRD Module 8) ─────────────────────────────
export const DEFAULT_RESOURCES: ResourceItem[] = [
  { title: 'Indian Polity — M. Laxmikanth', subject: 'Polity', totalChapters: 75, completedChapters: 0, currentRevision: 0 },
  { title: 'Modern Indian History — Spectrum (Rajiv Ahir)', subject: 'Modern History', totalChapters: 42, completedChapters: 0, currentRevision: 0 },
  { title: 'Environment — Shankar IAS / PMF IAS', subject: 'Environment', totalChapters: 34, completedChapters: 0, currentRevision: 0 },
  { title: 'Indian Economy — Nitin Singhania / Ramesh Singh / Mrunal', subject: 'Economy', totalChapters: 30, completedChapters: 0, currentRevision: 0 },
  { title: 'Ancient & Medieval India — RS Sharma / Satish Chandra / Old NCERTs', subject: 'Ancient & Medieval History', totalChapters: 36, completedChapters: 0, currentRevision: 0 },
  { title: 'Indian Art & Culture — Nitin Singhania', subject: 'Art & Culture', totalChapters: 26, completedChapters: 0, currentRevision: 0 },
  { title: 'Geography — Class 11 & 12 NCERTs + GC Leong', subject: 'Geography', totalChapters: 40, completedChapters: 0, currentRevision: 0 },
  { title: 'Ethics — Lexicon / Subba Rao', subject: 'Ethics (GS4)', totalChapters: 20, completedChapters: 0, currentRevision: 0 }
];

// ─── Badges of Honor (PRD Module 12.2) ──────────────────────────────────────
export const BADGE_DEFS: Badge[] = [
  {
    id: 'polity_sovereign',
    title: 'Polity Sovereign',
    description: 'Completed Revision 1, 2 and 3 for all Indian Polity (Laxmikanth) chapters.',
    category: 'revision',
    icon: '🏛️'
  },
  {
    id: 'editorial_hawk',
    title: 'Editorial Hawk',
    description: 'Maintained a 14-day continuous streak of newspaper analysis.',
    category: 'consistency',
    icon: '📰'
  },
  {
    id: 'negative_marking_tamer',
    title: 'Negative Marking Tamer',
    description: 'Achieved ≥ 75% accuracy on a full 100-question Prelims test.',
    category: 'tests',
    icon: '🎯'
  },
  {
    id: 'answer_alchemist',
    title: 'Answer Alchemist',
    description: 'Logged 25 Mains answers written and self-evaluated.',
    category: 'rituals',
    icon: '✍️'
  },
  {
    id: 'dawn_warrior',
    title: 'Dawn Warrior',
    description: 'Completed a 2-hour study session before 8:00 AM.',
    category: 'hours',
    icon: '🌅'
  },
  {
    id: 'midnight_scholar',
    title: 'Midnight Scholar',
    description: 'Logged deep study hours after 10:00 PM.',
    category: 'hours',
    icon: '🌙'
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    description: 'Logged ≥ 4 hours on a day when energy was rated 1 or 2 stars.',
    category: 'hours',
    icon: '🧘‍♀️'
  },
  {
    id: 'century_club',
    title: 'The Century Club',
    description: 'Surpassed 100 cumulative focused study hours.',
    category: 'hours',
    icon: '💯'
  }
];

// ─── Partner Treat Box defaults (PRD Module 12.5) ───────────────────────────
export const DEFAULT_TREATS: PartnerTreat[] = [
  {
    id: 'chefs_special',
    title: "Chef's Special",
    description: 'Partner cooks her favorite dinner.',
    requiredXP: 500,
    icon: '🍝',
    isCustom: false,
    isUnlocked: false,
    isRedeemed: false
  },
  {
    id: 'movie_night',
    title: 'Guilt-Free Movie & Popcorn Night',
    description: 'Movie marathon with zero exam talk.',
    requiredXP: 1000,
    icon: '🎬',
    isCustom: false,
    isUnlocked: false,
    isRedeemed: false
  },
  {
    id: 'coffee_date',
    title: 'Coffee Date / Long Drive',
    description: 'Relaxing evening decompression together.',
    requiredXP: 1500,
    icon: '☕',
    isCustom: false,
    isUnlocked: false,
    isRedeemed: false
  },
  {
    id: 'massage_treat',
    title: 'Head & Shoulder Massage',
    description: 'Relief after an intensive revision day.',
    requiredXP: 2500,
    icon: '💆‍♀️',
    isCustom: false,
    isUnlocked: false,
    isRedeemed: false
  },
  {
    id: 'book_spree',
    title: 'Stationery / Book Shopping Spree',
    description: 'Treat herself on his tab.',
    requiredXP: 4000,
    icon: '📚',
    isCustom: false,
    isUnlocked: false,
    isRedeemed: false
  },
  {
    id: 'sloth_day',
    title: 'Guilt-Free Sloth Day',
    description: 'An entire day of pure, guilt-free rest.',
    requiredXP: 7000,
    icon: '🌴',
    isCustom: false,
    isUnlocked: false,
    isRedeemed: false
  }
];

// ─── Daily motivational quotes (shown by Pip) ───────────────────────────────
export const DAILY_QUOTES: string[] = [
  'Every single page you read today brings you closer to Mussoorie!',
  'Small daily strides compound into an unstoppable journey.',
  'Consistency beats intensity — show up again today.',
  'The syllabus is vast, but so is your resolve.',
  'One focused hour is worth three distracted ones.',
  'Revision is not repetition; it is reinforcement.',
  'You are not behind. You are on your own timeline.',
  'Future officers don\u2019t wait for motivation — they build discipline.',
  'Today\u2019s notes are tomorrow\u2019s rank.',
  'Rest is part of the strategy, not a detour from it.',
  'The exam rewards calm minds and steady hands.',
  'Every mock is a rehearsal for victory.',
  'Deep work in silence; let the results make the noise.',
  'LBSNAA seats are reserved for people who keep going.',
  'Your future self is watching you study right now — make her proud.'
];

export function quoteOfTheDay(dateISO: string): string {
  let h = 0;
  for (let i = 0; i < dateISO.length; i++) h = (h * 31 + dateISO.charCodeAt(i)) >>> 0;
  return DAILY_QUOTES[h % DAILY_QUOTES.length];
}
