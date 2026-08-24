import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, addDays, startOfDay } from 'date-fns';

export interface BusinessHoursConfig {
  startHour: number; // 9
  startMinute: number; // 0
  endHour: number; // 18
  endMinute: number; // 0
  timeZone: string; // e.g. 'Asia/Kolkata'
}

export interface HolidayItem {
  date: Date | string;
  name?: string;
}

export const DEFAULT_BUSINESS_CONFIG: BusinessHoursConfig = {
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
  timeZone: process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata',
};

/**
 * Formats a Date object to YYYY-MM-DD string in a specific timezone
 */
export function formatLocalDateString(date: Date, timeZone: string): string {
  const zoned = toZonedTime(date, timeZone);
  return format(zoned, 'yyyy-MM-dd');
}

/**
 * Checks if a given date string or Date is in the list of holidays
 */
export function isHoliday(date: Date, holidays: HolidayItem[], timeZone: string): boolean {
  const dateStr = formatLocalDateString(date, timeZone);
  return holidays.some((h) => {
    if (typeof h.date === 'string') {
      // Handles both 'YYYY-MM-DD' and ISO strings
      return h.date.startsWith(dateStr);
    }
    const holidayStr = formatLocalDateString(h.date, timeZone);
    return holidayStr === dateStr;
  });
}

/**
 * Checks if a zoned Date falls on a standard business day (Monday - Friday and not a holiday)
 */
export function isBusinessDay(zonedDate: Date, holidays: HolidayItem[], timeZone: string): boolean {
  const dayOfWeek = zonedDate.getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  return !isHoliday(zonedDate, holidays, timeZone);
}

/**
 * Creates a zoned Date object on the same day with specific hour and minute
 */
function setZonedTime(zonedDate: Date, hour: number, minute: number): Date {
  const cloned = new Date(zonedDate.getTime());
  cloned.setHours(hour, minute, 0, 0);
  return cloned;
}

/**
 * Snaps any timestamp to the nearest upcoming business moment.
 * If the given time is already within business hours, returns the zoned date.
 * If before business hours (e.g. 07:00), snaps to 09:00 same day.
 * If after business hours (e.g. 20:00), snaps to 09:00 next business day.
 * If weekend or holiday, snaps to 09:00 on the next non-holiday weekday.
 */
export function snapToNextBusinessMoment(
  utcDate: Date,
  holidays: HolidayItem[] = [],
  config: BusinessHoursConfig = DEFAULT_BUSINESS_CONFIG,
): Date {
  let zoned = toZonedTime(utcDate, config.timeZone);

  let found = false;
  while (!found) {
    const isWorkingDay = isBusinessDay(zoned, holidays, config.timeZone);

    if (!isWorkingDay) {
      // Move to start of next day at 09:00
      zoned = startOfDay(addDays(zoned, 1));
      zoned = setZonedTime(zoned, config.startHour, config.startMinute);
      continue;
    }

    const startOfWork = setZonedTime(zoned, config.startHour, config.startMinute);
    const endOfWork = setZonedTime(zoned, config.endHour, config.endMinute);

    if (zoned.getTime() < startOfWork.getTime()) {
      // Before business hours today -> snap to 09:00 today
      return startOfWork;
    }

    if (zoned.getTime() >= endOfWork.getTime()) {
      // After business hours today -> snap to 09:00 next day and re-check
      zoned = startOfDay(addDays(zoned, 1));
      zoned = setZonedTime(zoned, config.startHour, config.startMinute);
      continue;
    }

    // Inside business hours
    found = true;
  }
  return zoned;
}

/**
 * Adds business minutes to a starting UTC date, skipping non-business hours, weekends, and holidays.
 * Returns the resulting UTC date.
 */
export function addBusinessMinutes(
  startUtcDate: Date,
  minutesNeeded: number,
  holidays: HolidayItem[] = [],
  config: BusinessHoursConfig = DEFAULT_BUSINESS_CONFIG,
): Date {
  if (minutesNeeded <= 0) {
    return startUtcDate;
  }

  let zonedCursor = snapToNextBusinessMoment(startUtcDate, holidays, config);
  let remainingMinutes = minutesNeeded;

  while (remainingMinutes > 0) {
    const endOfWork = setZonedTime(zonedCursor, config.endHour, config.endMinute);
    const availableTodayMinutes = Math.floor(
      (endOfWork.getTime() - zonedCursor.getTime()) / (60 * 1000),
    );

    if (availableTodayMinutes >= remainingMinutes) {
      zonedCursor = new Date(zonedCursor.getTime() + remainingMinutes * 60 * 1000);
      remainingMinutes = 0;
      break;
    }

    remainingMinutes -= availableTodayMinutes;
    // Advance to next day at business start and snap to next valid working day
    const nextDay = startOfDay(addDays(zonedCursor, 1));
    const nextDayStart = setZonedTime(nextDay, config.startHour, config.startMinute);
    const nextUtc = fromZonedTime(nextDayStart, config.timeZone);
    zonedCursor = snapToNextBusinessMoment(nextUtc, holidays, config);
  }

  return fromZonedTime(zonedCursor, config.timeZone);
}
