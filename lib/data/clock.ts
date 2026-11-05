import { useAppStore } from "@/store/useAppStore";

export function useDemoDate(): string {
  return useAppStore((s) => s.demoDate);
}

export function advanceDemoClock(days: number): void {
  useAppStore.getState().advanceDemoClock(days);
}

export function setDemoDateTo(iso: string): void {
  useAppStore.getState().setDemoDateTo(iso);
}

export function setEmployerLoyaltyMonth(targetFundedMonths: number): void {
  useAppStore.getState().setEmployerLoyaltyMonth(targetFundedMonths);
}
