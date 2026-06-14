export type ParsedDate = {
  year: number;
  month: number; // 1-12
  day: number;
};

export const parseAnniversaryDate = (raw: string): ParsedDate | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const slashParts = trimmed.split(/[/\s.-]+/).map((p) => p.trim()).filter(Boolean);
  if (slashParts.length >= 3) {
    const [a, b, c] = slashParts;
    const n1 = parseInt(a, 10);
    const n2 = parseInt(b, 10);
    const n3 = parseInt(c, 10);
    if (Number.isNaN(n1) || Number.isNaN(n2) || Number.isNaN(n3)) return null;

    // DD/MM/YYYY (onboarding format)
    if (c.length === 4) {
      return { day: n1, month: n2, year: n3 };
    }
    // YYYY-MM-DD
    if (a.length === 4) {
      return { year: n1, month: n2, day: n3 };
    }
  }

  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) {
    return {
      year: iso.getFullYear(),
      month: iso.getMonth() + 1,
      day: iso.getDate(),
    };
  }

  return null;
};

export const toDateFromParsed = (p: ParsedDate): Date =>
  new Date(p.year, p.month - 1, p.day);

export const getNextAnniversary = (start: ParsedDate, from = new Date()): Date => {
  let candidate = new Date(from.getFullYear(), start.month - 1, start.day);
  if (candidate < new Date(from.getFullYear(), from.getMonth(), from.getDate())) {
    candidate = new Date(from.getFullYear() + 1, start.month - 1, start.day);
  }
  return candidate;
};

export const daysBetween = (from: Date, to: Date): number => {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const getDaysUntilNextAnniversary = (raw: string): number | null => {
  const parsed = parseAnniversaryDate(raw);
  if (!parsed) return null;
  const next = getNextAnniversary(parsed);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  next.setHours(0, 0, 0, 0);
  return daysBetween(today, next);
};

export const getYearsTogether = (raw: string): number | null => {
  const parsed = parseAnniversaryDate(raw);
  if (!parsed) return null;
  const start = toDateFromParsed(parsed);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const anniversaryThisYear = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (now < anniversaryThisYear) years -= 1;
  return Math.max(0, years);
};

export const getDurationStats = (raw: string): { months: number; weeks: number; days: number } | null => {
  const parsed = parseAnniversaryDate(raw);
  if (!parsed) return null;
  const start = toDateFromParsed(parsed);
  const now = new Date();
  const totalDays = daysBetween(start, now);
  return {
    months: Math.floor(totalDays / 30),
    weeks: Math.floor(totalDays / 7),
    days: totalDays,
  };
};

export const formatAnniversaryLabel = (years: number): string => {
  if (years <= 0) return 'New chapter together';
  if (years === 1) return '1 Year Together';
  return `${years} Years Together`;
};

export const dateKeyToday = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
