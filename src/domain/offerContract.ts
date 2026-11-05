/**
 * SRS §7.2 Offer and Contract state machine. Pure, framework-free: no I/O, no clock reads —
 * every transition is driven by an explicit event and context the caller supplies.
 */

export type OfferContractStatus =
  | "OFFER_SENT"
  | "COUNTERED"
  | "PENDING_SIGNATURES"
  | "SIGNED"
  | "ACTIVE"
  | "FUNDED"
  | "COMPLETED"
  | "SUSPENDED"
  | "ENDING"
  | "CANCELLED"
  | "TERMINATED"
  | "CLOSED";

export type ContractLength = "SHORT" | "LONG";

export type OfferContractEvent =
  | "COUNTER"
  | "ACCEPT"
  | "DECLINE"
  | "WITHDRAW"
  | "EXPIRE"
  | "SIGN"
  | "FUND"
  | "CONFIRM"
  | "OVERDUE_SUSPEND"
  | "GIVE_NOTICE"
  | "COMPLETE"
  | "CANCEL"
  | "TERMINATE";

export interface OfferContractContext {
  /** Required for the SIGN event: both parties must have signed to advance past Pending Signatures. */
  employerSigned?: boolean;
  providerSigned?: boolean;
  /** Required for the FUND event: a long contract goes to Active, a short job to Funded (§7.2). */
  contractLength?: ContractLength;
}

interface TransitionRule {
  from: OfferContractStatus[];
  event: OfferContractEvent;
  guard?: (context: OfferContractContext) => boolean;
  to: OfferContractStatus | ((context: OfferContractContext) => OfferContractStatus);
}

const RULES: TransitionRule[] = [
  { from: ["OFFER_SENT"], event: "COUNTER", to: "COUNTERED" },
  { from: ["OFFER_SENT", "COUNTERED"], event: "ACCEPT", to: "PENDING_SIGNATURES" },
  { from: ["OFFER_SENT", "COUNTERED"], event: "DECLINE", to: "CLOSED" },
  { from: ["OFFER_SENT", "COUNTERED"], event: "WITHDRAW", to: "CLOSED" },
  { from: ["OFFER_SENT", "COUNTERED"], event: "EXPIRE", to: "CLOSED" },
  {
    from: ["PENDING_SIGNATURES"],
    event: "SIGN",
    guard: (c) => Boolean(c.employerSigned && c.providerSigned),
    to: "SIGNED",
  },
  {
    from: ["SIGNED"],
    event: "FUND",
    to: (c) => (c.contractLength === "SHORT" ? "FUNDED" : "ACTIVE"),
  },
  { from: ["SUSPENDED"], event: "FUND", to: "ACTIVE" },
  { from: ["FUNDED"], event: "CONFIRM", to: "COMPLETED" },
  { from: ["ACTIVE"], event: "OVERDUE_SUSPEND", to: "SUSPENDED" },
  { from: ["ACTIVE"], event: "GIVE_NOTICE", to: "ENDING" },
  { from: ["ACTIVE", "ENDING"], event: "COMPLETE", to: "COMPLETED" },
  {
    from: ["OFFER_SENT", "COUNTERED", "PENDING_SIGNATURES", "SIGNED"],
    event: "CANCEL",
    to: "CANCELLED",
  },
  { from: ["ACTIVE", "ENDING"], event: "TERMINATE", to: "TERMINATED" },
];

function matchingRule(
  status: OfferContractStatus,
  event: OfferContractEvent,
  context: OfferContractContext
): TransitionRule | undefined {
  return RULES.find(
    (rule) =>
      rule.from.includes(status) &&
      rule.event === event &&
      (rule.guard === undefined || rule.guard(context))
  );
}

export function canTransition(
  status: OfferContractStatus,
  event: OfferContractEvent,
  context: OfferContractContext = {}
): boolean {
  return matchingRule(status, event, context) !== undefined;
}

export function nextStatus(
  status: OfferContractStatus,
  event: OfferContractEvent,
  context: OfferContractContext = {}
): OfferContractStatus {
  const rule = matchingRule(status, event, context);
  if (!rule) {
    throw new Error(`cannot apply event ${event} to offer/contract status ${status}`);
  }
  return typeof rule.to === "function" ? rule.to(context) : rule.to;
}

export const TERMINAL_OFFER_CONTRACT_STATUSES: readonly OfferContractStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "TERMINATED",
  "CLOSED",
];

export function isTerminalOfferContractStatus(status: OfferContractStatus): boolean {
  return TERMINAL_OFFER_CONTRACT_STATUSES.includes(status);
}
