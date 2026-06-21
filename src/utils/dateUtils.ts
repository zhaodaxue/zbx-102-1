import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  formatISO,
  getDay,
  getISOWeek,
  getYear,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import { zhCN } from "date-fns/locale";

const WEEK_LOCALE = { locale: zhCN, weekStartsOn: 1 } as const;

export function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function toISODate(d: Date): string {
  return formatISO(d, { representation: "date" });
}

export function fmtDate(s: string) {
  const d = parseISO(s);
  return format(d, "M月d日", { locale: zhCN });
}

export function fmtDateShort(s: string) {
  const d = parseISO(s);
  return format(d, "MM-dd");
}

export function fmtDateFull(s: string) {
  const d = parseISO(s);
  return format(d, "yyyy年M月d日 EEEE", { locale: zhCN });
}

export function weekKeyOf(d: Date): string {
  const y = getYear(d);
  const w = getISOWeek(d);
  return `${y}-W${pad(w)}`;
}

export function weekKeyOfStr(s: string): string {
  return weekKeyOf(parseISO(s));
}

export function weekRangeOfStr(s: string): { weekKey: string; start: string; end: string } {
  const d = parseISO(s);
  const start = startOfWeek(d, WEEK_LOCALE);
  const end = endOfWeek(d, WEEK_LOCALE);
  return {
    weekKey: weekKeyOf(d),
    start: toISODate(start),
    end: toISODate(end),
  };
}

export function weekRangeOfKey(key: string): { start: string; end: string } {
  const [y, w] = key.split("-W");
  const year = Number(y);
  const week = Number(w);
  const jan4 = new Date(year, 0, 4);
  const firstWeekStart = startOfWeek(jan4, WEEK_LOCALE);
  const start = addDays(firstWeekStart, (week - 1) * 7);
  const end = addDays(start, 6);
  return { start: toISODate(start), end: toISODate(end) };
}

export function fmtWeekLabel(key: string): string {
  const { start, end } = weekRangeOfKey(key);
  const s = parseISO(start);
  const e = parseISO(end);
  return `${format(s, "M/d", { locale: zhCN })} - ${format(e, "M/d", { locale: zhCN })}`;
}

export function sortDates(arr: string[]): string[] {
  return [...arr].sort((a, b) => a.localeCompare(b));
}

export function minMaxOfDates(arr: string[]): [string, string] {
  if (arr.length === 0) return ["", ""];
  const s = sortDates(arr);
  return [s[0], s[s.length - 1]];
}

export function eachDayBetween(from: string, to: string): string[] {
  if (!from || !to) return [];
  return eachDayOfInterval({ start: parseISO(from), end: parseISO(to) }).map(toISODate);
}

export function eachWeekBetween(from: string, to: string): string[] {
  if (!from || !to) return [];
  return eachWeekOfInterval(
    { start: parseISO(from), end: parseISO(to) },
    WEEK_LOCALE
  ).map(weekKeyOf);
}

export function dateInRange(s: string, from?: string | null, to?: string | null): boolean {
  if (!from && !to) return true;
  const d = parseISO(s);
  const start = from ? parseISO(from) : undefined;
  const end = to ? parseISO(to) : undefined;
  if (start && end) return isWithinInterval(d, { start, end });
  if (start) return d >= start;
  if (end) return d <= end;
  return true;
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

export function addDaysStr(s: string, n: number): string {
  return toISODate(addDays(parseISO(s), n));
}

export function subDaysStr(s: string, n: number): string {
  return toISODate(subDays(parseISO(s), n));
}

export function getCurrentWeekKeyAndPrev(
  allDates: string[]
): { thisWeek: string | null; lastWeek: string | null } {
  if (allDates.length === 0) return { thisWeek: null, lastWeek: null };
  const weeks = Array.from(new Set(allDates.map(weekKeyOfStr))).sort();
  const thisWeek = weeks[weeks.length - 1] ?? null;
  const lastWeek = weeks[weeks.length - 2] ?? null;
  return { thisWeek, lastWeek };
}

export function getDayOfWeek(s: string): number {
  return getDay(parseISO(s));
}

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISO(s);
  return !Number.isNaN(d.getTime());
}

export function normalizeDateRange(
  range: [string, string]
): [string, string] {
  const [a, b] = range;
  if (a <= b) return [a, b];
  return [b, a];
}
