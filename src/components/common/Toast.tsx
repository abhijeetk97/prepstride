import { useEffect, useState } from 'react';
import { currentMotion } from '../../hooks/useMotionPreference';

// ─── Global toast (single-slot) ─────────────────────────────────────────────
// Used for transient confirmations ("Under a minute — not logged") and the
// delete-with-Undo flow. One toast at a time; a new toast replaces the old.

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number; // ms until auto-hide (default 3500)
}

let current: ToastOptions | null = null;
let serial = 0;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
// The undo window is real time left, so holding the toast pauses both the timer and the bar.
let deadline = 0;
let heldLeft: number | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function hide(): void {
  current = null;
  heldLeft = null;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = null;
  emit();
}

function arm(ms: number): void {
  if (hideTimer) clearTimeout(hideTimer);
  deadline = Date.now() + ms;
  hideTimer = setTimeout(hide, ms);
}

export function showToast(opts: ToastOptions): void {
  current = opts;
  serial += 1;
  heldLeft = null;
  arm(opts.duration ?? 3500);
  emit();
}

function holdToast(): void {
  if (!current || heldLeft != null) return;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = null;
  heldLeft = Math.max(0, deadline - Date.now());
  emit();
}

function releaseToast(): void {
  if (!current || heldLeft == null) return;
  const left = heldLeft;
  heldLeft = null;
  arm(left);
  emit();
}

function secondsLeft(): number {
  return Math.max(0, Math.ceil((heldLeft ?? deadline - Date.now()) / 1000));
}

export function ToastHost() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  // Calm swaps the draining bar for the seconds left, as text.
  const calm = currentMotion() === 'calm';
  const ticking = Boolean(current?.actionLabel) && calm;
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [ticking]);

  if (!current) return null;
  const t = current;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-safe" role="status" aria-live="polite">
      <div
        key={serial}
        onPointerDown={holdToast}
        onPointerUp={releaseToast}
        onPointerCancel={releaseToast}
        onPointerLeave={releaseToast}
        className={`toast-panel elev-3 pointer-events-auto relative mt-3 ${heldLeft != null ? 'held' : ''} flex w-full max-w-sm items-center justify-between gap-3 overflow-hidden rounded-2xl bg-ink px-4 py-3`}
      >
        <p className="text-sm font-semibold leading-snug text-paper">{t.message}</p>
        {t.actionLabel && (
          <button
            className="hit shrink-0 rounded-full bg-paper/15 px-3 text-xs font-extrabold uppercase tracking-wide text-paper active:scale-95"
            onClick={() => {
              t.onAction?.();
              hide();
            }}
          >
            {t.actionLabel}
            {calm ? ` · ${secondsLeft()}s` : ''}
          </button>
        )}
        {/* Undo window: the bar empties as the chance to undo runs out. */}
        {t.actionLabel && !calm && (
          <span
            key={`bar-${serial}`}
            aria-hidden
            className="toast-countdown absolute inset-x-0 bottom-0 h-[3px] bg-paper/45"
            style={{ ['--toast-ms' as string]: `${t.duration ?? 3500}ms` }}
          />
        )}
      </div>
    </div>
  );
}
