// ─── Date helpers (all local-time, ISO 'YYYY-MM-DD' based) ──────────────────

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(fromISO: string, toISOStr: string): number {
  const a = fromISODate(fromISO).getTime();
  const b = fromISODate(toISOStr).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Days remaining until target (negative if past). */
export function daysUntil(iso: string): number {
  return daysBetween(todayISO(), iso);
}

export function formatDateLong(iso: string): string {
  return fromISODate(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDateShort(iso: string): string {
  return fromISODate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDateWithYear(iso: string): string {
  return fromISODate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMinutes(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
}

/** Start of the current week (Monday). */
export function weekStartISO(iso: string = todayISO()): string {
  const d = fromISODate(iso);
  const dow = (d.getDay() + 6) % 7; // Monday=0
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

export function monthStartISO(iso: string = todayISO()): string {
  return iso.slice(0, 8) + '01';
}

/** Last N days ending today (inclusive), oldest first. */
export function lastNDays(n: number, endISO: string = todayISO()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endISO, -i));
  return out;
}

export function timeOfDayHour(isoTimestamp?: string): number | null {
  if (!isoTimestamp) return null;
  return new Date(isoTimestamp).getHours();
}
