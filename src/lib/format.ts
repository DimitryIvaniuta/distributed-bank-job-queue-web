import { formatDistanceToNowStrict } from 'date-fns';

export function formatDateTime(value: string | null): string {
  if (value === null) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Invalid date'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
}

export function formatRelativeTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Unknown' : `${formatDistanceToNowStrict(date)} ago`;
}

/** Returns a local calendar date suitable for an HTML date input. */
export function formatLocalDateInput(date = new Date()): string {
  return [date.getFullYear(), twoDigits(date.getMonth() + 1), twoDigits(date.getDate())].join('-');
}

/** Returns a local calendar month suitable for an HTML month input. */
export function formatLocalMonthInput(date = new Date()): string {
  return [date.getFullYear(), twoDigits(date.getMonth() + 1)].join('-');
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}
