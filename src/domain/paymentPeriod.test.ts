import { describe, expect, it } from "vitest";
import {
  canTransition,
  isTerminalPaymentPeriodStatus,
  nextStatus,
  type PaymentPeriodStatus,
} from "./paymentPeriod";

describe("§7.3 Payment Period state machine", () => {
  it("walks the happy path: scheduled -> funded -> released", () => {
    let status: PaymentPeriodStatus = "SCHEDULED";
    status = nextStatus(status, "OPEN_FUNDING_WINDOW");
    expect(status).toBe("AWAITING_FUNDING");
    status = nextStatus(status, "FUND");
    expect(status).toBe("FUNDED");
    status = nextStatus(status, "REACH_PAYMENT_DATE");
    expect(status).toBe("RELEASING");
    status = nextStatus(status, "PAYOUT_CONFIRMED");
    expect(status).toBe("RELEASED");
    expect(isTerminalPaymentPeriodStatus(status)).toBe(true);
  });

  it("becomes Overdue when the funding window closes unpaid, and recovers on funding", () => {
    let status: PaymentPeriodStatus = "AWAITING_FUNDING";
    status = nextStatus(status, "OVERDUE");
    expect(status).toBe("OVERDUE");
    status = nextStatus(status, "FUND");
    expect(status).toBe("FUNDED");
  });

  it("holds release when a dispute is raised on a funded period", () => {
    const onHold = nextStatus("FUNDED", "RAISE_DISPUTE");
    expect(onHold).toBe("ON_HOLD");
  });

  it("resolves a dispute to Releasing on full release", () => {
    const resolved = nextStatus("ON_HOLD", "DECIDE_DISPUTE", { disputeOutcome: "FULL_RELEASE" });
    expect(resolved).toBe("RELEASING");
  });

  it("resolves a dispute to Partly Refunded on a partial decision", () => {
    const resolved = nextStatus("ON_HOLD", "DECIDE_DISPUTE", {
      disputeOutcome: "PARTIAL_RELEASE_WITH_REFUND",
    });
    expect(resolved).toBe("PARTLY_REFUNDED");
  });

  it("resolves a dispute to Refunded on a full-refund decision", () => {
    const resolved = nextStatus("ON_HOLD", "DECIDE_DISPUTE", { disputeOutcome: "FULL_REFUND" });
    expect(resolved).toBe("REFUNDED");
  });

  it("requires a disputeOutcome to decide a dispute", () => {
    expect(canTransition("ON_HOLD", "DECIDE_DISPUTE")).toBe(false);
  });

  it("routes a failed payout to the Finance queue", () => {
    const failed = nextStatus("RELEASING", "PAYOUT_FAILED");
    expect(failed).toBe("PAYOUT_FAILED");
    expect(isTerminalPaymentPeriodStatus(failed)).toBe(true);
  });

  it("cancels a scheduled or awaiting-funding period when the contract ends early", () => {
    expect(nextStatus("SCHEDULED", "CANCEL")).toBe("CANCELLED");
    expect(nextStatus("AWAITING_FUNDING", "CANCEL")).toBe("CANCELLED");
    expect(canTransition("FUNDED", "CANCEL")).toBe(false);
  });

  it("throws for an invalid transition", () => {
    expect(() => nextStatus("RELEASED", "FUND")).toThrow();
  });
});
