import { describe, expect, it } from "vitest";
import { calculateFee } from "./fees";

describe("calculateFee", () => {
  it("applies 13% fee for month 1 of a monthly contract", () => {
    const result = calculateFee({
      contractType: "MONTHLY",
      amount: 150_000,
      monthNumber: 1,
    });
    expect(result.feeRate).toBe(0.13);
    expect(result.feeAmount).toBe(19_500);
    expect(result.providerAmount).toBe(130_500);
  });

  it("drops the fee to 10% from month 6 onward", () => {
    const result = calculateFee({
      contractType: "MONTHLY",
      amount: 150_000,
      monthNumber: 6,
    });
    expect(result.feeRate).toBe(0.1);
    expect(result.feeAmount).toBe(15_000);
    expect(result.providerAmount).toBe(135_000);
  });

  it("applies a flat 13% fee for short-term contracts", () => {
    const result = calculateFee({
      contractType: "SHORT_TERM",
      amount: 100_000,
    });
    expect(result.feeRate).toBe(0.13);
    expect(result.feeAmount).toBe(13_000);
    expect(result.providerAmount).toBe(87_000);
  });

  it("keeps the 13% rate for months 2 through 5", () => {
    for (const month of [2, 3, 4, 5]) {
      const result = calculateFee({
        contractType: "MONTHLY",
        amount: 100_000,
        monthNumber: month,
      });
      expect(result.feeRate).toBe(0.13);
    }
  });

  it("keeps the 10% rate for months beyond 6", () => {
    const result = calculateFee({
      contractType: "MONTHLY",
      amount: 200_000,
      monthNumber: 12,
    });
    expect(result.feeRate).toBe(0.1);
    expect(result.feeAmount).toBe(20_000);
    expect(result.providerAmount).toBe(180_000);
  });

  it("rounds fee amounts to the nearest whole XAF", () => {
    const result = calculateFee({
      contractType: "SHORT_TERM",
      amount: 99_999,
    });
    // 99999 * 0.13 = 12999.87 -> rounds to 13000
    expect(result.feeAmount).toBe(13_000);
    expect(result.providerAmount).toBe(86_999);
  });

  it("defaults monthNumber to 1 when omitted for monthly contracts", () => {
    const result = calculateFee({ contractType: "MONTHLY", amount: 100_000 });
    expect(result.feeRate).toBe(0.13);
  });
});
