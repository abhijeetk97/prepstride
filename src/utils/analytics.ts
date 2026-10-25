import { addDays, weekStartISO } from './dates';

/** The dates the heatmap actually draws: Monday of the trailing year through today. */
export function heatmapWindow(today: string): { start: string; end: string } {
  return { start: weekStartISO(addDays(today, -363)), end: today };
}

export function windowAverages(
  minutesByDay: Map<string, number>,
  end: string,
  days: number
): { calendar: number; study: number; studyDays: number } {
  let total = 0;
  let studyDays = 0;
  for (let i = 0; i < days; i++) {
    const minutes = minutesByDay.get(addDays(end, -i)) ?? 0;
    total += minutes;
    if (minutes > 0) studyDays += 1;
  }
  return {
    calendar: Math.round(total / days),
    study: studyDays === 0 ? 0 : Math.round(total / studyDays),
    studyDays
  };
}

/** Mean minutes on days that have study, across the whole log. */
export function studyDayAverage(minutesByDay: Map<string, number>, today: string): number {
  let total = 0;
  let days = 0;
  for (const [date, minutes] of minutesByDay) {
    if (date <= today && minutes > 0) {
      total += minutes;
      days += 1;
    }
  }
  return days === 0 ? 0 : Math.round(total / days);
}
