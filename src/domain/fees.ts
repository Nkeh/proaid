import { applyRateRoundHalfUp, subtractClampedAtZero } from "./money";

/** SRS §2 glossary: a "short job" is a one-time job or a contract of one month or less (BR-FEE-6). */
export type ContractKind = "SHORT_JOB" | "LONG_CONTRACT";

export interface LoyaltyLevel {
  levelNumber: 1 | 2 | 3;
  /** 1-indexed loyalty month this level starts at. */
  fromMonth: number;
  /** 1-indexed loyalty month this level ends at (inclusive), or null for "and onwards". */
  toMonth: number | null;
  rateBasisPoints: number;
}

export interface FeeConfig {
  /** ISO date this configuration takes effect (BR-FEE-4: effective-dated, never retroactive). */
  effectiveFrom: string;
  shortJobRateBasisPoints: number;
  /** Ascending, contiguous, non-overlapping loyalty levels (BR-LOY-7). */
  loyaltyLevels: LoyaltyLevel[];
}

/** SRS §3.1 BR-FEE table: short jobs 14%; long-contract loyalty levels 12% / 6% / 4%. */
export const SRS_V2_FEE_CONFIG: FeeConfig = {
  effectiveFrom: "2026-01-01",
  shortJobRateBasisPoints: 1400,
  loyaltyLevels: [
    { levelNumber: 1, fromMonth: 1, toMonth: 12, rateBasisPoints: 1200 },
    { levelNumber: 2, fromMonth: 13, toMonth: 24, rateBasisPoints: 600 },
    { levelNumber: 3, fromMonth: 25, toMonth: null, rateBasisPoints: 400 },
  ],
};

/** Picks the configuration in effect as of a given date — the latest one not after `asOfDate`. */
export function findActiveFeeConfig(configs: FeeConfig[], asOfDate: string): FeeConfig {
  const eligible = configs.filter((c) => c.effectiveFrom <= asOfDate);
  if (eligible.length === 0) {
    throw new Error(`no fee config is effective as of ${asOfDate}`);
  }
  return eligible.reduce((latest, candidate) =>
    candidate.effectiveFrom > latest.effectiveFrom ? candidate : latest
  );
}

/** Resolves which loyalty level a given loyalty month number falls under (BR-LOY-7). */
export function levelForLoyaltyMonth(loyaltyMonthNumber: number, config: FeeConfig): LoyaltyLevel {
  if (!Number.isInteger(loyaltyMonthNumber) || loyaltyMonthNumber < 1) {
    throw new Error("loyaltyMonthNumber must be a positive integer");
  }
  const level = config.loyaltyLevels.find(
    (l) => loyaltyMonthNumber >= l.fromMonth && (l.toMonth === null || loyaltyMonthNumber <= l.toMonth)
  );
  if (!level) {
    throw new Error(`no loyalty level configured for loyalty month ${loyaltyMonthNumber}`);
  }
  return level;
}

export interface FeeBreakdown {
  rateBasisPoints: number;
  commission: number;
  workerReceives: number;
  employerPays: number;
}

/** BR-FEE-1/2/6: a short job's flat, one-time commission — does not count towards loyalty (BR-LOY-4). */
export function calculateShortJobFee(wage: number, config: FeeConfig): FeeBreakdown {
  const commission = applyRateRoundHalfUp(wage, config.shortJobRateBasisPoints);
  return {
    rateBasisPoints: config.shortJobRateBasisPoints,
    commission,
    workerReceives: wage,
    employerPays: wage + commission,
  };
}

export interface ContractMonthFee extends FeeBreakdown {
  loyaltyMonthNumber: number;
  loyaltyLevel: 1 | 2 | 3;
}

/**
 * BR-FEE-1/2/3/4: one long-contract month's commission, priced at the loyalty level that
 * applies to its (already-assigned, frozen-at-signing) loyalty month number.
 */
export function calculateContractMonthFee(
  wage: number,
  loyaltyMonthNumber: number,
  config: FeeConfig
): ContractMonthFee {
  const level = levelForLoyaltyMonth(loyaltyMonthNumber, config);
  const commission = applyRateRoundHalfUp(wage, level.rateBasisPoints);
  return {
    loyaltyMonthNumber,
    loyaltyLevel: level.levelNumber,
    rateBasisPoints: level.rateBasisPoints,
    commission,
    workerReceives: wage,
    employerPays: wage + commission,
  };
}

/** BR-FEE-5: a discount reduces the commission only, never the wage, and never below zero. */
export function applyCommissionDiscount(commission: number, discount: number): number {
  return subtractClampedAtZero(commission, discount);
}
