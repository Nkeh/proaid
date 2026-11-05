import { calculateContractMonthFee, type ContractMonthFee, type FeeConfig } from "./fees";
import { assignLoyaltyMonths, type LoyaltyMonthRecord } from "./loyalty";
import { divideRoundHalfUp } from "./money";
import type { PaymentPeriodStatus } from "./paymentPeriod";

/**
 * Integer, timezone-free civil-calendar arithmetic (Howard Hinnant's days_from_civil /
 * civil_from_days algorithm: http://howardhinnant.github.io/date_algorithms.html). No function
 * in this module ever touches a `Date` object or reads the system clock — every date is an ISO
 * "YYYY-MM-DD" string parameter, per CLAUDE.md's business-clock rule.
 */

interface CivilDate {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseIso(iso: string): CivilDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new Error(`invalid ISO date: ${iso}`);
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function formatIso({ year, month, day }: CivilDate): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysFromCivil({ year, month, day }: CivilDate): number {
  const y = year - (month <= 2 ? 1 : 0);
  const era = Math.floor((y >= 0 ? y : y - 399) / 400);
  const yoe = y - era * 400; // [0, 399]
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1; // [0, 365]
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; // [0, 146096]
  return era * 146097 + doe - 719468;
}

function civilFromDays(z: number): CivilDate {
  const zz = z + 719468;
  const era = Math.floor((zz >= 0 ? zz : zz - 146096) / 146097);
  const doe = zz - era * 146097; // [0, 146096]
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
  ); // [0, 399]
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)); // [0, 365]
  const mp = Math.floor((5 * doy + 2) / 153); // [0, 11]
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1; // [1, 31]
  const month = mp + (mp < 10 ? 3 : -9); // [1, 12]
  return { year: y + (month <= 2 ? 1 : 0), month, day };
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

/** Adds whole days to an ISO date, civil-calendar correct (no Date object, no timezone). */
export function addDays(iso: string, days: number): string {
  return formatIso(civilFromDays(daysFromCivil(parseIso(iso)) + days));
}

export function daysBetween(fromIso: string, toIso: string): number {
  return daysFromCivil(parseIso(toIso)) - daysFromCivil(parseIso(fromIso));
}

/**
 * Adds whole calendar months to an ISO date, clamping the day to the target month's last day
 * when it doesn't exist there (BR-PAY-2's 31st-of-the-month rule). Each occurrence clamps
 * independently against the *original* day — the clamp never cascades from one occurrence to
 * the next (e.g. a contract starting Jan 31 lands on Feb 28/29, then back on Mar 31, not Mar 28).
 */
export function addMonthsClamped(iso: string, months: number): string {
  const { year, month, day } = parseIso(iso);
  const zeroBasedMonth = month - 1 + months;
  const targetYear = year + Math.floor(zeroBasedMonth / 12);
  const targetMonth = ((zeroBasedMonth % 12) + 12) % 12 + 1;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return formatIso({ year: targetYear, month: targetMonth, day: targetDay });
}

export interface CommissionLine extends ContractMonthFee {
  contractMonthNumber: number;
  wage: number;
}

export interface PaymentPeriod {
  periodNumber: number;
  startDate: string;
  /** Inclusive last day of the period. */
  endDate: string;
  /** Last day of the funding window (BR-PAY-4: within the first 10 days). */
  fundingWindowEndDate: string;
  /** Default: the period's end date, unless the contract states otherwise (BR-PAY-6). */
  paymentDate: string;
  status: PaymentPeriodStatus;
  wageTotal: number;
  commissionTotal: number;
  employerPaysTotal: number;
  commissionLines: CommissionLine[];
}

const FUNDING_WINDOW_DAYS = 10;

function buildPeriod(
  periodNumber: number,
  startDate: string,
  endDate: string,
  commissionLines: CommissionLine[]
): PaymentPeriod {
  return {
    periodNumber,
    startDate,
    endDate,
    fundingWindowEndDate: addDays(startDate, FUNDING_WINDOW_DAYS - 1),
    paymentDate: endDate,
    status: "SCHEDULED",
    wageTotal: commissionLines.reduce((sum, l) => sum + l.wage, 0),
    commissionTotal: commissionLines.reduce((sum, l) => sum + l.commission, 0),
    employerPaysTotal: commissionLines.reduce((sum, l) => sum + l.employerPays, 0),
    commissionLines,
  };
}

export interface GeneratedSchedule {
  periods: PaymentPeriod[];
  loyaltyRecords: LoyaltyMonthRecord[];
}

