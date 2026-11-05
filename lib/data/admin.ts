import { useMemo } from "react";
import { useAppStore, buildAdminStats } from "@/store/useAppStore";
import type { AdminStats } from "./types";

export function useAdminStats(): AdminStats {
  const providers = useAppStore((s) => s.providers);
  const bookings = useAppStore((s) => s.bookings);
  const disputes = useAppStore((s) => s.disputes);
  return useMemo(() => {
    const overduePeriods = bookings.reduce(
      (sum, b) => sum + b.periods.filter((p) => p.status === "OVERDUE").length,
      0
    );
    const openDisputes = disputes.filter((d) => d.status === "OPEN").length;
    return buildAdminStats(providers, overduePeriods, openDisputes);
  }, [providers, bookings, disputes]);
}

export function useDisputes() {
  return useAppStore((s) => s.disputes);
}

export function resolveDispute(
  disputeId: string,
  decision: "FULL_RELEASE" | "PARTIAL_RELEASE_WITH_REFUND" | "FULL_REFUND",
  refundAmount?: number
): void {
  useAppStore.getState().resolveDispute(disputeId, decision, refundAmount);
}
