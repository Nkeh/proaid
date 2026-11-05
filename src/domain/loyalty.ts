/**
 * Pure, derived-from-history loyalty assignment (BR-LOY-1..7). There is no mutable counter
 * field anywhere — every count is derived by filtering the append-only `LoyaltyMonthRecord[]`
 * history. OD-01 (decided): concurrent long contracts each add their own loyalty months; they
 * are never deduplicated onto one calendar month.
 *
 * Three-state design, reconciling two rules that would otherwise conflict:
 * - BR-FEE-4 requires a contract's per-month rate to be frozen the moment it is *signed*,
 *   before any of its months have actually funded.
 * - BR-LOY-2 (as corrected) counts *funded* months only toward the employer's displayed total.
 *
 * `reservedLoyaltyMonths` (state PENDING or FUNDED) answers "what number does the next month
 * get assigned, to freeze its rate now?" `countedLoyaltyMonths` (state FUNDED only) answers
 * "what does the employer's loyalty dashboard show right now?" A record moves PENDING -> FUNDED
 * the moment its period actually funds, and PENDING|FUNDED -> REMOVED when it either will never
 * fund (contract cancelled/terminated/suspended before that month, or its period was cancelled)
 * or was fully refunded after a dispute (BR-LOY-6) — in both cases freeing its number so it is
 * never counted, while a still-unassigned future month is simply never given a number at all.
 */

import { levelForLoyaltyMonth, type FeeConfig } from "./fees";

export type LoyaltyMonthState = "PENDING" | "FUNDED" | "REMOVED";

export interface LoyaltyMonthRecord {
  loyaltyMonthNumber: number;
  employerId: string;
  contractId: string;
  /** 1-indexed month within this specific contract. */
  contractMonthNumber: number;
  monthStartDate: string;
  state: LoyaltyMonthState;
}

function forEmployer(history: LoyaltyMonthRecord[], employerId: string): LoyaltyMonthRecord[] {
  return history.filter((r) => r.employerId === employerId);
}

/** Months reserved for rate-freezing purposes: not yet removed, whether pending or funded. */
export function reservedLoyaltyMonths(history: LoyaltyMonthRecord[], employerId: string): number {
  return forEmployer(history, employerId).filter((r) => r.state !== "REMOVED").length;
}

/** Months that actually count on the employer's loyalty dashboard (BR-LOY-2, corrected). */
export function countedLoyaltyMonths(history: LoyaltyMonthRecord[], employerId: string): number {
  return forEmployer(history, employerId).filter((r) => r.state === "FUNDED").length;
}

/** The loyalty month number a newly-signed contract's first month should be assigned. */
export function nextLoyaltyMonthNumber(history: LoyaltyMonthRecord[], employerId: string): number {
  return reservedLoyaltyMonths(history, employerId) + 1;
}

/**
 * Reserves a chronological block of loyalty month numbers for a newly-signed long contract,
 * one PENDING record per contract month, starting at `nextLoyaltyMonthNumber` (BR-FEE-4: this
 * freezes each month's rate at signing, even though none of them have funded yet).
 */
export function assignLoyaltyMonths(
  history: LoyaltyMonthRecord[],
  employerId: string,
  contractId: string,
  monthStartDates: string[]
): LoyaltyMonthRecord[] {
  const startNumber = nextLoyaltyMonthNumber(history, employerId);
  return monthStartDates.map((monthStartDate, index) => ({
    loyaltyMonthNumber: startNumber + index,
    employerId,
    contractId,
    contractMonthNumber: index + 1,
    monthStartDate,
    state: "PENDING" as const,
  }));
}

function updateRecord(
  history: LoyaltyMonthRecord[],
  employerId: string,
  contractId: string,
  contractMonthNumber: number,
  fromStates: LoyaltyMonthState[],
  toState: LoyaltyMonthState
): LoyaltyMonthRecord[] {
  let matched = false;
  const next = history.map((record) => {
    if (
      record.employerId === employerId &&
      record.contractId === contractId &&
      record.contractMonthNumber === contractMonthNumber &&
      fromStates.includes(record.state)
    ) {
      matched = true;
      return { ...record, state: toState };
    }
    return record;
  });
  if (!matched) {
    throw new Error(
      `no loyalty record in state [${fromStates.join(", ")}] for contract ${contractId} month ${contractMonthNumber}`
    );
  }
  return next;
}

/** Promotes a month to FUNDED the moment its payment period actually funds — this is what makes it count. */
export function markLoyaltyMonthFunded(
  history: LoyaltyMonthRecord[],
  employerId: string,
  contractId: string,
  contractMonthNumber: number
): LoyaltyMonthRecord[] {
  return updateRecord(history, employerId, contractId, contractMonthNumber, ["PENDING"], "FUNDED");
}

/**
 * Marks a month REMOVED: either a FUNDED month fully refunded after a dispute (BR-LOY-6), or a
 * PENDING month that will now never fund. Frees its number from `reservedLoyaltyMonths` so a
 * later-signed contract isn't priced on months that never happened.
 */
export function markLoyaltyMonthRemoved(
  history: LoyaltyMonthRecord[],
  employerId: string,
  contractId: string,
  contractMonthNumber: number
): LoyaltyMonthRecord[] {
  return updateRecord(
    history,
    employerId,
    contractId,
    contractMonthNumber,
    ["PENDING", "FUNDED"],
    "REMOVED"
  );
}

/**
 * Marks every still-PENDING month of a contract REMOVED in one call — the store's handler for a
 * contract being cancelled, terminated early, or suspended-and-never-resumed before those months
 * funded. FUNDED months are left untouched; a FUNDED month is only ever removed individually, via
 * `markLoyaltyMonthRemoved`, as a dispute decision (BR-LOY-6).
 */
export function removeUnfundedMonthsForContract(
  history: LoyaltyMonthRecord[],
  employerId: string,
  contractId: string
): LoyaltyMonthRecord[] {
  return history.map((record) =>
    record.employerId === employerId && record.contractId === contractId && record.state === "PENDING"
      ? { ...record, state: "REMOVED" as const }
      : record
  );
}

export interface LoyaltySummary {
  countedMonths: number;
  reservedMonths: number;
  /** The level the employer's dashboard currently shows, based on counted (funded) months. */
  currentLevel: 1 | 2 | 3;
  /** The level a contract signed right now would be assigned, based on reserved months. */
  nextAssignmentLevel: 1 | 2 | 3;
}

/** Powers the employer-dashboard loyalty card (BR-LOY-2 corrected: counted months only). */
export function summarizeLoyalty(
  history: LoyaltyMonthRecord[],
  employerId: string,
  config: FeeConfig
): LoyaltySummary {
  const countedMonths = countedLoyaltyMonths(history, employerId);
  const reservedMonths = reservedLoyaltyMonths(history, employerId);
  return {
    countedMonths,
    reservedMonths,
    currentLevel: levelForLoyaltyMonth(Math.max(countedMonths, 1), config).levelNumber,
    nextAssignmentLevel: levelForLoyaltyMonth(reservedMonths + 1, config).levelNumber,
  };
}
