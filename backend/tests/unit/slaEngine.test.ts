import { describe, it, expect } from 'vitest';
import { fromZonedTime } from 'date-fns-tz';
import {
  computeSLAInfo,
  calculateSLAState,
  getBusinessMinutesBetween,
  getSLARemainingMinutes,
  SLA_POLICIES,
  Priority,
  SLAState,
} from '../../src/services/sla/slaEngine';
import { BusinessHoursConfig } from '../../src/services/sla/businessHours';

const TEST_CONFIG: BusinessHoursConfig = {
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
  timeZone: 'Asia/Kolkata',
};

function makeDate(dateString: string): Date {
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = (datePart || '').split('-').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);

  const localDate = new Date(year || 2026, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);
  return fromZonedTime(localDate, TEST_CONFIG.timeZone);
}

describe('SLA Engine & State Machine', () => {
  describe('calculateSLAState & 75% Boundary Rule', () => {
    const dueAt = makeDate('2026-08-24 13:00'); // 4 hours budget (240 mins) from 09:00

    it('returns ON_TRACK for 0% to 75.0% consumed', () => {
      const now = makeDate('2026-08-24 12:00'); // 3 hours (180 mins = 75.0% of 240 mins)
      const state = calculateSLAState(180, 240, now, dueAt);
      expect(state).toBe(SLAState.ON_TRACK);
    });

    it('returns AT_RISK when strictly > 75.0% consumed', () => {
      const now = makeDate('2026-08-24 12:01'); // 181 mins consumed (75.4% of 240 mins)
      const state = calculateSLAState(181, 240, now, dueAt);
      expect(state).toBe(SLAState.AT_RISK);
    });

    it('returns BREACHED when now > dueAt and not completed', () => {
      const now = makeDate('2026-08-24 13:05'); // past 13:00
      const state = calculateSLAState(245, 240, now, dueAt);
      expect(state).toBe(SLAState.BREACHED);
    });
  });

  describe('getBusinessMinutesBetween and getSLARemainingMinutes', () => {
    it('accurately counts business minutes spanning across days', () => {
      // Monday 16:00 to Tuesday 11:00 = 2 hours on Mon + 2 hours on Tue = 4 hours (240 mins)
      const start = makeDate('2026-08-24 16:00');
      const end = makeDate('2026-08-25 11:00');
      const minutes = getBusinessMinutesBetween(start, end, [], TEST_CONFIG);
      expect(minutes).toBe(240);
    });

    it('returns 0 remaining minutes when current time is past due', () => {
      const now = makeDate('2026-08-24 14:00');
      const due = makeDate('2026-08-24 12:00');
      const remaining = getSLARemainingMinutes(now, due, [], TEST_CONFIG);
      expect(remaining).toBe(0);
    });
  });

  describe('computeSLAInfo end-to-end', () => {
    it('correctly calculates URGENT ticket (1h response, 4h resolution)', () => {
      const createdAt = makeDate('2026-08-24 10:00');
      const now = makeDate('2026-08-24 10:30'); // 30 mins elapsed (50% response budget)

      const slaInfo = computeSLAInfo(
        { createdAt, priority: Priority.URGENT },
        [],
        TEST_CONFIG,
        now,
      );

      expect(slaInfo.firstResponseState).toBe(SLAState.ON_TRACK);
      expect(slaInfo.firstResponseRemainingMinutes).toBe(30);
      expect(slaInfo.resolutionState).toBe(SLAState.ON_TRACK);
      expect(slaInfo.resolutionRemainingMinutes).toBe(210);
    });

    it('transitions to AT_RISK when response budget consumed is > 75%', () => {
      const createdAt = makeDate('2026-08-24 10:00');
      // URGENT response is 60m. At 10:46, 46 mins elapsed (46/60 = 76.6% -> AT_RISK)
      const now = makeDate('2026-08-24 10:46');

      const slaInfo = computeSLAInfo(
        { createdAt, priority: Priority.URGENT },
        [],
        TEST_CONFIG,
        now,
      );

      expect(slaInfo.firstResponseState).toBe(SLAState.AT_RISK);
      expect(slaInfo.firstResponseRemainingMinutes).toBe(14);
    });

    it('transitions to BREACHED when response budget has passed without comment', () => {
      const createdAt = makeDate('2026-08-24 10:00');
      const now = makeDate('2026-08-24 11:05'); // Past 11:00 deadline

      const slaInfo = computeSLAInfo(
        { createdAt, priority: Priority.URGENT },
        [],
        TEST_CONFIG,
        now,
      );

      expect(slaInfo.firstResponseState).toBe(SLAState.BREACHED);
      expect(slaInfo.firstResponseRemainingMinutes).toBe(0);
    });

    it('freezes clock permanently when firstResponseAt occurs on time', () => {
      const createdAt = makeDate('2026-08-24 10:00'); // Due: 11:00
      const firstResponseAt = makeDate('2026-08-24 10:40'); // Responded in 40 mins (on time)
      // Check 2 weeks later
      const muchLater = makeDate('2026-09-07 14:00');

      const slaInfo = computeSLAInfo(
        {
          createdAt,
          priority: Priority.URGENT,
          firstResponseAt,
        },
        [],
        TEST_CONFIG,
        muchLater,
      );

      // Must remain ON_TRACK forever
      expect(slaInfo.firstResponseState).toBe(SLAState.ON_TRACK);
      expect(slaInfo.firstResponseRemainingMinutes).toBe(0);
    });

    it('freezes clock as BREACHED if firstResponseAt occurred after deadline', () => {
      const createdAt = makeDate('2026-08-24 10:00'); // Due: 11:00
      const firstResponseAt = makeDate('2026-08-24 11:15'); // Responded 15 mins late
      const muchLater = makeDate('2026-09-07 14:00');

      const slaInfo = computeSLAInfo(
        {
          createdAt,
          priority: Priority.URGENT,
          firstResponseAt,
        },
        [],
        TEST_CONFIG,
        muchLater,
      );

      expect(slaInfo.firstResponseState).toBe(SLAState.BREACHED);
      expect(slaInfo.firstResponseRemainingMinutes).toBe(0);
    });

    it('freezes resolution clock permanently when ticket is resolved on time', () => {
      const createdAt = makeDate('2026-08-24 09:00'); // HIGH priority -> 24 business hours
      // 24 business hours from Mon 09:00 is Wed 15:00
      const resolvedAt = makeDate('2026-08-26 14:00'); // Resolved on Wed 14:00 (1 hour before deadline)
      const oneMonthLater = makeDate('2026-09-24 10:00');

      const slaInfo = computeSLAInfo(
        {
          createdAt,
          priority: Priority.HIGH,
          resolvedAt,
        },
        [],
        TEST_CONFIG,
        oneMonthLater,
      );

      expect(slaInfo.resolutionState).toBe(SLAState.ON_TRACK);
      expect(slaInfo.resolutionRemainingMinutes).toBe(0);
    });
  });

  describe('Policy Matrix Integrity', () => {
    it('has correct policy numbers per assignment specification', () => {
      expect(SLA_POLICIES.URGENT).toEqual({ firstResponseMinutes: 60, resolutionMinutes: 240 });
      expect(SLA_POLICIES.HIGH).toEqual({ firstResponseMinutes: 240, resolutionMinutes: 1440 });
      expect(SLA_POLICIES.MEDIUM).toEqual({ firstResponseMinutes: 480, resolutionMinutes: 2880 });
      expect(SLA_POLICIES.LOW).toEqual({ firstResponseMinutes: 1440, resolutionMinutes: 4320 });
    });
  });
});
