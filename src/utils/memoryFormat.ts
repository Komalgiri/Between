import { toDate } from './time';

export const formatMemoryDate = (value: unknown): string => {
  const date = toDate(value);
  if (!date) return 'Just now';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const memoryTitleFromNote = (note: string): string => {
  const line = note.trim().split('\n')[0];
  if (!line) return 'Untitled memory';
  return line.length > 48 ? `${line.slice(0, 48)}…` : line;
};
