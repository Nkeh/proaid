"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import type { CommissionStat, PlacementStat } from "@/lib/data/types";

/** Renders the stored "YYYY-MM" key as a short month label in the active locale, instead of the seed's baked-in English label. */
function localizedMonthLabel(month: string, locale: ReturnType<typeof useLocale>): string {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 1, 1);
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, { month: "short" }).format(date);
}

function PlacementsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: PlacementStat & { label: string } }[];
  label: (count: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{point.label}</p>
      <p className="text-muted-foreground">{label(point.placements)}</p>
    </div>
  );
}

export function PlacementsChart({ data }: { data: PlacementStat[] }) {
  const t = useT();
  const locale = useLocale();
  const localizedData = useMemo(
    () => data.map((d) => ({ ...d, label: localizedMonthLabel(d.month, locale) })),
    [data, locale]
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.admin.placementsChartTitle}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={localizedData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={36}
            />
            <Tooltip content={<PlacementsTooltip label={t.admin.placementsTooltipLabel} />} cursor={{ fill: "var(--secondary)" }} />
            <Bar dataKey="placements" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function formatCompactXaf(value: number, locale: ReturnType<typeof useLocale>): string {
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(intlLocale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function CommissionTooltip({
  active,
  payload,
  locale,
}: {
  active?: boolean;
  payload?: { payload: CommissionStat & { label: string } }[];
  locale: ReturnType<typeof useLocale>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{point.label}</p>
      <p className="text-muted-foreground">{formatMoney(point.commission, locale)}</p>
    </div>
  );
}

export function CommissionChart({ data }: { data: CommissionStat[] }) {
  const t = useT();
  const locale = useLocale();
  const localizedData = useMemo(
    () => data.map((d) => ({ ...d, label: localizedMonthLabel(d.month, locale) })),
    [data, locale]
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.admin.commissionChartTitle}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={localizedData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(value: number) => formatCompactXaf(value, locale)}
              width={44}
            />
            <Tooltip content={<CommissionTooltip locale={locale} />} cursor={{ fill: "var(--secondary)" }} />
            <Bar dataKey="commission" fill="var(--amber)" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
