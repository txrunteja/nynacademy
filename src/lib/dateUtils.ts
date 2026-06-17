import { format } from "date-fns";

/**
 * Converts any date representation to a Date object representing the wall-clock time in IST (Asia/Kolkata)
 */
export function toISTDate(dateInput: Date | string | number): Date {
  const date = new Date(dateInput);
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const partMap = new Map(parts.map(p => [p.type, p.value]));
  
  const year = parseInt(partMap.get("year")!, 10);
  const month = parseInt(partMap.get("month")!, 10) - 1;
  const day = parseInt(partMap.get("day")!, 10);
  const hour = parseInt(partMap.get("hour")!, 10);
  const minute = parseInt(partMap.get("minute")!, 10);
  const second = parseInt(partMap.get("second")!, 10);

  return new Date(year, month, day, hour === 24 ? 0 : hour, minute, second);
}

/**
 * Formats a date in IST (Asia/Kolkata) using date-fns format tokens
 */
export function formatInIST(dateInput: Date | string | number, formatStr: string): string {
  return format(toISTDate(dateInput), formatStr);
}

/**
 * Checks if two dates fall on the same day in IST
 */
export function isSameDayInIST(dateA: Date | string | number, dateB: Date | string | number): boolean {
  return formatInIST(dateA, "yyyy-MM-dd") === formatInIST(dateB, "yyyy-MM-dd");
}
