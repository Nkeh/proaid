"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProviderCard } from "@/components/providers/provider-card";
import { FiltersSidebar } from "@/components/providers/filters-sidebar";
import { useT } from "@/lib/i18n";
import { useProviders, type ProviderFilters } from "@/lib/data/providers";
import type { Category } from "@/lib/data/types";

function SearchPageInner() {
  const t = useT();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ProviderFilters>(() => {
    const category = searchParams.get("category") as Category | null;
    const q = searchParams.get("q");
    return {
      category: category ?? undefined,
      query: q ?? undefined,
    };
  });

  const providers = useProviders(filters);
  const emptyFilters = useMemo<ProviderFilters>(() => ({}), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.search.title}</h1>
          <p className="text-sm text-muted-foreground">
            {providers.length} {t.search.resultsCount}
          </p>
        </div>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="h-11 gap-2 lg:hidden" />}>
            <SlidersHorizontal className="h-4 w-4" />
            {t.search.openFilters}
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t.search.filtersTitle}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <FiltersSidebar filters={filters} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-border p-5">
            <FiltersSidebar filters={filters} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />
          </div>
        </aside>

        <div>
          {providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground">{t.search.noProviders}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
