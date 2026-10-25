import { useCallback, useEffect, useState } from 'react';
import { useAppData } from './hooks/useAppData';
import { db, DEFAULT_SETTINGS } from './db';
import { seedIfEmpty } from './db/seed';
import { exportBackup } from './db/backup';
import { emptyRituals } from './types';
import { evaluateBadges } from './utils/gamification';
import { todayISO } from './utils/dates';
import { BottomNav } from './components/layout/BottomNav';
import { TimerBar } from './components/timer/TimerBar';
import { Modal } from './components/common';
import { Pip } from './components/mascot/Pip';
import { DashboardScreen } from './screens/DashboardScreen';
import { TimesheetScreen } from './screens/TimesheetScreen';
import { SyllabusScreen } from './screens/SyllabusScreen';
import { TestsScreen } from './screens/TestsScreen';
import { MoreScreen } from './screens/MoreScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export type Route =
  | 'home'
  | 'study'
  | 'syllabus'
  | 'tests'
  | 'more'
  | 'rewards'
  | 'analytics'
  | 'settings';

const VALID_ROUTES: Route[] = ['home', 'study', 'syllabus', 'tests', 'more', 'rewards', 'analytics', 'settings'];

function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  return (VALID_ROUTES as string[]).includes(h) ? (h as Route) : 'home';
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [showBackupNudge, setShowBackupNudge] = useState(false);
  const data = useAppData();

  const navigate = useCallback((r: Route) => {
    window.location.hash = `/${r}`;
    setRoute(r);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // First-run seed
  useEffect(() => {
    void seedIfEmpty().then(() => setReady(true));
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', data.settings.theme === 'midnight' || data.settings.theme === 'zen-forest' ? '#16171B' : '#FBF9F5');
  }, [data.settings.theme]);

  // Daily rollover: ensure today's record + rituals exist
  useEffect(() => {
    if (!ready) return;
    const ensure = async () => {
      const today = todayISO();
      await db.transaction('rw', [db.dailyRecords, db.dailyRituals, db.settings], async () => {
        if (!(await db.dailyRecords.get(today))) {
          const s = await db.settings.get('current_settings');
          await db.dailyRecords.put({ date: today, targetMinutes: s?.defaultDailyTargetMinutes ?? 480 });
        }
        if (!(await db.dailyRituals.get(today))) {
          await db.dailyRituals.put(emptyRituals(today));
        }
      });
    };
    void ensure();
    const interval = setInterval(() => void ensure(), 60_000);
    return () => clearInterval(interval);
  }, [ready, route]);

  // Badge engine: stamp unlockedAt when a badge is first earned
  useEffect(() => {
    if (data.loading) return;
    let cancelled = false;
    void (async () => {
      const rituals = await db.dailyRituals.toArray();
      if (cancelled) return;
      const result = evaluateBadges({
        timeLogs: data.timeLogs,
        rituals,
        records: data.dailyRecords,
        syllabus: data.syllabus,
        mocks: data.mocks,
        resources: data.resources
      });
      const updates = data.badges
        .filter((b) => !b.unlockedAt && result[b.id])
        .map((b) => ({ ...b, unlockedAt: new Date().toISOString() }));
      if (updates.length > 0) await db.badges.bulkPut(updates);
    })();
    return () => {
      cancelled = true;
    };
  }, [data.loading, data.badges, data.timeLogs, data.dailyRecords, data.syllabus, data.mocks, data.resources]);

  // Treat unlock engine
  useEffect(() => {
    if (data.loading) return;
    const updates = data.treats
      .filter((t) => !t.isUnlocked && data.xp.total >= t.requiredXP)
      .map((t) => ({ ...t, isUnlocked: true }));
    if (updates.length > 0) void db.partnerTreats.bulkPut(updates);
  }, [data.loading, data.treats, data.xp.total]);

  // Persist derived shield count for the sleeping-Pip banner
  useEffect(() => {
    if (data.loading || !data.gamification) return;
    if (data.gamification.streakShields !== data.streak.shields) {
      void db.gamification.put({ ...data.gamification, streakShields: data.streak.shields });
    }
  }, [data.loading, data.gamification, data.streak.shields]);

  // Gentle weekly backup nudge
  useEffect(() => {
    if (!ready || data.loading) return;
    const last = Number(localStorage.getItem('prepstride_last_backup') ?? 0);
    const weekMs = 7 * 86_400_000;
    if (data.timeLogs.length > 3 && Date.now() - last > weekMs) {
      const dismissedAt = Number(sessionStorage.getItem('prepstride_backup_nudge') ?? 0);
      if (Date.now() - dismissedAt > 6 * 3600_000) setShowBackupNudge(true);
    }
  }, [ready, data.loading, data.timeLogs.length]);

  if (!ready || data.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
        <Pip mood="wave" size={110} />
        <p className="text-sm font-semibold text-inksoft">PrepStride is waking Pip up…</p>
      </div>
    );
  }

  const screen = (() => {
    switch (route) {
      case 'home':
        return <DashboardScreen data={data} navigate={navigate} />;
      case 'study':
        return <TimesheetScreen data={data} />;
      case 'syllabus':
        return <SyllabusScreen data={data} />;
      case 'tests':
        return <TestsScreen data={data} />;
      case 'more':
        return <MoreScreen data={data} navigate={navigate} />;
      case 'rewards':
        return <RewardsScreen data={data} />;
      case 'analytics':
        return <AnalyticsScreen data={data} />;
      case 'settings':
        return <SettingsScreen data={data} />;
      default:
        return <DashboardScreen data={data} navigate={navigate} />;
    }
  })();

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-paper pb-24">
      {screen}
      <TimerBar />
      <BottomNav route={route} navigate={navigate} />

      <Modal open={showBackupNudge} onClose={() => { setShowBackupNudge(false); sessionStorage.setItem('prepstride_backup_nudge', String(Date.now())); }} title="Weekly backup nudge 🕊️">
        <div className="flex flex-col items-center gap-3 text-center">
          <Pip mood="sleep" size={80} />
          <p className="text-sm text-ink">
            Pip gently reminds you: it has been over a week since your last backup. Keep your months of hard work
            safe — export a JSON copy to your device or Google Drive.
          </p>
          <div className="flex w-full gap-2">
            <button
              className="btn-primary flex-1"
              onClick={async () => {
                await exportBackup();
                setShowBackupNudge(false);
              }}
            >
              Backup now
            </button>
            <button
              className="btn-ghost flex-1"
              onClick={() => {
                setShowBackupNudge(false);
                sessionStorage.setItem('prepstride_backup_nudge', String(Date.now()));
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
