import {
  formatDateTime,
  formatLocalDateInput,
  formatLocalMonthInput,
  formatRelativeTime,
} from './format';

describe('date formatting', () => {
  it('formats null and invalid values safely', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('not-a-date')).toBe('Invalid date');
    expect(formatRelativeTime('not-a-date')).toBe('Unknown');
  });

  it('formats a valid ISO timestamp', () => {
    expect(formatDateTime('2026-06-28T12:00:00Z')).not.toBe('Invalid date');
    expect(formatRelativeTime(new Date().toISOString())).toContain('ago');
  });

  it('uses the local calendar date for HTML controls', () => {
    const local = new Date(2026, 0, 2, 23, 30);
    expect(formatLocalDateInput(local)).toBe('2026-01-02');
    expect(formatLocalMonthInput(local)).toBe('2026-01');
  });
});
