import { describe, expect, it } from "vitest";
import {
  SRS_V2_FEE_CONFIG,
  applyCommissionDiscount,
  calculateContractMonthFee,
  calculateShortJobFee,
  findActiveFeeConfig,
  levelForLoyaltyMonth,
  type FeeConfig,
} from "./fees";

describe("Appendix B worked examples", () => {
  it("nanny 80,000/mo, loyalty months 1-12: 9,600 commission, 89,600 employer pays", () => {
    const result = calculateContractMonthFee(80_000, 1, SRS_V2_FEE_CONFIG);
    expect(result.loyaltyLevel).toBe(1);
    expect(result.rateBasisPoints).toBe(1200);
    expect(result.commission).toBe(9_600);
    expect(result.workerReceives).toBe(80_000);
    expect(result.employerPays).toBe(89_600);
  });

  it("same nanny, loyalty months 13-24: 4,800 commission, 84,800 employer pays", () => {
    const result = calculateContractMonthFee(80_000, 13, SRS_V2_FEE_CONFIG);
    expect(result.loyaltyLevel).toBe(2);
    expect(result.commission).toBe(4_800);
    expect(result.employerPays).toBe(84_800);
  });

  it("same nanny, loyalty month 25 onward: 3,200 commission, 83,200 employer pays", () => {
    const result = calculateContractMonthFee(80_000, 25, SRS_V2_FEE_CONFIG);
    expect(result.loyaltyLevel).toBe(3);
    expect(result.commission).toBe(3_200);
    expect(result.employerPays).toBe(83_200);
    // "onwards" has no upper bound.
    const farFuture = calculateContractMonthFee(80_000, 500, SRS_V2_FEE_CONFIG);
    expect(farFuture.loyaltyLevel).toBe(3);
  });

  it("short job, 30,000 one-time: 4,200 commission, 34,200 employer pays, worker gets 30,000", () => {
    const result = calculateShortJobFee(30_000, SRS_V2_FEE_CONFIG);
    expect(result.commission).toBe(4_200);
    expect(result.workerReceives).toBe(30_000);
    expect(result.employerPays).toBe(34_200);
  });

  it("one-month contract, 75,000: treated as a short job, 10,500 commission, 85,500 employer pays", () => {
    const result = calculateShortJobFee(75_000, SRS_V2_FEE_CONFIG);
    expect(result.commission).toBe(10_500);
    expect(result.employerPays).toBe(85_500);
  });

  it("replacement after 8 months, new contract months 1-4 continue at loyalty months 9-12", () => {
    const result = calculateContractMonthFee(80_000, 9, SRS_V2_FEE_CONFIG);
    expect(result.loyaltyLevel).toBe(1);
    expect(result.commission).toBe(9_600);
    expect(result.employerPays).toBe(89_600);
  });

  it("same replacement's month 5 lands on loyalty month 13, dropping to Level 2", () => {
    const result = calculateContractMonthFee(80_000, 13, SRS_V2_FEE_CONFIG);
    expect(result.loyaltyLevel).toBe(2);
    expect(result.commission).toBe(4_800);
    expect(result.employerPays).toBe(84_800);
  });

  it("rounding check: 83,333 XAF at Level 1 (12%) rounds to 10,000 commission", () => {
    const result = calculateContractMonthFee(83_333, 1, SRS_V2_FEE_CONFIG);
    expect(result.commission).toBe(10_000);
  });
});

describe("levelForLoyaltyMonth", () => {
  it("resolves the boundary months correctly", () => {
    expect(levelForLoyaltyMonth(12, SRS_V2_FEE_CONFIG).levelNumber).toBe(1);
    expect(levelForLoyaltyMonth(13, SRS_V2_FEE_CONFIG).levelNumber).toBe(2);
    expect(levelForLoyaltyMonth(24, SRS_V2_FEE_CONFIG).levelNumber).toBe(2);
    expect(levelForLoyaltyMonth(25, SRS_V2_FEE_CONFIG).levelNumber).toBe(3);
  });

  it("rejects a non-positive month number", () => {
    expect(() => levelForLoyaltyMonth(0, SRS_V2_FEE_CONFIG)).toThrow();
    expect(() => levelForLoyaltyMonth(-1, SRS_V2_FEE_CONFIG)).toThrow();
  });

  it("throws if no configured level covers the month (misconfiguration guard)", () => {
    const gappyConfig = {
      ...SRS_V2_FEE_CONFIG,
      loyaltyLevels: [{ levelNumber: 1 as const, fromMonth: 1, toMonth: 5, rateBasisPoints: 1200 }],
    };
    expect(() => levelForLoyaltyMonth(6, gappyConfig)).toThrow();
  });
});

describe("applyCommissionDiscount (BR-FEE-5)", () => {
  it("reduces the commission only", () => {
    expect(applyCommissionDiscount(9_600, 2_000)).toBe(7_600);
  });

  it("never goes below zero", () => {
    expect(applyCommissionDiscount(1_000, 5_000)).toBe(0);
  });
});

describe("findActiveFeeConfig (BR-FEE-4: effective-dated configuration)", () => {
  const older: FeeConfig = { ...SRS_V2_FEE_CONFIG, effectiveFrom: "2025-01-01" };
  const current: FeeConfig = SRS_V2_FEE_CONFIG;
  const configs = [older, current];

  it("picks the latest config not after the given date", () => {
    expect(findActiveFeeConfig(configs, "2026-06-01")).toBe(current);
  });

  it("keeps the running-latest when a later array entry is not actually newer", () => {
    // Exercises the reduce's "keep latest" branch, not just "replace with candidate".
    expect(findActiveFeeConfig([current, older], "2026-06-01")).toBe(current);
  });

  it("falls back to an earlier config when the date predates the newer one", () => {
    expect(findActiveFeeConfig(configs, "2025-06-01")).toBe(older);
  });

  it("throws when no config is effective yet", () => {
    expect(() => findActiveFeeConfig(configs, "2024-01-01")).toThrow();
  });
});
