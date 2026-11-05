import { describe, expect, it } from "vitest";
import {
  canTransition,
  isTerminalOfferContractStatus,
  nextStatus,
  type OfferContractStatus,
} from "./offerContract";

describe("§7.2 Offer and Contract state machine", () => {
  it("walks the happy path for a long contract", () => {
    let status: OfferContractStatus = "OFFER_SENT";
    status = nextStatus(status, "ACCEPT");
    expect(status).toBe("PENDING_SIGNATURES");
    status = nextStatus(status, "SIGN", { employerSigned: true, providerSigned: true });
    expect(status).toBe("SIGNED");
    status = nextStatus(status, "FUND", { contractLength: "LONG" });
    expect(status).toBe("ACTIVE");
    status = nextStatus(status, "GIVE_NOTICE");
    expect(status).toBe("ENDING");
    status = nextStatus(status, "COMPLETE");
    expect(status).toBe("COMPLETED");
    expect(isTerminalOfferContractStatus(status)).toBe(true);
  });

  it("walks the happy path for a short job", () => {
    let status: OfferContractStatus = "OFFER_SENT";
    status = nextStatus(status, "ACCEPT");
    status = nextStatus(status, "SIGN", { employerSigned: true, providerSigned: true });
    status = nextStatus(status, "FUND", { contractLength: "SHORT" });
    expect(status).toBe("FUNDED");
    status = nextStatus(status, "CONFIRM");
    expect(status).toBe("COMPLETED");
  });

  it("allows a provider counter-offer before acceptance", () => {
    expect(canTransition("OFFER_SENT", "COUNTER")).toBe(true);
    const countered = nextStatus("OFFER_SENT", "COUNTER");
    expect(countered).toBe("COUNTERED");
    expect(nextStatus(countered, "ACCEPT")).toBe("PENDING_SIGNATURES");
  });

  it("refuses to sign without both parties' signatures", () => {
    expect(canTransition("PENDING_SIGNATURES", "SIGN", { employerSigned: true })).toBe(false);
    expect(
      canTransition("PENDING_SIGNATURES", "SIGN", { employerSigned: true, providerSigned: true })
    ).toBe(true);
  });

  it("suspends an active long contract on an overdue period and resumes on funding", () => {
    let status: OfferContractStatus = "ACTIVE";
    status = nextStatus(status, "OVERDUE_SUSPEND");
    expect(status).toBe("SUSPENDED");
    status = nextStatus(status, "FUND");
    expect(status).toBe("ACTIVE");
  });

  it("allows cancellation from every pre-Active status but not from Active itself", () => {
    for (const status of ["OFFER_SENT", "COUNTERED", "PENDING_SIGNATURES", "SIGNED"] as const) {
      expect(canTransition(status, "CANCEL")).toBe(true);
    }
    expect(canTransition("ACTIVE", "CANCEL")).toBe(false);
    expect(canTransition("FUNDED", "CANCEL")).toBe(false);
  });

  it("allows termination from Active or Ending only", () => {
    expect(canTransition("ACTIVE", "TERMINATE")).toBe(true);
    expect(canTransition("ENDING", "TERMINATE")).toBe(true);
    expect(canTransition("SIGNED", "TERMINATE")).toBe(false);
  });

  it("closes an offer on decline, withdrawal, or expiry", () => {
    for (const event of ["DECLINE", "WITHDRAW", "EXPIRE"] as const) {
      expect(nextStatus("OFFER_SENT", event)).toBe("CLOSED");
      expect(nextStatus("COUNTERED", event)).toBe("CLOSED");
    }
  });

  it("throws for an invalid transition", () => {
    expect(() => nextStatus("COMPLETED", "ACCEPT")).toThrow();
  });

  it("reports terminal statuses correctly", () => {
    expect(isTerminalOfferContractStatus("COMPLETED")).toBe(true);
    expect(isTerminalOfferContractStatus("CANCELLED")).toBe(true);
    expect(isTerminalOfferContractStatus("TERMINATED")).toBe(true);
    expect(isTerminalOfferContractStatus("CLOSED")).toBe(true);
    expect(isTerminalOfferContractStatus("ACTIVE")).toBe(false);
  });
});
