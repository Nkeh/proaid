import type { ContractType } from "./fees";

export type BookingStatus =
  | "REQUESTED"
  | "DECLINED"
  | "ACCEPTED"
  | "CONTRACT_SIGNED"
  | "FUNDED"
  | "SERVICE_CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type BookingAction =
  | "ACCEPT"
  | "DECLINE"
  | "SIGN"
  | "FUND"
  | "CONFIRM_SERVICE"
  | "CANCEL";

export interface BookingLike {
  status: BookingStatus;
  contractType: ContractType;
  durationMonths: number;
  currentMonth: number;
  employerSigned: boolean;
  providerSigned: boolean;
}

/** Ordered lifecycle used to render progress trackers. Branch states (DECLINED/CANCELLED) are handled separately. */
export const BOOKING_LIFECYCLE_ORDER: BookingStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "CONTRACT_SIGNED",
  "FUNDED",
  "SERVICE_CONFIRMED",
  "COMPLETED",
];

/**
 * Returns true if `action` is a legal transition from the booking's current state.
 * This is the single source of truth the UI consults before showing/enabling any action.
 */
export function canTransition(booking: BookingLike, action: BookingAction): boolean {
  const { status } = booking;

  switch (action) {
    case "ACCEPT":
      return status === "REQUESTED";
    case "DECLINE":
      return status === "REQUESTED";
    case "SIGN":
      return (
        (status === "ACCEPTED" || status === "CONTRACT_SIGNED") &&
        !(booking.employerSigned && booking.providerSigned)
      );
    case "FUND":
      return status === "CONTRACT_SIGNED";
    case "CONFIRM_SERVICE":
      return status === "FUNDED";
    case "CANCEL":
      return status === "REQUESTED" || status === "ACCEPTED" || status === "CONTRACT_SIGNED";
    default:
      return false;
  }
}

/**
 * Computes the next status for a booking after `action`. Signatures are passed in explicitly
 * because the caller updates them first. Throws on an invalid transition - the UI must guard
 * with canTransition so this should never be reached from a disabled control.
 */
export function nextStatus(
  booking: BookingLike,
  action: BookingAction,
  opts?: { employerSigned?: boolean; providerSigned?: boolean }
): BookingStatus {
  if (!canTransition(booking, action)) {
    throw new Error(`Invalid transition: cannot ${action} from ${booking.status}`);
  }

  switch (action) {
    case "ACCEPT":
      return "ACCEPTED";
    case "DECLINE":
      return "DECLINED";
    case "CANCEL":
      return "CANCELLED";
    case "SIGN": {
      const employerSigned = opts?.employerSigned ?? booking.employerSigned;
      const providerSigned = opts?.providerSigned ?? booking.providerSigned;
      return employerSigned && providerSigned ? "CONTRACT_SIGNED" : booking.status;
    }
    case "FUND":
      return "FUNDED";
    case "CONFIRM_SERVICE":
      return "SERVICE_CONFIRMED";
  }
}

/**
 * Called immediately after a booking enters SERVICE_CONFIRMED to resolve where it lands next:
 * short-term contracts complete outright; monthly contracts either roll into the next month
 * (back to CONTRACT_SIGNED, awaiting funding) or complete if that was the final month.
 */
export function resolveAfterConfirmation(booking: BookingLike): {
  status: BookingStatus;
  currentMonth: number;
} {
  if (booking.contractType === "SHORT_TERM") {
    return { status: "COMPLETED", currentMonth: booking.currentMonth };
  }
  const isLastMonth = booking.currentMonth >= booking.durationMonths;
  if (isLastMonth) {
    return { status: "COMPLETED", currentMonth: booking.currentMonth };
  }
  return { status: "CONTRACT_SIGNED", currentMonth: booking.currentMonth + 1 };
}

/** Adapts a full domain Booking (with nested signature records) to the flat shape the state machine expects. */
export function toBookingLike(booking: {
  status: BookingStatus;
  contractType: ContractType;
  durationMonths: number;
  currentMonth: number;
  employerSignature: { signed: boolean };
  providerSignature: { signed: boolean };
}): BookingLike {
  return {
    status: booking.status,
    contractType: booking.contractType,
    durationMonths: booking.durationMonths,
    currentMonth: booking.currentMonth,
    employerSigned: booking.employerSignature.signed,
    providerSigned: booking.providerSignature.signed,
  };
}

export function isTerminal(status: BookingStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED" || status === "DECLINED";
}
