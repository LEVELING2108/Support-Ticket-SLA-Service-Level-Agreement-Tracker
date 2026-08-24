import { describe, it, expect } from 'vitest';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import {
  addBusinessMinutes,
  snapToNextBusinessMoment,
  BusinessHoursConfig,
  HolidayItem,
} from '../../src/services/sla/businessHours';

const TEST_CONFIG: BusinessHoursConfig = {
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
  timeZone: 'Asia/Kolkata',
};

function makeDate(dateString: string): Date {
  // Input format: "2026-08-24 10:00" in Kolkata timezone
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = (datePart || '').split('-').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);

  const localDate = new Date(year || 2026, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);
  return fromZonedTime(localDate, TEST_CONFIG.timeZone);
}

function formatDate(utcDate: Date): string {
  const zoned = toZonedTime(utcDate, TEST_CONFIG.timeZone);
  return format(zoned, 'yyyy-MM-dd HH:mm');
}

describe('Business Hours & SLA Engine Core', () => {
  describe('snapToNextBusinessMoment', () => {
    it('returns exact time when already within business hours', () => {
      // 2026-08-24 is a Monday
      const mondayMidday = makeDate('2026-08-24 14:30');
      const snapped = snapToNextBusinessMoment(mondayMidday, [], TEST_CONFIG);
      expect(format(snapped, 'yyyy-MM-dd HH:mm')).toBe('2026-08-24 14:30');
    });

    it('snaps forward to 09:00 same day when created before business hours', () => {
      // Monday 07:00
      const mondayEarly = makeDate('2026-08-24 07:00');
      const snapped = snapToNextBusinessMoment(mondayEarly, [], TEST_CONFIG);
      expect(format(snapped, 'yyyy-MM-dd HH:mm')).toBe('2026-08-24 09:00');
    });

    it('snaps forward to 09:00 next business day when created after business hours', () => {
      // Monday 20:00 -> Tuesday 09:00
      const mondayLate = makeDate('2026-08-24 20:00');
      const snapped = snapToNextBusinessMoment(mondayLate, [], TEST_CONFIG);
      expect(format(snapped, 'yyyy-MM-dd HH:mm')).toBe('2026-08-25 09:00');
    });

    it('snaps weekend timestamp to Monday 09:00', () => {
      // 2026-08-29 is Saturday
      const saturday = makeDate('2026-08-29 14:00');
      const snappedSat = snapToNextBusinessMoment(saturday, [], TEST_CONFIG);
      expect(format(snappedSat, 'yyyy-MM-dd HH:mm')).toBe('2026-08-31 09:00');

      // 2026-08-30 is Sunday
      const sunday = makeDate('2026-08-30 22:00');
      const snappedSun = snapToNextBusinessMoment(sunday, [], TEST_CONFIG);
      expect(format(snappedSun, 'yyyy-MM-dd HH:mm')).toBe('2026-08-31 09:00');
    });

    it('skips public holidays and snaps to next business day 09:00', () => {
      // Monday 2026-08-31 is a holiday -> snaps to Tuesday 2026-09-01 09:00
      const holidays: HolidayItem[] = [{ date: '2026-08-31', name: 'Special Holiday' }];
      const monday = makeDate('2026-08-31 10:00');
      const snapped = snapToNextBusinessMoment(monday, holidays, TEST_CONFIG);
      expect(format(snapped, 'yyyy-MM-dd HH:mm')).toBe('2026-09-01 09:00');
    });
  });

  describe('addBusinessMinutes', () => {
    it('calculates normal weekday business hours within the same day', () => {
      // Monday 10:00 + 2 hours (120 mins) -> Monday 12:00
      const start = makeDate('2026-08-24 10:00');
      const due = addBusinessMinutes(start, 120, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-24 12:00');
    });

    it('handles tickets created before business hours', () => {
      // Monday 07:00 (snaps to 09:00) + 1 hour (60 mins) -> Monday 10:00
      const start = makeDate('2026-08-24 07:00');
      const due = addBusinessMinutes(start, 60, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-24 10:00');
    });

    it('handles tickets created after business hours', () => {
      // Monday 20:00 (snaps to Tuesday 09:00) + 1 hour (60 mins) -> Tuesday 10:00
      const start = makeDate('2026-08-24 20:00');
      const due = addBusinessMinutes(start, 60, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-25 10:00');
    });

    it('handles spec worked example: HIGH priority created Friday 17:00, 4 business hours target', () => {
      // 2026-08-28 is Friday
      // Fri 17:00-18:00 = 1h, Sat/Sun = 0h, Mon 09:00-12:00 = 3h -> due Monday 12:00
      const start = makeDate('2026-08-28 17:00');
      const due = addBusinessMinutes(start, 4 * 60, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-31 12:00');
    });

    it('handles Friday evening edge case (17:59: 1 minute before weekend)', () => {
      // Friday 17:59 + 60 minutes -> 1 min on Fri, 59 mins on Mon -> Mon 09:59
      const start = makeDate('2026-08-28 17:59');
      const due = addBusinessMinutes(start, 60, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-31 09:59');
    });

    it('handles weekend ticket creation', () => {
      // Saturday 15:00 (snaps to Monday 09:00) + 2 hours -> Monday 11:00
      const start = makeDate('2026-08-29 15:00');
      const due = addBusinessMinutes(start, 120, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-31 11:00');
    });

    it('handles public holiday skipping', () => {
      // Friday 17:00 + 4 hours (240 mins), with Monday 2026-08-31 as Holiday
      // Fri 17:00-18:00 = 1h, Mon = 0h (holiday), Tue 09:00-12:00 = 3h -> due Tuesday 12:00
      const holidays: HolidayItem[] = [{ date: '2026-08-31', name: 'National Holiday' }];
      const start = makeDate('2026-08-28 17:00');
      const due = addBusinessMinutes(start, 240, holidays, TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-09-01 12:00');
    });

    it('handles weekend + multiple consecutive holidays combination', () => {
      // Friday 17:00 + 2 hours (120 mins)
      // Fri 17:00-18:00 = 1h
      // Sat/Sun = Weekend
      // Mon 08-31 = Holiday 1
      // Tue 09-01 = Holiday 2
      // Wed 09-02 = 09:00-10:00 = 1h -> due Wed 10:00
      const holidays: HolidayItem[] = [
        { date: '2026-08-31', name: 'Holiday One' },
        { date: '2026-09-01', name: 'Holiday Two' },
      ];
      const start = makeDate('2026-08-28 17:00');
      const due = addBusinessMinutes(start, 120, holidays, TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-09-02 10:00');
    });

    it('handles multi-day SLA spans (24 business hours = 2 full days + 6 hours)', () => {
      // 9 hours/day. 24 business hours = 2 days (18h) + 6 hours
      // Start: Monday 2026-08-24 09:00
      // Mon: 9h (total 9h, 15h left)
      // Tue: 9h (total 18h, 6h left)
      // Wed: 6h (09:00 + 6h) -> Wednesday 15:00
      const start = makeDate('2026-08-24 09:00');
      const due = addBusinessMinutes(start, 24 * 60, [], TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-08-26 15:00');
    });

    it('handles 72 business hours spanning over weekends and holidays', () => {
      // 72 business hours = 8 full business days (8 * 9 = 72 hours)
      // Start: Friday 2026-08-21 09:00
      // Day 1: Fri 08-21 (9h)
      // Sat/Sun: Weekend
      // Day 2: Mon 08-24 (9h)
      // Day 3: Tue 08-25 (9h)
      // Day 4: Wed 08-26 (9h)
      // Day 5: Thu 08-27 (9h)
      // Day 6: Fri 08-28 (9h)
      // Sat/Sun: Weekend
      // Mon 08-31: Holiday
      // Day 7: Tue 09-01 (9h)
      // Day 8: Wed 09-02 (9h) -> Wed 09-02 18:00
      const holidays: HolidayItem[] = [{ date: '2026-08-31', name: 'August Holiday' }];
      const start = makeDate('2026-08-21 09:00');
      const due = addBusinessMinutes(start, 72 * 60, holidays, TEST_CONFIG);
      expect(formatDate(due)).toBe('2026-09-02 18:00');
    });
  });
});
