/**
 * SRS §7.3 Payment Period state machine. Pure, framework-free. This module only emits the
 * state transition — the orchestrating store code (not this module, and not `loyalty.ts`
 * directly) is responsible for calling `loyalty.markLoyaltyMonthRemoved` when a FULL_REFUND
 * decision is recorded (BR-LOY-6), keeping each module single-purpose.
 */

export type PaymentPeriodStatus =
  | "SCHEDULED"
  | "AWAITING_FUNDING"
  | "FUNDED"
  | "OVERDUE"
  | "ON_HOLD"
  | "RELEASING"
  | "RELEASED"
  | "PAYOUT_FAILED"
  | "PARTLY_REFUNDED"
  | "REFUNDED"
  | "CANCELLED";

export type DisputeOutcome = "FULL_RELEASE" | "PARTIAL_RELEASE_WITH_REFUND" | "FULL_REFUND";

export type PaymentPeriodEvent =
  | "OPEN_FUNDING_WINDOW"
  | "FUND"
  | "OVERDUE"
  | "RAISE_DISPUTE"
  | "DECIDE_DISPUTE"
  | "REACH_PAYMENT_DATE"
  | "PAYOUT_CONFIRMED"
  | "PAYOUT_FAILED"
  | "CANCEL";

export interface PaymentPeriodContext {
  /** Required for the DECIDE_DISPUTE event. */
  disputeOutcome?: DisputeOutcome;
}

const DISPUTE_OUTCOME_TO_STATUS: Record<DisputeOutcome, PaymentPeriodStatus> = {
  FULL_RELEASE: "RELEASING",
  PARTIAL_RELEASE_WITH_REFUND: "PARTLY_REFUNDED",
  FULL_REFUND: "REFUNDED",
};

interface TransitionRule {
  from: PaymentPeriodStatus[];
  event: PaymentPeriodEvent;
  guard?: (context: PaymentPeriodContext) => boolean;
  to: PaymentPeriodStatus | ((context: PaymentPeriodContext) => PaymentPeriodStatus);
}

const RULES: TransitionRule[] = [
  { from: ["SCHEDULED"], event: "OPEN_FUNDING_WINDOW", to: "AWAITING_FUNDING" },
  { from: ["AWAITING_FUNDING"], event: "FUND", to: "FUNDED" },
  { from: ["AWAITING_FUNDING"], event: "OVERDUE", to: "OVERDUE" },
  { from: ["OVERDUE"], event: "FUND", to: "FUNDED" },
  { from: ["FUNDED"], event: "RAISE_DISPUTE", to: "ON_HOLD" },
  {
    from: ["ON_HOLD"],
    event: "DECIDE_DISPUTE",
    guard: (c) => c.disputeOutcome !== undefined,
    to: (c) => DISPUTE_OUTCOME_TO_STATUS[c.disputeOutcome as DisputeOutcome],
  },
  { from: ["FUNDED"], event: "REACH_PAYMENT_DATE", to: "RELEASING" },
  { from: ["RELEASING"], event: "PAYOUT_CONFIRMED", to: "RELEASED" },
  { from: ["RELEASING"], event: "PAYOUT_FAILED", to: "PAYOUT_FAILED" },
  { from: ["SCHEDULED", "AWAITING_FUNDING"], event: "CANCEL", to: "CANCELLED" },
];

function matchingRule(
  status: PaymentPeriodStatus,
  event: PaymentPeriodEvent,
  context: PaymentPeriodContext
): TransitionRule | undefined {
  return RULES.find(
    (rule) =>
      rule.from.includes(status) &&
      rule.event === event &&
      (rule.guard === undefined || rule.guard(context))
  );
}

export function canTransition(
  status: PaymentPeriodStatus,
  event: PaymentPeriodEvent,
  context: PaymentPeriodContext = {}
): boolean {
  return matchingRule(status, event, context) !== undefined;
}

export function nextStatus(
  status: PaymentPeriodStatus,
  event: PaymentPeriodEvent,
  context: PaymentPeriodContext = {}
): PaymentPeriodStatus {
  const rule = matchingRule(status, event, context);
  if (!rule) {
    throw new Error(`cannot apply event ${event} to payment period status ${status}`);
  }
  return typeof rule.to === "function" ? rule.to(context) : rule.to;
}

export const TERMINAL_PAYMENT_PERIOD_STATUSES: readonly PaymentPeriodStatus[] = [
  "RELEASED",
  "PAYOUT_FAILED",
  "PARTLY_REFUNDED",
  "REFUNDED",
  "CANCELLED",
];

export function isTerminalPaymentPeriodStatus(status: PaymentPeriodStatus): boolean {
  return TERMINAL_PAYMENT_PERIOD_STATUSES.includes(status);
}
