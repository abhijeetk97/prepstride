import { Trophy, BarChart3, Settings as SettingsIcon, Download, Github, Heart } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import type { Route } from '../App';
import { Pip } from '../components/mascot/Pip';
import { exportBackup } from '../db/backup';
import { levelForXP } from '../utils/gamification';

export function MoreScreen({ data, navigate }: { data: AppData; navigate: (r: Route) => void }) {
  const tier = levelForXP(data.xp.total);
  const items: { route: Route; icon: React.ReactNode; title: string; sub: string }[] = [
    { route: 'rewards', icon: <Trophy size={20} className="text-brand" />, title: 'Rewards & Treat Box', sub: `Rank ${tier.level} · ${tier.title} · ${data.badges.filter((b) => b.unlockedAt).length}/${data.badges.length} badges` },
    { route: 'analytics', icon: <BarChart3 size={20} className="text-brand" />, title: 'Analytics & Books', sub: '365-day heatmap, subject split, booklist tracker' },
    { route: 'settings', icon: <SettingsIcon size={20} className="text-brand" />, title: 'Settings & Data', sub: 'Exam target, themes, backup & restore' }
  ];

  return (
    <div className="px-4 pt-safe">
      <header className="flex items-center gap-3 pb-4 pt-4">
        <Pip mood="wave" xp={data.xp.total} size={68} />
        <div>
          <h1 className="text-xl font-extrabold text-ink">More</h1>
          <p className="text-xs text-inksoft">Everything else Pip has tucked away</p>
        </div>
      </header>

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.route}>
            <button className="card flex w-full items-center gap-3 p-4 text-left active:scale-[0.99]" onClick={() => navigate(i.route)}>
              {i.icon}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{i.title}</p>
                <p className="truncate text-xs text-inksoft">{i.sub}</p>
              </div>
              <span className="text-inksoft">→</span>
            </button>
          </li>
        ))}
        <li>
          <button className="card flex w-full items-center gap-3 p-4 text-left" onClick={() => void exportBackup()}>
            <Download size={20} className="text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">Quick backup (JSON)</p>
              <p className="text-xs text-inksoft">Export everything — takes 2 seconds</p>
            </div>
          </button>
        </li>
      </ul>

      <div className="mt-8 flex flex-col items-center gap-1 pb-8 text-center">
        <Pip mood="cheer" size={54} />
        <p className="text-xs font-semibold text-inksoft">PrepStride · 100% offline · your data never leaves this device</p>
        <a
          href="https://github.com/abhijeetk97/prepstride"
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand"
        >
          <Github size={12} /> abhijeetk97/prepstride
        </a>
        <p className="text-[10px] text-inksoft">Made with <Heart size={10} className="inline" /> for a future officer</p>
      </div>
    </div>
  );
}
