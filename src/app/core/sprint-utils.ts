import { Sprint, Task } from './models';

export type SprintState = 'upcoming' | 'active' | 'finished';

const DAY = 24 * 60 * 60 * 1000;

/** "2026-10-25" -> a Date at local midnight (new Date("2026-10-25") would be UTC). */
export function parseDay(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toDayString(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function sprintState(sprint: Pick<Sprint, 'startDate' | 'endDate'>, on: Date = today()): SprintState {
  if (on < parseDay(sprint.startDate)) return 'upcoming';
  if (on > parseDay(sprint.endDate)) return 'finished';
  return 'active';
}

export const STATE_LABEL: Record<SprintState, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  finished: 'Finished',
};

/** Whole days until the end date; 0 on the last day, negative once it is over. */
export function daysLeft(sprint: Pick<Sprint, 'endDate'>, on: Date = today()): number {
  return Math.round((parseDay(sprint.endDate).getTime() - on.getTime()) / DAY);
}

/** "3 days left", "Starts tomorrow", "Finished"... */
export function sprintNote(sprint: Pick<Sprint, 'startDate' | 'endDate'>, on: Date = today()): string {
  const state = sprintState(sprint, on);
  if (state === 'finished') return 'Finished';
  if (state === 'upcoming') {
    const days = daysLeft({ endDate: sprint.startDate }, on);
    return days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`;
  }
  const left = daysLeft(sprint, on);
  if (left === 0) return 'Last day';
  return left === 1 ? '1 day left' : `${left} days left`;
}

/** Share of the sprint's calendar days already used, 0 to 100. */
export function timeElapsed(sprint: Pick<Sprint, 'startDate' | 'endDate'>, on: Date = today()): number {
  const start = parseDay(sprint.startDate).getTime();
  const end = parseDay(sprint.endDate).getTime() + DAY;
  const pct = ((on.getTime() + DAY / 2 - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export interface Progress {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  /** Done tasks as a whole percentage. */
  percent: number;
}

export function progressOf(tasks: Pick<Task, 'status'>[]): Progress {
  const done = tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const total = tasks.length;
  return {
    total,
    done,
    inProgress,
    todo: total - done - inProgress,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

/** "20 Oct – 3 Nov", with the year only when the dates are not in the current one. */
export function formatRange(sprint: Pick<Sprint, 'startDate' | 'endDate'>, on: Date = today()): string {
  const start = parseDay(sprint.startDate);
  const end = parseDay(sprint.endDate);
  const thisYear = on.getFullYear();
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  const showYear = start.getFullYear() !== thisYear || end.getFullYear() !== thisYear;
  const sameYear = start.getFullYear() === end.getFullYear();
  return `${fmt(start, showYear && !sameYear)} – ${fmt(end, showYear)}`;
}

/** The sprint to show first for a project: the running one, else the next, else the latest. */
export function currentSprint<T extends Pick<Sprint, 'startDate' | 'endDate'>>(sprints: T[], on: Date = today()): T | null {
  return (
    sprints.find((s) => sprintState(s, on) === 'active') ??
    sprints.find((s) => sprintState(s, on) === 'upcoming') ??
    sprints[sprints.length - 1] ??
    null
  );
}
