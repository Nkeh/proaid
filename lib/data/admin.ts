import { useMemo } from "react";
import { useAppStore, buildAdminStats } from "@/store/useAppStore";
import type { AdminStats } from "./types";

export function useAdminStats(): AdminStats {
  const providers = useAppStore((s) => s.providers);
  return useMemo(() => buildAdminStats(providers), [providers]);
}
