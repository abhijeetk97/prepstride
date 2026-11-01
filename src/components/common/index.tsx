import { type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Pip, type PipMood } from '../mascot/Pip';
import { currentMotion } from '../../hooks/useMotionPreference';

export { showToast, ToastHost, type ToastOptions } from './Toast';
export { RankIcon, StreakFlame, ShieldFill } from './icons';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  const [drag, setDrag] = useState(0);
  const dragging = useRef(false);
  // Stay mounted through the exit animation, showing the last content rather than an emptied panel.
  const [rendered, setRendered] = useState(open);
  const lastChildren = useRef(children);
  const lastTitle = useRef(title);
  if (open) {
    lastChildren.current = children;
    lastTitle.current = title;
  }
  const shownChildren = open ? children : lastChildren.current;
  const shownTitle = open ? title : lastTitle.current;
  useEffect(() => {
    if (open) {
      setRendered(true);
      setDrag(0);
      return;
    }
    const t = setTimeout(() => setRendered(false), currentMotion() === 'off' ? 0 : 260);
    return () => clearTimeout(t);
  }, [open]);

  const dragStart = useRef({ y: 0, t: 0 });
  const onDragStart = (e: ReactPointerEvent) => {
    if (window.matchMedia('(min-width: 640px)').matches) return;
    dragging.current = true;
    dragStart.current = { y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    setDrag(Math.max(0, e.clientY - dragStart.current.y));
  };
  const onDragEnd = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dy = Math.max(0, e.clientY - dragStart.current.y);
    const velocity = dy / Math.max(1, performance.now() - dragStart.current.t);
    const height = dialogRef.current?.offsetHeight ?? 400;
    if (dy > height * 0.3 || velocity > 0.5) onClose();
    else setDrag(0);
  };
  useEffect(() => { if (open) dialogRef.current?.focus(); }, [open, title]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = dialogRef.current;
    panel?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== panel) return;
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); }
      if (e.key !== 'Tab' || !panel) return;
      const controls = Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'))
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { e.preventDefault(); panel.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  if (!rendered) return null;
  const closing = !open;
  return (
    <div
      className={`sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[3px] sm:items-center ${closing ? 'closing pointer-events-none' : ''}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`sheet-panel elev-3 max-h-[92vh] w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} overflow-y-auto rounded-t-3xl bg-paper px-5 pb-safe pt-2 sm:rounded-3xl sm:pt-5 ${closing ? 'closing' : ''}`}
        style={{ ['--drag' as string]: `${drag}px`, transform: drag && !closing ? `translateY(${drag}px)` : undefined, transition: dragging.current ? 'none' : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag the handle or header down to dismiss (phones). */}
        <div
          className="touch-none select-none"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
          <div className="mb-4 flex items-center justify-between">
            <h3 id={titleId} className="text-base font-bold text-ink">{shownTitle}</h3>
            <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()} className="hit rounded-full text-inksoft hover:bg-surface2" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        {shownChildren}
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

export function EmptyState({ mood = 'cheer', text, sub, action }: { mood?: PipMood; text: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 py-6 text-center">
      <Pip mood={mood} size={64} className="mb-1" />
      <p className="text-sm font-semibold text-ink">{text}</p>
      {sub && <p className="max-w-xs text-xs text-inksoft">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatPill({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface2 px-3 py-2 text-center">
      <p className="font-display flex items-center justify-center gap-1 text-lg leading-tight text-ink [overflow-wrap:anywhere]">{value}</p>
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

const FEATHER_COLORS = ['#F7616E', '#FBB52C', '#1EA4E0', '#8DCB45'];

/**
 * A few feathers in Pip's wing colours drift down once (replaces confetti). Hidden under the
 * Calm and Off tiers; never blocks taps.
 */
export function FeatherBurst({ show, count = 12 }: { show: boolean; count?: number }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-72 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="feather"
          style={{
            left: `${8 + ((i * 37) % 84)}%`,
            background: FEATHER_COLORS[i % FEATHER_COLORS.length],
            animationDelay: `${(i % 6) * 110}ms`,
            ['--fall' as string]: `${2.4 + (i % 5) * 0.25}s`,
            ['--sway' as string]: `${i % 2 ? -1 : 1}${14 + (i % 4) * 8}px`,
            ['--spin' as string]: `${i % 2 ? -1 : 1}${120 + (i % 3) * 60}deg`
          }}
        />
      ))}
    </div>
  );
}
