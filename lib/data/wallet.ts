import { useAppStore, type PaymentMethod } from "@/store/useAppStore";
import type { Wallet } from "./types";

export function useWallet(): Wallet {
  return useAppStore((s) => s.wallet);
}

export function topUpWallet(amount: number, method: PaymentMethod, phoneNumber: string): void {
  useAppStore.getState().topUpWallet(amount, method, phoneNumber);
}
