export type ContractType = "SHORT_TERM" | "MONTHLY";

export interface CalculateFeeInput {
  contractType: ContractType;
  amount: number;
  /** 1-indexed month of the contract. Required for MONTHLY contracts, ignored for SHORT_TERM. */
  monthNumber?: number;
}

export interface FeeBreakdown {
  feeRate: number;
  feeAmount: number;
  providerAmount: number;
}

export const SHORT_TERM_FEE_RATE = 0.13;
export const MONTHLY_FEE_RATE_EARLY = 0.13;
export const MONTHLY_FEE_RATE_LATE = 0.1;
export const MONTHLY_RATE_DROP_AT_MONTH = 6;

/**
 * Pure fee calculator for ProAid contracts.
 *
 * Short-term: flat 13% platform fee on the total amount.
 * Monthly: 13% of each month's salary for months 1-5, then 10% from month 6 onward.
 * The provider always receives the remainder. Amounts are rounded to the nearest whole XAF.
 */
export function calculateFee({
  contractType,
  amount,
  monthNumber,
}: CalculateFeeInput): FeeBreakdown {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("amount must be a non-negative number");
  }

  let feeRate: number;
  if (contractType === "SHORT_TERM") {
    feeRate = SHORT_TERM_FEE_RATE;
  } else {
    const month = monthNumber ?? 1;
    feeRate =
      month >= MONTHLY_RATE_DROP_AT_MONTH
        ? MONTHLY_FEE_RATE_LATE
        : MONTHLY_FEE_RATE_EARLY;
  }

  const feeAmount = Math.round(amount * feeRate);
  const providerAmount = amount - feeAmount;

  return { feeRate, feeAmount, providerAmount };
}
