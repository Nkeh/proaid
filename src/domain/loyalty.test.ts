import { describe, expect, it } from "vitest";
import { SRS_V2_FEE_CONFIG } from "./fees";
import {
  assignLoyaltyMonths,
  countedLoyaltyMonths,
  markLoyaltyMonthFunded,
  markLoyaltyMonthRemoved,
  nextLoyaltyMonthNumber,
  removeUnfundedMonthsForContract,
  reservedLoyaltyMonths,
  summarizeLoyalty,
  type LoyaltyMonthRecord,
} from "./loyalty";

const EMPLOYER = "employer-1";

function monthDates(n: number, startYear = 2026, startMonth = 1): string[] {
  return Array.from({ length: n }, (_, i) => {
    const m = startMonth + i;
    return `${startYear}-${String(m).padStart(2, "0")}-01`;
  });
}

describe("assignLoyaltyMonths / nextLoyaltyMonthNumber (BR-FEE-4: frozen at signing)", () => {
  it("starts a fresh employer's first contract at loyalty month 1", () => {
    const history: LoyaltyMonthRecord[] = [];
    expect(nextLoyaltyMonthNumber(history, EMPLOYER)).toBe(1);
    const assigned = assignLoyaltyMonths(history, EMPLOYER, "c1", monthDates(3));
    expect(assigned.map((r) => r.loyaltyMonthNumber)).toEqual([1, 2, 3]);
    expect(assigned.every((r) => r.state === "PENDING")).toBe(true);
  });

  it("OD-01: two concurrent long contracts each add their own months, never deduplicated", () => {
    let history: LoyaltyMonthRecord[] = [];
    const contractA = assignLoyaltyMonths(history, EMPLOYER, "contract-A", monthDates(2));
    history = [...history, ...contractA];
    // Contract B is signed while contract A is still active (same calendar months) — OD-01.
    const contractB = assignLoyaltyMonths(history, EMPLOYER, "contract-B", monthDates(2));
    history = [...history, ...contractB];

    expect(contractA.map((r) => r.loyaltyMonthNumber)).toEqual([1, 2]);
    expect(contractB.map((r) => r.loyaltyMonthNumber)).toEqual([3, 4]);
    expect(reservedLoyaltyMonths(history, EMPLOYER)).toBe(4);
  });
});

describe("markLoyaltyMonthFunded / countedLoyaltyMonths (BR-LOY-2, corrected)", () => {
  it("only counts months that have actually funded, not merely assigned", () => {
    let history: LoyaltyMonthRecord[] = assignLoyaltyMonths(
      [],
      EMPLOYER,
      "c1",
      monthDates(3)
    );
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(0);

    history = markLoyaltyMonthFunded(history, EMPLOYER, "c1", 1);
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(1);

    history = markLoyaltyMonthFunded(history, EMPLOYER, "c1", 2);
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(2);
  });

  it("throws if the targeted record isn't PENDING", () => {
    const history = assignLoyaltyMonths([], EMPLOYER, "c1", monthDates(1));
    const funded = markLoyaltyMonthFunded(history, EMPLOYER, "c1", 1);
    expect(() => markLoyaltyMonthFunded(funded, EMPLOYER, "c1", 1)).toThrow();
  });
});

describe("owner-specified scenario: terminated contract releases its unfunded months", () => {
  it("a 6-month contract terminated after 2 fundings frees its 4 remaining reservations", () => {
    let history: LoyaltyMonthRecord[] = [];

    // Contract 1: signed for 6 months, reserving loyalty months 1-6 up front (BR-FEE-4).
    const contract1 = assignLoyaltyMonths(history, EMPLOYER, "contract-1", monthDates(6));
    history = [...history, ...contract1];
    expect(reservedLoyaltyMonths(history, EMPLOYER)).toBe(6);

    // Only the first 2 periods actually fund before the contract is terminated.
    history = markLoyaltyMonthFunded(history, EMPLOYER, "contract-1", 1);
    history = markLoyaltyMonthFunded(history, EMPLOYER, "contract-1", 2);
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(2);
    expect(reservedLoyaltyMonths(history, EMPLOYER)).toBe(6);

    // Termination: the remaining 4 PENDING months (3-6) will never fund — release them.
    history = removeUnfundedMonthsForContract(history, EMPLOYER, "contract-1");
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(2);
    expect(reservedLoyaltyMonths(history, EMPLOYER)).toBe(2);

    // A subsequently-signed contract continues from what actually funded (3), not from the
    // stale 6-month reservation (which would have produced 7).
    expect(nextLoyaltyMonthNumber(history, EMPLOYER)).toBe(3);
    const contract2 = assignLoyaltyMonths(history, EMPLOYER, "contract-2", monthDates(2));
    expect(contract2.map((r) => r.loyaltyMonthNumber)).toEqual([3, 4]);
  });

  it("removeUnfundedMonthsForContract leaves FUNDED months of that contract untouched", () => {
    let history = assignLoyaltyMonths([], EMPLOYER, "c1", monthDates(3));
    history = markLoyaltyMonthFunded(history, EMPLOYER, "c1", 1);
    history = removeUnfundedMonthsForContract(history, EMPLOYER, "c1");
    const month1 = history.find((r) => r.contractId === "c1" && r.contractMonthNumber === 1);
    expect(month1?.state).toBe("FUNDED");
    const month2 = history.find((r) => r.contractId === "c1" && r.contractMonthNumber === 2);
    expect(month2?.state).toBe("REMOVED");
  });
});

describe("markLoyaltyMonthRemoved (BR-LOY-6: full refund removes a funded month)", () => {
  it("removes a FUNDED month from the counted total after a full-refund dispute decision", () => {
    let history = assignLoyaltyMonths([], EMPLOYER, "c1", monthDates(2));
    history = markLoyaltyMonthFunded(history, EMPLOYER, "c1", 1);
    history = markLoyaltyMonthFunded(history, EMPLOYER, "c1", 2);
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(2);

    history = markLoyaltyMonthRemoved(history, EMPLOYER, "c1", 2);
    expect(countedLoyaltyMonths(history, EMPLOYER)).toBe(1);
    expect(reservedLoyaltyMonths(history, EMPLOYER)).toBe(1);
  });
});

describe("summarizeLoyalty", () => {
  it("reflects counted months for the current level and reserved+1 for new-contract pricing", () => {
    let history = assignLoyaltyMonths([], EMPLOYER, "c1", monthDates(13));
    for (let m = 1; m <= 11; m++) {
      history = markLoyaltyMonthFunded(history, EMPLOYER, "c1", m);
    }
    const summary = summarizeLoyalty(history, EMPLOYER, SRS_V2_FEE_CONFIG);
    expect(summary.countedMonths).toBe(11);
    expect(summary.reservedMonths).toBe(13);
    expect(summary.currentLevel).toBe(1);
    // reservedMonths (13) drives new-contract pricing, not countedMonths (11): the next
    // assignment would be loyalty month 14, already Level 2.
    expect(summary.nextAssignmentLevel).toBe(2);
  });
});