/** BR-PAY-2: a Monthly long-contract schedule — one payment period per contract month. */
export function generateMonthlyPeriods(
  employerId: string,
  contractId: string,
  startDate: string,
  durationMonths: number,
  wagePerMonth: number,
  loyaltyHistory: LoyaltyMonthRecord[],
  feeConfig: FeeConfig
): GeneratedSchedule {
  if (!Number.isInteger(durationMonths) || durationMonths < 1) {
    throw new Error("durationMonths must be a positive integer");
  }

  const monthStartDates = Array.from({ length: durationMonths }, (_, i) =>
    addMonthsClamped(startDate, i)
  );
  const loyaltyRecords = assignLoyaltyMonths(loyaltyHistory, employerId, contractId, monthStartDates);

  const periods = monthStartDates.map((monthStart, index) => {
    const periodEnd = addDays(addMonthsClamped(startDate, index + 1), -1);
    const loyaltyRecord = loyaltyRecords[index];
    const fee = calculateContractMonthFee(wagePerMonth, loyaltyRecord.loyaltyMonthNumber, feeConfig);
    const line: CommissionLine = { ...fee, contractMonthNumber: index + 1, wage: wagePerMonth };
    return buildPeriod(index + 1, monthStart, periodEnd, [line]);
  });

  return { periods, loyaltyRecords };
}

/**
 * BR-PAY-3: a Half and Half long-contract schedule — two periods, each spanning half the
 * contract's months and carrying half the total wage. Requires an even `durationMonths` and a
 * `contractEndDate` consistent with it; the offer form (not this function) is the place that
 * catches an odd duration before the user ever sees this throw (see src/domain/ASSUMPTIONS.md).
 */
export function generateHalfAndHalfPeriods(
  employerId: string,
  contractId: string,
  startDate: string,
  contractEndDate: string,
  durationMonths: number,
  wagePerMonth: number,
  loyaltyHistory: LoyaltyMonthRecord[],
  feeConfig: FeeConfig
): GeneratedSchedule {
  if (!Number.isInteger(durationMonths) || durationMonths < 2 || durationMonths % 2 !== 0) {
    throw new Error("Half and Half requires an even durationMonths of at least 2");
  }
  const expectedEndDate = addDays(addMonthsClamped(startDate, durationMonths), -1);
  if (contractEndDate !== expectedEndDate) {
    throw new Error(
      `contractEndDate ${contractEndDate} is inconsistent with a ${durationMonths}-month contract starting ${startDate} (expected ${expectedEndDate})`
    );
  }

  const monthsPerHalf = durationMonths / 2;
  const monthStartDates = Array.from({ length: durationMonths }, (_, i) =>
    addMonthsClamped(startDate, i)
  );
  const loyaltyRecords = assignLoyaltyMonths(loyaltyHistory, employerId, contractId, monthStartDates);

  const midpoint = addMonthsClamped(startDate, monthsPerHalf);

  const buildHalf = (periodNumber: number, half: 0 | 1): PaymentPeriod => {
    const monthIndexes = Array.from({ length: monthsPerHalf }, (_, i) => half * monthsPerHalf + i);
    const lines: CommissionLine[] = monthIndexes.map((monthIndex) => {
      const loyaltyRecord = loyaltyRecords[monthIndex];
      const fee = calculateContractMonthFee(wagePerMonth, loyaltyRecord.loyaltyMonthNumber, feeConfig);
      return { ...fee, contractMonthNumber: monthIndex + 1, wage: wagePerMonth };
    });
    const halfStart = half === 0 ? startDate : midpoint;
    const halfEnd = half === 0 ? addDays(midpoint, -1) : contractEndDate;
    return buildPeriod(periodNumber, halfStart, halfEnd, lines);
  };

  return { periods: [buildHalf(1, 0), buildHalf(2, 1)], loyaltyRecords };
}

export interface ProratedMonth extends ContractMonthFee {
  wage: number;
  actualDays: number;
  totalDaysInMonth: number;
}

/**
 * BR-CAN-2: a long contract's final (partial) month, prorated by days actually worked. Uses the
 * actual day count of that specific contract-month (29 across a leap-year February) and keeps
 * the already-frozen loyalty number/level/rate untouched — only the wage (and, through the fee
 * formula, the commission) scale proportionally.
 */
export function prorateFinalContractMonth(
  fullMonthWage: number,
  actualDays: number,
  totalDaysInMonth: number,
  loyaltyMonthNumber: number,
  feeConfig: FeeConfig
): ProratedMonth {
  if (!Number.isInteger(actualDays) || actualDays < 0 || actualDays > totalDaysInMonth) {
    throw new Error("actualDays must be between 0 and totalDaysInMonth");
  }
  const proratedWage = divideRoundHalfUp(fullMonthWage * actualDays, totalDaysInMonth);
  const fee = calculateContractMonthFee(proratedWage, loyaltyMonthNumber, feeConfig);
  return { ...fee, wage: proratedWage, actualDays, totalDaysInMonth };
}
