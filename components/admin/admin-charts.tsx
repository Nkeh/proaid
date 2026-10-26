"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import type { FeeStat, PlacementStat } from "@/lib/data/types";

function PlacementsTooltip({ active, payload }: { active?: boolean; payload?: { payload: PlacementStat }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{point.label}</p>
      <p className="text-muted-foreground">{point.placements} placements</p>
    </div>
  );
}

export function PlacementsChart({ data }: { data: PlacementStat[] }) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.admin.placementsChartTitle}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            <Tooltip content={<PlacementsTooltip />} cursor={{ fill: "var(--secondary)" }} />
            <Bar dataKey="placements" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function formatCompactXaf(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function FeesTooltip({
  active,
  payload,
  locale,
}: {
  active?: boolean;
  payload?: { payload: FeeStat }[];
  locale: ReturnType<typeof useLocale>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{point.label}</p>
      <p className="text-muted-foreground">{formatMoney(point.fees, locale)}</p>
    </div>
  );
}

export function FeesChart({ data }: { data: FeeStat[] }) {
  const t = useT();
  const locale = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.admin.feesChartTitle}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              tickFormatter={formatCompactXaf}
              width={44}
            />
            <Tooltip content={<FeesTooltip locale={locale} />} cursor={{ fill: "var(--secondary)" }} />
            <Bar dataKey="fees" fill="var(--amber)" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
