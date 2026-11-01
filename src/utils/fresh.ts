import { useEffect, useState } from 'react';

// Rows that just arrived (a Quick log save, an undo) grow into their list with a short
// highlight. Keyed by TimeLog.createdAt, which survives the delete-and-restore round trip.

const FRESH_MS = 1800;
const fresh = new Set<number>();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function markFresh(createdAt: number): void {
  fresh.add(createdAt);
  emit();
  setTimeout(() => {
    fresh.delete(createdAt);
    emit();
  }, FRESH_MS);
}

export function useFresh(): ReadonlySet<number> {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return fresh;
}
