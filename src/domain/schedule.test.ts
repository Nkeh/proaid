import { describe, expect, it } from "vitest";
import { SRS_V2_FEE_CONFIG } from "./fees";
import type { LoyaltyMonthRecord } from "./loyalty";
import {
  addDays,
  addMonthsClamped,
  daysBetween,
  daysInMonth,
  generateHalfAndHalfPeriods,
  generateMonthlyPeriods,
  isLeapYear,
  prorateFinalContractMonth,
} from "./schedule";

const EMPLOYER = "employer-1";

/** Builds `count` pre-existing PENDING records for the employer, to seed reservedLoyaltyMonths. */
function priorLoyaltyHistory(count: number): LoyaltyMonthRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    loyaltyMonthNumber: i + 1,
    employerId: EMPLOYER,
    contractId: "prior-contract",
    contractMonthNumber: i + 1,
    monthStartDate: `2025-${String((i % 12) + 1).padStart(2, "0")}-01`,
    state: "FUNDED" as const,
  }));
}

describe("parseIso guard (via addDays)", () => {
  it("rejects a malformed ISO date string", () => {
    expect(() => addDays("not-a-date", 1)).toThrow();
  });
});

describe("addMonthsClamped (BR-PAY-2: 31st-of-the-month rule)", () => {
  it("clamps independently per occurrence across a leap year, not cascading", () => {
    const start = "2024-01-31"; // 2024 is a leap year
    expect(addMonthsClamped(start, 0)).toBe("2024-01-31");
    expect(addMonthsClamped(start, 1)).toBe("2024-02-29"); // leap Feb clamp
    expect(addMonthsClamped(start, 2)).toBe("2024-03-31"); // back to 31, not cascaded from Feb
    expect(addMonthsClamped(start, 3)).toBe("2024-04-30"); // April has 30 days
    expect(addMonthsClamped(start, 4)).toBe("2024-05-31");
  });

  it("clamps to Feb 28 in a non-leap year", () => {
    expect(addMonthsClamped("2025-01-31", 1)).toBe("2025-02-28");
  });

  it("rolls over the year boundary", () => {
    expect(addMonthsClamped("2025-11-15", 2)).toBe("2026-01-15");
  });
});

describe("addDays / daysBetween", () => {
  it("adds and subtracts days across a month boundary", () => {
    expect(addDays("2026-01-28", 5)).toBe("2026-02-02");
    expect(addDays("2026-02-02", -5)).toBe("2026-01-28");
  });

  it("computes the day span between two dates", () => {
    expect(daysBetween("2026-01-01", "2026-02-01")).toBe(31);
  });
});

describe("isLeapYear / daysInMonth", () => {
  it("identifies leap years correctly, including century rules", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false); // divisible by 100 but not 400
    expect(isLeapYear(2000)).toBe(true); // divisible by 400
  });

  it("returns 29 for February in a leap year, 28 otherwise", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
  });
});

describe("generateMonthlyPeriods — Appendix B: employer at loyalty month 11, new 4-month contract at 100,000", () => {
  it("prices months 1-2 at Level 1 (12,000) and months 3-4 at Level 2 (6,000)", () => {
    const history = priorLoyaltyHistory(10); // next assignment starts at loyalty month 11
    const { periods, loyaltyRecords } = generateMonthlyPeriods(
      EMPLOYER,
      "new-contract",
      "2026-03-01",
      4,
      100_000,
      history,
      SRS_V2_FEE_CONFIG
    );

    expect(loyaltyRecords.map((r) => r.loyaltyMonthNumber)).toEqual([11, 12, 13, 14]);
    expect(periods).toHaveLength(4);
    expect(periods[0].commissionTotal).toBe(12_000);
    expect(periods[0].employerPaysTotal).toBe(112_000);
    expect(periods[1].commissionTotal).toBe(12_000);
    expect(periods[1].employerPaysTotal).toBe(112_000);
    expect(periods[2].commissionTotal).toBe(6_000);
    expect(periods[2].employerPaysTotal).toBe(106_000);
    expect(periods[3].commissionTotal).toBe(6_000);
    expect(periods[3].employerPaysTotal).toBe(106_000);
  });

  it("derives period boundaries, the funding window, and the payment date", () => {
    const { periods } = generateMonthlyPeriods(
      EMPLOYER,
      "c1",
      "2026-01-15",
      2,
      80_000,
      [],
      SRS_V2_FEE_CONFIG
    );
    expect(periods[0].startDate).toBe("2026-01-15");
    expect(periods[0].endDate).toBe("2026-02-14");
    expect(periods[0].fundingWindowEndDate).toBe("2026-01-24"); // first 10 days
    expect(periods[0].paymentDate).toBe(periods[0].endDate);
    expect(periods[1].startDate).toBe("2026-02-15");
    expect(periods[1].endDate).toBe("2026-03-14");
  });
});

