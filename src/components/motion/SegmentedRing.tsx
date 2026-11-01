import type { ReactNode } from 'react';
import type { RingSegment } from '../../utils/motion';

/**
 * Progress ring split by subject. Segments draw one after another on mount, each in its
 * SUBJECT_META colour. `glow` replays the target-met pulse.
 */
export function SegmentedRing({
  segments,
  size = 190,
  stroke = 14,
  glow = false,
  children
}: {
  segments: RingSegment[];
  size?: number;
  stroke?: number;
  glow?: boolean;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = segments.length > 1 ? Math.min(3, c * 0.006) : 0;
  const per = segments.length ? 520 / segments.length : 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {glow && (
        <span
          className="ring-glow pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 ${stroke / 2}px rgb(var(--c-brand) / .18), 0 0 36px 6px rgb(var(--c-brand) / .35)` }}
          aria-hidden
        />
      )}
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-surface2))" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = Math.max(0.5, s.length * c - gap);
          return (
            <circle
              key={s.key}
              className="ring-seg"
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap={segments.length > 1 ? 'butt' : 'round'}
              strokeDasharray={`${len} ${c}`}
              transform={`rotate(${s.start * 360} ${size / 2} ${size / 2})`}
              style={{ ['--seg-len' as string]: `${len}`, animationDelay: `${i * per}ms`, animationDuration: `${Math.max(240, per)}ms` }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
