"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import {
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  NEIGHBOURHOODS_BY_CITY,
  NEIGHBOURHOOD_OPTIONS,
  WORK_TYPE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/data/options";
import type { ProviderFilters } from "@/lib/data/providers";

const ANY = "ANY";
const MAX_RATE = 200_000;
const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5];

export interface FiltersSidebarProps {
  filters: ProviderFilters;
  onChange: (filters: ProviderFilters) => void;
  onClear: () => void;
}

export function FiltersSidebar({ filters, onChange, onClear }: FiltersSidebarProps) {
  const t = useT();
  const locale = useLocale();

  const rateRange: [number, number] = [filters.minRate ?? 0, filters.maxRate ?? MAX_RATE];
  const neighbourhoodOptions = filters.city ? NEIGHBOURHOODS_BY_CITY[filters.city] : NEIGHBOURHOOD_OPTIONS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t.search.filtersTitle}</h2>
        <button className="text-sm font-medium text-primary hover:underline" onClick={onClear}>
          {t.common.clearFilters}
        </button>
      </div>

      <div className="space-y-2">
        <Label>{t.search.category}</Label>
        <Select
          value={filters.category ?? ANY}
          onValueChange={(v) => onChange({ ...filters, category: v === ANY ? undefined : (v as ProviderFilters["category"]) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{filters.category ? t.categories[filters.category] : t.search.anyCategory}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t.search.anyCategory}</SelectItem>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {t.categories[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.search.city}</Label>
        <Select
          value={filters.city ?? ANY}
          onValueChange={(v) =>
            onChange({
              ...filters,
              city: v === ANY ? undefined : (v as ProviderFilters["city"]),
              neighbourhood: undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>{filters.city ? t.cities[filters.city] : t.search.anyCity}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t.search.anyCity}</SelectItem>
            {CITY_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {t.cities[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.search.neighbourhood}</Label>
        <Select
          value={filters.neighbourhood ?? ANY}
          onValueChange={(v) =>
            onChange({ ...filters, neighbourhood: v === ANY ? undefined : (v as ProviderFilters["neighbourhood"]) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {filters.neighbourhood ? t.neighbourhoods[filters.neighbourhood] : t.search.anyNeighbourhood}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t.search.anyNeighbourhood}</SelectItem>
            {neighbourhoodOptions.map((n) => (
              <SelectItem key={n} value={n}>
                {t.neighbourhoods[n]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.search.workType}</Label>
        <Select
          value={filters.workType ?? ANY}
          onValueChange={(v) => onChange({ ...filters, workType: v === ANY ? undefined : (v as ProviderFilters["workType"]) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{filters.workType ? t.workType[filters.workType] : t.search.anyWorkType}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t.search.anyWorkType}</SelectItem>
            {WORK_TYPE_OPTIONS.map((w) => (
              <SelectItem key={w} value={w}>
                {t.workType[w]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.search.language}</Label>
        <Select
          value={filters.language ?? ANY}
          onValueChange={(v) => onChange({ ...filters, language: v === ANY ? undefined : (v as ProviderFilters["language"]) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{filters.language ? t.spokenLanguage[filters.language] : t.search.anyLanguage}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t.search.anyLanguage}</SelectItem>
            {LANGUAGE_OPTIONS.map((l) => (
              <SelectItem key={l} value={l}>
                {t.spokenLanguage[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.search.minRating}</Label>
        <Select
          value={String(filters.minRating ?? 0)}
          onValueChange={(v) => onChange({ ...filters, minRating: Number(v) || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {filters.minRating ? `${filters.minRating}+` : t.search.anyRating}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r === 0 ? t.search.anyRating : `${r}+`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>{t.search.rateRange}</Label>
        <Slider
          min={0}
          max={MAX_RATE}
          step={5000}
          value={rateRange}
          onValueChange={(v) => {
            const [minRate, maxRate] = v as number[];
            onChange({ ...filters, minRate, maxRate });
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatMoney(rateRange[0], locale)}</span>
          <span>{formatMoney(rateRange[1], locale)}</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onClear}>
        {t.common.clearFilters}
      </Button>
    </div>
  );
}