describe("generateMonthlyPeriods guard", () => {
  it("rejects a non-positive durationMonths", () => {
    expect(() =>
      generateMonthlyPeriods(EMPLOYER, "c1", "2026-01-01", 0, 80_000, [], SRS_V2_FEE_CONFIG)
    ).toThrow();
  });
});

describe("generateHalfAndHalfPeriods — Appendix B: 4-month, 75,000/mo, new employer", () => {
  it("charges 18,000 commission and 168,000 employer-pays per half", () => {
    const { periods } = generateHalfAndHalfPeriods(
      EMPLOYER,
      "c1",
      "2026-03-01",
      "2026-06-30",
      4,
      75_000,
      [],
      SRS_V2_FEE_CONFIG
    );
    expect(periods).toHaveLength(2);
    expect(periods[0].wageTotal).toBe(150_000);
    expect(periods[0].commissionTotal).toBe(18_000);
    expect(periods[0].employerPaysTotal).toBe(168_000);
    expect(periods[1].wageTotal).toBe(150_000);
    expect(periods[1].commissionTotal).toBe(18_000);
    expect(periods[1].employerPaysTotal).toBe(168_000);
  });
});

describe("generateHalfAndHalfPeriods — Appendix B: employer at loyalty month 11, new 4-month contract at 100,000", () => {
  it("charges 24,000 for the first half (Level 1) and 12,000 for the second (Level 2)", () => {
    const history = priorLoyaltyHistory(10);
    const { periods, loyaltyRecords } = generateHalfAndHalfPeriods(
      EMPLOYER,
      "c1",
      "2026-03-01",
      "2026-06-30",
      4,
      100_000,
      history,
      SRS_V2_FEE_CONFIG
    );
    expect(loyaltyRecords.map((r) => r.loyaltyMonthNumber)).toEqual([11, 12, 13, 14]);
    expect(periods[0].wageTotal).toBe(200_000);
    expect(periods[0].commissionTotal).toBe(24_000);
    expect(periods[0].employerPaysTotal).toBe(224_000);
    expect(periods[1].wageTotal).toBe(200_000);
    expect(periods[1].commissionTotal).toBe(12_000);
    expect(periods[1].employerPaysTotal).toBe(212_000);
  });

  it("rejects an odd durationMonths", () => {
    expect(() =>
      generateHalfAndHalfPeriods(EMPLOYER, "c1", "2026-01-01", "2026-04-30", 3, 100_000, [], SRS_V2_FEE_CONFIG)
    ).toThrow();
  });

  it("rejects a contractEndDate inconsistent with the duration", () => {
    expect(() =>
      generateHalfAndHalfPeriods(
        EMPLOYER,
        "c1",
        "2026-01-01",
        "2026-05-31", // wrong — 4 months from Jan 1 ends Apr 30
        4,
        100_000,
        [],
        SRS_V2_FEE_CONFIG
      )
    ).toThrow();
  });
});

describe("prorateFinalContractMonth (BR-CAN-2)", () => {
  it("prorates by actual days worked in a leap-year February (29 days)", () => {
    const result = prorateFinalContractMonth(80_000, 15, 29, 1, SRS_V2_FEE_CONFIG);
    // 80,000 * 15 / 29 = 41,379.31... -> rounds to 41,379
    expect(result.wage).toBe(41_379);
    expect(result.loyaltyLevel).toBe(1);
  });

  it("prorates by actual days worked in a non-leap February (28 days)", () => {
    const result = prorateFinalContractMonth(80_000, 14, 28, 1, SRS_V2_FEE_CONFIG);
    expect(result.wage).toBe(40_000);
    expect(result.commission).toBe(4_800); // 40,000 * 12%
  });

  it("keeps the already-frozen loyalty level/rate untouched, only scaling the wage", () => {
    const result = prorateFinalContractMonth(80_000, 10, 30, 13, SRS_V2_FEE_CONFIG);
    expect(result.loyaltyMonthNumber).toBe(13);
    expect(result.loyaltyLevel).toBe(2);
    expect(result.rateBasisPoints).toBe(600);
  });

  it("rejects actualDays outside [0, totalDaysInMonth]", () => {
    expect(() => prorateFinalContractMonth(80_000, 31, 30, 1, SRS_V2_FEE_CONFIG)).toThrow();
    expect(() => prorateFinalContractMonth(80_000, -1, 30, 1, SRS_V2_FEE_CONFIG)).toThrow();
  });
});
