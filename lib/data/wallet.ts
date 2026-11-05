import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { StoredPaymentPeriod, Transaction } from "./types";

export interface WalletSummary {
  transactions: Transaction[];
  totalFunded: number;
  heldInEscrow: number;
  totalReleased: number;
  totalRefunded: number;
  /** Periods still awaiting funding or overdue, soonest first — "what's coming up". */
  upcomingPeriods: StoredPaymentPeriod[];
}

const ESCROW_HELD_STATUSES = new Set(["FUNDED", "ON_HOLD"]);

/**
 * BR-PAY-8: ProAid never holds customer funds — there is no wallet balance. This is a derived
 * view over the transaction ledger and every booking's payment periods, not stored state.
 */
export function useWalletSummary(employerId: string): WalletSummary {
  const transactions = useAppStore((s) => s.transactions);
  const bookings = useAppStore((s) => s.bookings);

  return useMemo(() => {
    const employerBookings = bookings.filter((b) => b.employerId === employerId);
    const employerBookingIds = new Set(employerBookings.map((b) => b.id));
    const employerTransactions = transactions
      .filter((t) => t.bookingId === null || employerBookingIds.has(t.bookingId))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const totalFunded = employerTransactions
      .filter((t) => t.type === "FUNDING")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalReleased = employerTransactions
      .filter((t) => t.type === "PAYOUT")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalRefunded = employerTransactions
      .filter((t) => t.type === "REFUND")
      .reduce((sum, t) => sum + t.amount, 0);

    const heldInEscrow = employerBookings.reduce(
      (sum, b) => sum + b.periods.filter((p) => ESCROW_HELD_STATUSES.has(p.status)).reduce((s, p) => s + p.wageTotal, 0),
      0
    );

    const upcomingPeriods = employerBookings
      .flatMap((b) => b.periods.filter((p) => p.status === "AWAITING_FUNDING" || p.status === "OVERDUE"))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    return { transactions: employerTransactions, totalFunded, heldInEscrow, totalReleased, totalRefunded, upcomingPeriods };
  }, [transactions, bookings, employerId]);
}
