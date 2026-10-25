import { currentSprint, daysLeft, formatRange, parseDay, progressOf, sprintNote, sprintState, timeElapsed } from './sprint-utils';

describe('sprint-utils', () => {
  const on = parseDay('2026-10-25');
  const sprint = { startDate: '2026-10-19', endDate: '2026-11-02' };

  it('reads yyyy-MM-dd as a local day, not as UTC', () => {
    const day = parseDay('2026-03-01');
    expect(day.getFullYear()).toBe(2026);
    expect(day.getMonth()).toBe(2);
    expect(day.getDate()).toBe(1);
    expect(day.getHours()).toBe(0);
  });

  it('tells upcoming, active and finished sprints apart, end day included', () => {
    expect(sprintState(sprint, parseDay('2026-10-18'))).toBe('upcoming');
    expect(sprintState(sprint, parseDay('2026-10-19'))).toBe('active');
    expect(sprintState(sprint, parseDay('2026-11-02'))).toBe('active');
    expect(sprintState(sprint, parseDay('2026-11-03'))).toBe('finished');
  });

  it('counts the days left and writes them out', () => {
    expect(daysLeft(sprint, on)).toBe(8);
    expect(sprintNote(sprint, on)).toBe('8 days left');
    expect(sprintNote(sprint, parseDay('2026-11-01'))).toBe('1 day left');
    expect(sprintNote(sprint, parseDay('2026-11-02'))).toBe('Last day');
    expect(sprintNote(sprint, parseDay('2026-10-18'))).toBe('Starts tomorrow');
    expect(sprintNote(sprint, parseDay('2026-11-10'))).toBe('Finished');
  });

  it('keeps elapsed time between 0 and 100', () => {
    expect(timeElapsed(sprint, parseDay('2026-10-01'))).toBe(0);
    expect(timeElapsed(sprint, parseDay('2026-12-01'))).toBe(100);
    expect(timeElapsed(sprint, on)).toBeGreaterThan(40);
    expect(timeElapsed(sprint, on)).toBeLessThan(50);
  });

  it('computes progress from task statuses', () => {
    const p = progressOf([{ status: 'DONE' }, { status: 'DONE' }, { status: 'IN_PROGRESS' }, { status: 'TO_DO' }]);
    expect(p).toEqual({ total: 4, done: 2, inProgress: 1, todo: 1, percent: 50 });
    expect(progressOf([]).percent).toBe(0);
  });

  it('prefers the running sprint, then the next one, then the last one', () => {
    const past = { startDate: '2026-09-01', endDate: '2026-09-14' };
    const next = { startDate: '2026-11-03', endDate: '2026-11-16' };
    expect(currentSprint([past, sprint, next], on)).toBe(sprint);
    expect(currentSprint([past, next], on)).toBe(next);
    expect(currentSprint([past], on)).toBe(past);
    expect(currentSprint([], on)).toBeNull();
  });

  it('shows the year only when the dates are outside the current one', () => {
    expect(formatRange(sprint, on)).toBe('19 Oct – 2 Nov');
    expect(formatRange({ startDate: '2024-12-20', endDate: '2025-01-03' }, on)).toBe('20 Dec 2024 – 3 Jan 2025');
  });
});
