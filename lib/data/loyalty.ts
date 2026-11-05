import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SRS_V2_FEE_CONFIG } from "@/src/domain/fees";
import { summarizeLoyalty, type LoyaltySummary } from "@/src/domain/loyalty";

export function useLoyaltySummary(employerId: string): LoyaltySummary {
  const loyaltyHistory = useAppStore((s) => s.loyaltyHistory);
  return useMemo(
    () => summarizeLoyalty(loyaltyHistory, employerId, SRS_V2_FEE_CONFIG),
    [loyaltyHistory, employerId]
  );
}
