/**
 * Thin demo-integration adapter over the real SRS §7.2 Offer/Contract state machine in
 * `src/domain/offerContract.ts`. This file does not implement any business rule itself — it only
 * translates between the pure domain shape and the shapes the demo store and UI consume.
 */
import {
  canTransition as domainCanTransition,
  isTerminalOfferContractStatus,
  nextStatus as domainNextStatus,
  type OfferContractStatus,
} from "@/src/domain/offerContract";

export type {
  ContractLength,
  OfferContractContext,
  OfferContractEvent,
  OfferContractStatus,
} from "@/src/domain/offerContract";

/** Ordered happy-path lifecycle for a long contract, used to render progress trackers. */
export const LONG_CONTRACT_LIFECYCLE_ORDER: OfferContractStatus[] = [
  "OFFER_SENT",
  "PENDING_SIGNATURES",
  "SIGNED",
  "ACTIVE",
  "ENDING",
  "COMPLETED",
];

/** Ordered happy-path lifecycle for a short job. */
export const SHORT_JOB_LIFECYCLE_ORDER: OfferContractStatus[] = [
  "OFFER_SENT",
  "PENDING_SIGNATURES",
  "SIGNED",
  "FUNDED",
  "COMPLETED",
];

export const canTransition = domainCanTransition;
export const nextStatus = domainNextStatus;
export const isTerminal = isTerminalOfferContractStatus;

export interface BookingLike {
  status: OfferContractStatus;
  employerSigned: boolean;
  providerSigned: boolean;
}

/** Adapts a full domain Booking (with nested signature records) to the flat shape the state machine expects. */
export function toBookingLike(booking: {
  status: OfferContractStatus;
  employerSignature: { signed: boolean };
  providerSignature: { signed: boolean };
}): BookingLike {
  return {
    status: booking.status,
    employerSigned: booking.employerSignature.signed,
    providerSigned: booking.providerSignature.signed,
  };
}
