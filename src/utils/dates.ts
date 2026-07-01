import { eachDayOfInterval, format, isAfter, isWithinInterval, parseISO } from "date-fns";

export function formatShortDate(value: string) {
  return format(parseISO(value), "MMM d");
}

export function formatLongDate(value: string) {
  return format(parseISO(value), "EEE, MMM d, yyyy");
}

export function isDateInRange(date: string, start: string, end: string) {
  const parsed = parseISO(date);
  return isWithinInterval(parsed, { start: parseISO(start), end: parseISO(end) });
}

export function getIsoDateRange(start: string, end: string) {
  const parsedStart = parseISO(start);
  const parsedEnd = parseISO(end);
  if (isAfter(parsedStart, parsedEnd)) return [];
  return eachDayOfInterval({ start: parsedStart, end: parsedEnd }).map((date) => format(date, "yyyy-MM-dd"));
}

export function monthKey(date: string) {
  return date.slice(0, 7);
}
