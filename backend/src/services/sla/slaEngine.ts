export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SLAState {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  BREACHED = 'BREACHED',
}
import { toZonedTime } from 'date-fns-tz';
import { addDays, startOfDay } from 'date-fns';
import {
  addBusinessMinutes,
  snapToNextBusinessMoment,
  isBusinessDay,
  BusinessHoursConfig,
  HolidayItem,
  DEFAULT_BUSINESS_CONFIG,
} from './businessHours';

export interface SLAPolicy {
  firstResponseMinutes: number;
  resolutionMinutes: number;
}

export const SLA_POLICIES: Record<Priority, SLAPolicy> = {
  URGENT: {
    firstResponseMinutes: 1 * 60, // 60 mins (1 business hour)
    resolutionMinutes: 4 * 60, // 240 mins (4 business hours)
  },
  HIGH: {
    firstResponseMinutes: 4 * 60, // 240 mins (4 business hours)
    resolutionMinutes: 24 * 60, // 1440 mins (24 business hours)
  },
  MEDIUM: {
    firstResponseMinutes: 8 * 60, // 480 mins (8 business hours)
    resolutionMinutes: 48 * 60, // 2880 mins (48 business hours)
  },
  LOW: {
    firstResponseMinutes: 24 * 60, // 1440 mins (24 business hours)
    resolutionMinutes: 72 * 60, // 4320 mins (72 business hours)
  },
};

export interface SLAInfo {
  firstResponseDueAt: string;
  resolutionDueAt: string;
  firstResponseState: SLAState;
  resolutionState: SLAState;
  firstResponseRemainingMinutes: number;
  resolutionRemainingMinutes: number;
}

export interface TicketSLAInput {
  createdAt: Date;
  priority: Priority;
  firstResponseAt?: Date | null;
  resolvedAt?: Date | null;
}

function setZonedTime(zonedDate: Date, hour: number, minute: number): Date {
  const cloned = new Date(zonedDate.getTime());
  cloned.setHours(hour, minute, 0, 0);
  return cloned;
}

/**
 * Calculates total elapsed business minutes between two timestamps.
 * Skips weekends, holidays, and outside business hours.
 */
export function getBusinessMinutesBetween(
  startUtc: Date,
  endUtc: Date,
  holidays: HolidayItem[] = [],
  config: BusinessHoursConfig = DEFAULT_BUSINESS_CONFIG,
): number {
  if (endUtc.getTime() <= startUtc.getTime()) {
    return 0;
  }

  let zonedCursor = snapToNextBusinessMoment(startUtc, holidays, config);
  const zonedTarget = toZonedTime(endUtc, config.timeZone);

  if (zonedCursor.getTime() >= zonedTarget.getTime()) {
    return 0;
  }

  let accumulatedMinutes = 0;
  let reachedEnd = false;

  while (!reachedEnd) {
    if (!isBusinessDay(zonedCursor, holidays, config.timeZone)) {
      const nextDay = startOfDay(addDays(zonedCursor, 1));
      zonedCursor = setZonedTime(nextDay, config.startHour, config.startMinute);
      if (zonedCursor.getTime() >= zonedTarget.getTime()) {
        reachedEnd = true;
      }
      continue;
    }

    const startOfWork = setZonedTime(zonedCursor, config.startHour, config.startMinute);
    const endOfWork = setZonedTime(zonedCursor, config.endHour, config.endMinute);

    const effectiveStart = zonedCursor.getTime() < startOfWork.getTime() ? startOfWork : zonedCursor;

    if (effectiveStart.getTime() >= endOfWork.getTime()) {
      const nextDay = startOfDay(addDays(zonedCursor, 1));
      zonedCursor = setZonedTime(nextDay, config.startHour, config.startMinute);
      if (zonedCursor.getTime() >= zonedTarget.getTime()) {
        reachedEnd = true;
      }
      continue;
    }

    // Check if target is on the same day as zonedCursor
    const isTargetSameDay =
      zonedTarget.getFullYear() === zonedCursor.getFullYear() &&
      zonedTarget.getMonth() === zonedCursor.getMonth() &&
      zonedTarget.getDate() === zonedCursor.getDate();

    if (isTargetSameDay) {
      const effectiveEnd = zonedTarget.getTime() < endOfWork.getTime() ? zonedTarget : endOfWork;
      if (effectiveEnd.getTime() > effectiveStart.getTime()) {
        accumulatedMinutes += Math.floor(
          (effectiveEnd.getTime() - effectiveStart.getTime()) / (60 * 1000),
        );
      }
      reachedEnd = true;
    } else {
      accumulatedMinutes += Math.floor(
        (endOfWork.getTime() - effectiveStart.getTime()) / (60 * 1000),
      );
      const nextDay = startOfDay(addDays(zonedCursor, 1));
      zonedCursor = setZonedTime(nextDay, config.startHour, config.startMinute);
      if (zonedCursor.getTime() >= zonedTarget.getTime()) {
        reachedEnd = true;
      }
    }
  }

  return accumulatedMinutes;
}

