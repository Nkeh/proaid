import { useAppStore, getCurrentUserId, CURRENT_EMPLOYER_ID, CURRENT_PROVIDER_ID } from "@/store/useAppStore";
import type { Employer, Role } from "./types";

export { CURRENT_EMPLOYER_ID, CURRENT_PROVIDER_ID };

export const ROLE_HOME: Record<Role, string> = {
  EMPLOYER: "/employer",
  PROVIDER: "/provider-dashboard",
  ADMIN: "/admin",
};

export function useRole(): Role | null {
  return useAppStore((s) => s.role);
}

export function setRole(role: Role | null): void {
  useAppStore.getState().setRole(role);
}

export function useCurrentUserId(): string | null {
  const role = useAppStore((s) => s.role);
  return getCurrentUserId(role);
}

export function useEmployer(): Employer {
  return useAppStore((s) => s.employer);
}

export function useHasHydrated(): boolean {
  return useAppStore((s) => s.hasHydrated);
}
