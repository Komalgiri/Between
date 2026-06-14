type TimestampLike = { toDate?: () => Date } | string | number | Date | null | undefined | unknown;

export const toDate = (value: TimestampLike): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export const formatRelativeTime = (value: TimestampLike): string => {
  const date = toDate(value);
  if (!date) return 'Just now';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days}d ago`;
};

export const formatMomentFooter = (value: TimestampLike): string => {
  const date = toDate(value);
  if (!date) return '';

  return date.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
};
