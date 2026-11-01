import { Award, Egg, Feather, Glasses, Medal, NotebookPen, Ribbon, type LucideIcon } from 'lucide-react';

// Drawn icons in place of emoji, so they render the same on every phone and follow the theme.

const RANK_ICONS: Record<string, LucideIcon> = {
  fledgling: Egg,
  scarf: Ribbon,
  notebook: NotebookPen,
  spectacles: Glasses,
  quill: Feather,
  badge: Medal,
  golden_sash: Award
};

export function RankIcon({ accessory, size = 16, className = '' }: { accessory: string; size?: number; className?: string }) {
  const Icon = RANK_ICONS[accessory] ?? Egg;
  return <Icon size={size} strokeWidth={1.9} className={className} aria-hidden />;
}

/** Flame grows with the streak: grey outline at 0, small 1–2, medium 3–6, large with a glow from 7. */
export function StreakFlame({ days, size = 18 }: { days: number; size?: number }) {
  const tier = days <= 0 ? 0 : days < 3 ? 1 : days < 7 ? 2 : 3;
  const color = ['rgb(var(--c-ink-soft) / .5)', '#E8A33D', '#E8772E', '#D9482B'][tier];
  const scale = [0.85, 0.85, 1, 1.18][tier];
  return (
    <span className="inline-flex" style={{ transform: `scale(${scale})`, transition: 'transform var(--dur-slow) var(--ease-spring)' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={`${tier ? 'flame-sway' : ''} ${tier === 3 ? 'flame-glow' : ''}`}>
        <path
          d="M12 2.5c.6 3.2 3.4 4.9 4.9 7.6 1.9 3.4.6 9.4-4.9 9.4s-7-4.4-5.6-8c.6 1.6 1.7 2.4 2.7 2.4-.9-3.7.8-7.6 2.9-11.4z"
          fill={tier ? color : 'none'}
          stroke={color}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        {tier > 0 && <path d="M12 12.5c1.2 1.4 2 2.6 2 4a2 2 0 0 1-4 0c0-1.3.8-2.5 2-4z" fill="#FFE3A3" />}
      </svg>
    </span>
  );
}

/** Shield outline that fills from the bottom with progress toward the next shield. */
export function ShieldFill({ progress, size = 18 }: { progress: number; size?: number }) {
  const p = Math.min(1, Math.max(0, progress));
  const id = `shield-${Math.round(p * 1000)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <clipPath id={id}>
          <rect x="0" y={22 - 20 * p} width="24" height={20 * p} style={{ transition: 'y var(--dur-slow) var(--ease-emph), height var(--dur-slow) var(--ease-emph)' }} />
        </clipPath>
      </defs>
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6z" fill="rgb(var(--c-accent))" clipPath={`url(#${id})`} />
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6z" fill="none" stroke="rgb(var(--c-accent))" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  );
}
