import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export { showToast, ToastHost, type ToastOptions } from './Toast';

export function SectionCard({
  title,
  icon,
  action,
  children,
  className = ''
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-4 ${className}`}>
      {title && (
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-inksoft">
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 animate-fade-in sm:items-center" onClick={onClose}>
      <div
        className={`max-h-[92vh] w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} overflow-y-auto rounded-t-3xl bg-paper p-5 pb-safe shadow-2xl animate-slide-up sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="hit rounded-full text-inksoft hover:bg-surface2" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StarRating({
  value,
  onChange,
  size = 24
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex w-full">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`star-hit transition-transform ${onChange ? 'active:scale-95' : 'cursor-default'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={n <= value ? 'rgb(var(--c-brand))' : 'none'} stroke={n <= value ? 'rgb(var(--c-brand))' : 'rgb(var(--c-ink-soft))'} strokeWidth="1.6">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ pct, color, className = '' }: { pct: number; color?: string; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-surface2 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color ?? 'rgb(var(--c-brand))' }}
      />
    </div>
  );
}

export function EmptyState({ emoji, text, sub }: { emoji: string; text: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center">
      <span className="text-3xl">{emoji}</span>
      <p className="text-sm font-semibold text-ink">{text}</p>
      {sub && <p className="max-w-xs text-xs text-inksoft">{sub}</p>}
    </div>
  );
}

export function StatPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface2 px-3 py-2 text-center">
      <p className="text-lg font-extrabold leading-tight text-ink [overflow-wrap:anywhere]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-inksoft">{label}</p>
      {sub && <p className="text-[10px] leading-tight text-inksoft [overflow-wrap:anywhere]">{sub}</p>}
    </div>
  );
}

/** Circular progress ring with optional mascot/content in the middle. */
export function ProgressRing({
  pct,
  size = 168,
  stroke = 12,
  color,
  trackColor,
  children
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor ?? 'rgb(var(--c-line))'} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? 'rgb(var(--c-brand))'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/** Lightweight CSS confetti burst (no dependency). */
export function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ['#E8A33D', '#F49FB6', '#7EC8E3', '#8AB17D', '#D4A94E', '#E07A5F'];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute block h-2 w-2 rounded-[2px]"
          style={{
            left: `${(i * 41) % 100}%`,
            top: '-4%',
            background: colors[i % colors.length],
            animation: `confettiFall ${1.6 + (i % 5) * 0.35}s ${(i % 7) * 0.09}s cubic-bezier(0.3, 0.6, 0.7, 1) forwards`,
            transform: `rotate(${i * 33}deg)`
          }}
        />
      ))}
      <style>{`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0); opacity: 1 } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0.6 } }`}</style>
    </div>
  );
}