/**
 * Calculates remaining business minutes from now until dueAt.
 * Returns 0 if current time has reached or surpassed dueAt.
 */
export function getSLARemainingMinutes(
  now: Date,
  dueAt: Date,
  holidays: HolidayItem[] = [],
  config: BusinessHoursConfig = DEFAULT_BUSINESS_CONFIG,
): number {
  if (now.getTime() >= dueAt.getTime()) {
    return 0;
  }
  return getBusinessMinutesBetween(now, dueAt, holidays, config);
}

/**
 * Determines SLA State according to the exact 75% boundary specification:
 * - ON_TRACK: 0 <= consumed <= 75.0%
 * - AT_RISK: consumed > 75.0% and <= 100%
 * - BREACHED: deadline passed without milestone completed, or completed after deadline
 */
export function calculateSLAState(
  elapsedBusinessMinutes: number,
  totalBudgetMinutes: number,
  now: Date,
  dueAt: Date,
  completedAt?: Date | null,
): SLAState {
  if (completedAt) {
    // Clock frozen permanently
    return completedAt.getTime() <= dueAt.getTime() ? SLAState.ON_TRACK : SLAState.BREACHED;
  }

  if (now.getTime() > dueAt.getTime()) {
    return SLAState.BREACHED;
  }

  const ratio = elapsedBusinessMinutes / totalBudgetMinutes;
  // Exact 75% boundary rule: exactly 75.0% is ON_TRACK; strictly > 75% is AT_RISK
  if (ratio > 0.75) {
    return SLAState.AT_RISK;
  }

  return SLAState.ON_TRACK;
}

/**
 * Single entry point for all SLA data required by GraphQL resolvers and UI.
 * Pure and deterministic.
 */
export function computeSLAInfo(
  ticket: TicketSLAInput,
  holidays: HolidayItem[] = [],
  config: BusinessHoursConfig = DEFAULT_BUSINESS_CONFIG,
  now: Date = new Date(),
): SLAInfo {
  const policy = SLA_POLICIES[ticket.priority] || SLA_POLICIES.MEDIUM;

  const firstResponseDueAt = addBusinessMinutes(
    ticket.createdAt,
    policy.firstResponseMinutes,
    holidays,
    config,
  );

  const resolutionDueAt = addBusinessMinutes(
    ticket.createdAt,
    policy.resolutionMinutes,
    holidays,
    config,
  );

  // First Response SLA calculation
  const elapsedFirstResponse = getBusinessMinutesBetween(
    ticket.createdAt,
    ticket.firstResponseAt || now,
    holidays,
    config,
  );

  const firstResponseState = calculateSLAState(
    elapsedFirstResponse,
    policy.firstResponseMinutes,
    now,
    firstResponseDueAt,
    ticket.firstResponseAt,
  );

  const firstResponseRemainingMinutes = ticket.firstResponseAt
    ? 0
    : getSLARemainingMinutes(now, firstResponseDueAt, holidays, config);

  // Resolution SLA calculation
  const elapsedResolution = getBusinessMinutesBetween(
    ticket.createdAt,
    ticket.resolvedAt || now,
    holidays,
    config,
  );

  const resolutionState = calculateSLAState(
    elapsedResolution,
    policy.resolutionMinutes,
    now,
    resolutionDueAt,
    ticket.resolvedAt,
  );

  const resolutionRemainingMinutes = ticket.resolvedAt
    ? 0
    : getSLARemainingMinutes(now, resolutionDueAt, holidays, config);

  return {
    firstResponseDueAt: firstResponseDueAt.toISOString(),
    resolutionDueAt: resolutionDueAt.toISOString(),
    firstResponseState,
    resolutionState,
    firstResponseRemainingMinutes,
    resolutionRemainingMinutes,
  };
}
