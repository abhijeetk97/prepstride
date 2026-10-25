import { useEffect, useState } from 'react';

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
let hideTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function hide(): void {
  current = null;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = null;
  emit();
}

export function showToast(opts: ToastOptions): void {
  current = opts;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(hide, opts.duration ?? 3500);
  emit();
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

  if (!current) return null;
  const t = current;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-safe" role="status" aria-live="polite">
      <div className="pointer-events-auto mt-3 flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 shadow-xl animate-slide-up">
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
          </button>
        )}
      </div>
    </div>
  );
}
