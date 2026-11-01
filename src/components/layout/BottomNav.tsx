import { Home, BookOpenCheck, Timer, ClipboardList, LayoutGrid } from 'lucide-react';
import type { Route } from '../../App';

const TABS: { route: Route; label: string; Icon: typeof Home }[] = [
  { route: 'home', label: 'Home', Icon: Home },
  { route: 'study', label: 'Study', Icon: Timer },
  { route: 'syllabus', label: 'Syllabus', Icon: BookOpenCheck },
  { route: 'tests', label: 'Tests', Icon: ClipboardList },
  { route: 'more', label: 'More', Icon: LayoutGrid }
];

function tabFor(route: Route): Route {
  if (route === 'planner') return 'home';
  if (route === 'analytics' || route === 'rewards' || route === 'settings') return 'more';
  return route;
}

export function BottomNav({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  const activeIndex = TABS.findIndex((t) => t.route === tabFor(route));
  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe">
      <div className="relative mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {/* One pill slides between tabs; it never jumps. */}
        <span
          aria-hidden
          className="nav-pill pointer-events-none absolute bottom-0 left-2 top-1.5 py-0.5"
          style={{ width: `calc((100% - 1rem) / ${TABS.length})`, transform: `translateX(${activeIndex * 100}%)` }}
        >
          <span className="mx-auto block h-full w-[72%] rounded-2xl bg-brandsoft/70" />
        </span>
        {TABS.map(({ route: r, label, Icon }, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={r}
              onClick={() => navigate(r)}
              className={`press relative flex min-h-11 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-ink' : 'text-inksoft'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 1.9} className={active ? 'text-brand' : ''} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
