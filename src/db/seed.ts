import { db, DEFAULT_SETTINGS } from './index';
import { buildSyllabusItems } from '../data/syllabus';
import { BADGE_DEFS, DEFAULT_RESOURCES, DEFAULT_TREATS } from '../data/seedData';
import { emptyRituals, type SyllabusItem } from '../types';
import { todayISO } from '../utils/dates';

const SEED_FLAG = 'prepstride_seeded_v1';

/** Idempotent first-run seeding: syllabus, books, badges, treats, settings. */
export async function seedIfEmpty(): Promise<void> {
  if (localStorage.getItem(SEED_FLAG)) return;

  await db.transaction(
    'rw',
    [db.settings, db.syllabusItems, db.resources, db.badges, db.partnerTreats, db.dailyRituals, db.gamification],
    async () => {
      const settingsCount = await db.settings.count();
      if (settingsCount === 0) {
        await db.settings.put(DEFAULT_SETTINGS);
        await db.dailyRituals.put(emptyRituals(todayISO()));
        await db.gamification.put({
          id: 'current_gamification',
          streakShields: 0,
          unlockedThemes: ['warm-paper', 'midnight']
        });
      }

      if ((await db.syllabusItems.count()) === 0) {
        await db.syllabusItems.bulkPut(buildSyllabusItems());
      }
      if ((await db.resources.count()) === 0) {
        await db.resources.bulkAdd(DEFAULT_RESOURCES);
      }
      if ((await db.badges.count()) === 0) {
        await db.badges.bulkPut(BADGE_DEFS);
      }
      if ((await db.partnerTreats.count()) === 0) {
        await db.partnerTreats.bulkPut(DEFAULT_TREATS);
      }
    }
  );

  localStorage.setItem(SEED_FLAG, '1');
}

/** Load an optional subject template into the syllabus (replaces prior optional items). */
export async function loadOptionalTemplate(templateKey: string, subjectName: string): Promise<number> {
  const { buildOptionalItems } = await import('../data/optionals');
  const items = buildOptionalItems(templateKey);
  if (items.length === 0) return 0;
  await db.transaction('rw', [db.syllabusItems, db.settings], async () => {
    const old = await db.syllabusItems.where('paper').anyOf(['OPTIONAL_P1', 'OPTIONAL_P2']).toArray();
    await db.syllabusItems.bulkDelete(old.map((i: SyllabusItem) => i.id));
    await db.syllabusItems.bulkPut(items);
    const s = await db.settings.get('current_settings');
    if (s) {
      await db.settings.put({ ...s, optionalSubjectName: subjectName, optionalTemplateLoaded: templateKey });
    }
  });
  return items.length;
}

/** Add a single custom micro-topic. */
export async function addCustomTopic(paper: SyllabusItem['paper'], category: string, microTopic: string): Promise<void> {
  const id = `custom-${paper.toLowerCase()}-${Date.now().toString(36)}`;
  await db.syllabusItems.put({
    id,
    paper,
    category,
    microTopic,
    status: 'not_started',
    revisionCount: 0,
    sortOrder: Date.now(),
    priority: 'medium',
    isCustom: true
  });
}
