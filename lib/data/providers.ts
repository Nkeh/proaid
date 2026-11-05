import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Provider } from "./types";

export interface ProviderFilters {
  category?: Provider["category"];
  city?: Provider["city"];
  neighbourhood?: Provider["neighbourhood"];
  workType?: Provider["workType"];
  language?: Provider["languages"][number];
  minRating?: number;
  minRate?: number;
  maxRate?: number;
  query?: string;
}

export function filterProviders(providers: Provider[], filters: ProviderFilters): Provider[] {
  return providers
    .filter((p) => p.status === "APPROVED")
    .filter((p) => p.availability !== "ENGAGED")
    .filter((p) => !filters.category || p.category === filters.category)
    .filter((p) => !filters.city || p.city === filters.city)
    .filter((p) => !filters.neighbourhood || p.neighbourhood === filters.neighbourhood)
    .filter((p) => !filters.workType || p.workType === filters.workType)
    .filter((p) => !filters.language || p.languages.includes(filters.language))
    .filter((p) => filters.minRating === undefined || p.rating >= filters.minRating)
    .filter((p) => filters.minRate === undefined || p.monthlyRate >= filters.minRate)
    .filter((p) => filters.maxRate === undefined || p.monthlyRate <= filters.maxRate)
    .filter((p) => {
      if (!filters.query) return true;
      const q = filters.query.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
}

/** Reactive hook: all providers regardless of status (used by admin). */
export function useAllProviders(): Provider[] {
  return useAppStore((s) => s.providers);
}

/** Reactive hook: approved providers matching filters (used by search). */
export function useProviders(filters: ProviderFilters = {}): Provider[] {
  const providers = useAppStore((s) => s.providers);
  return useMemo(() => filterProviders(providers, filters), [providers, filters]);
}

export function useProviderById(id: string | undefined): Provider | undefined {
  return useAppStore((s) => (id ? s.providers.find((p) => p.id === id) : undefined));
}

const PENDING_VETTING_STATUSES: Provider["status"][] = [
  "SUBMITTED",
  "INTERVIEW_SCHEDULED",
  "UNDER_REVIEW",
  "RENEWAL_REQUIRED",
];

export function usePendingProviders(): Provider[] {
  const providers = useAppStore((s) => s.providers);
  return useMemo(
    () => providers.filter((p) => PENDING_VETTING_STATUSES.includes(p.status)),
    [providers]
  );
}

export function useFeaturedProviders(limit = 3): Provider[] {
  const providers = useAppStore((s) => s.providers);
  return useMemo(
    () =>
      providers
        .filter((p) => p.status === "APPROVED" && p.availability !== "ENGAGED")
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit),
    [providers, limit]
  );
}

export function approveProvider(id: string): void {
  useAppStore.getState().approveProvider(id);
}

export function useShortlistedProviderIds(): string[] {
  return useAppStore((s) => s.employer.shortlistedProviderIds);
}

export function toggleShortlist(providerId: string): void {
  useAppStore.getState().toggleShortlist(providerId);
}

export function rejectProvider(id: string, reason: string): void {
  useAppStore.getState().rejectProvider(id, reason);
}
