import { Home, BookOpenCheck, Timer, ClipboardList, LayoutGrid } from 'lucide-react';
import type { Route } from '../../App';

const TABS: { route: Route; label: string; Icon: typeof Home }[] = [
  { route: 'home', label: 'Home', Icon: Home },
  { route: 'study', label: 'Study', Icon: Timer },
  { route: 'syllabus', label: 'Syllabus', Icon: BookOpenCheck },
  { route: 'tests', label: 'Tests', Icon: ClipboardList },
  { route: 'more', label: 'More', Icon: LayoutGrid }
];

export function BottomNav({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {TABS.map(({ route: r, label, Icon }) => {
          const active = route === r || (route === 'analytics' && r === 'more') || (route === 'rewards' && r === 'more') || (route === 'settings' && r === 'more');
          return (
            <button
              key={r}
              onClick={() => navigate(r)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-brand' : 'text-inksoft'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 1.9} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
