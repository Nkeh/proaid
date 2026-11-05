import { describe, expect, it } from "vitest";
import {
  applyRateRoundHalfUp,
  divideRoundHalfUp,
  formatXaf,
  subtractClampedAtZero,
} from "./money";

describe("divideRoundHalfUp", () => {
  it("rounds an exact half up", () => {
    expect(divideRoundHalfUp(5, 2)).toBe(3);
  });

  it("rounds down when below the half mark", () => {
    expect(divideRoundHalfUp(4, 3)).toBe(1);
  });

  it("rejects negative or non-integer inputs", () => {
    expect(() => divideRoundHalfUp(-1, 2)).toThrow();
    expect(() => divideRoundHalfUp(1, 0)).toThrow();
    expect(() => divideRoundHalfUp(1.5, 2)).toThrow();
  });
});

describe("applyRateRoundHalfUp", () => {
  it("Appendix B rounding check: 83,333 XAF at 12% rounds to 10,000", () => {
    expect(applyRateRoundHalfUp(83_333, 1200)).toBe(10_000);
  });

  it("rounds 99,999 XAF at 13% (12,999.87) up to 13,000", () => {
    expect(applyRateRoundHalfUp(99_999, 1300)).toBe(13_000);
  });

  it("computes 80,000 XAF at 12% exactly as 9,600", () => {
    expect(applyRateRoundHalfUp(80_000, 1200)).toBe(9_600);
  });

  it("computes 80,000 XAF at 6% exactly as 4,800", () => {
    expect(applyRateRoundHalfUp(80_000, 600)).toBe(4_800);
  });

  it("computes 80,000 XAF at 4% exactly as 3,200", () => {
    expect(applyRateRoundHalfUp(80_000, 400)).toBe(3_200);
  });

  it("computes 30,000 XAF at 14% exactly as 4,200", () => {
    expect(applyRateRoundHalfUp(30_000, 1400)).toBe(4_200);
  });

  it("returns zero for a zero rate", () => {
    expect(applyRateRoundHalfUp(100_000, 0)).toBe(0);
  });

  it("rejects negative or non-integer inputs", () => {
    expect(() => applyRateRoundHalfUp(-1, 1200)).toThrow();
    expect(() => applyRateRoundHalfUp(100_000, -1)).toThrow();
    expect(() => applyRateRoundHalfUp(1.5, 1200)).toThrow();
    expect(() => applyRateRoundHalfUp(100_000, 1.5)).toThrow();
  });
});

describe("subtractClampedAtZero", () => {
  it("subtracts normally when the result stays non-negative", () => {
    expect(subtractClampedAtZero(10_000, 3_000)).toBe(7_000);
  });

  it("clamps at zero instead of going negative (BR-FEE-5)", () => {
    expect(subtractClampedAtZero(1_000, 5_000)).toBe(0);
  });
});

describe("formatXaf", () => {
  it("formats with commas in English", () => {
    expect(formatXaf(150_000, "en")).toBe("150,000 XAF");
  });

  it("formats with spaces in French", () => {
    expect(formatXaf(150_000, "fr")).toBe("150 000 XAF");
  });
});
