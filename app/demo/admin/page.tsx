"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Banknote, Receipt, UserCheck, Clock, FileCheck, AlertTriangle, ShieldAlert, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { PlacementsChart, CommissionChart } from "@/components/admin/admin-charts";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, interpolate } from "@/lib/format";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import { useAdminStats, useDisputes, resolveDispute } from "@/lib/data/admin";
import { usePendingProviders, useProviderById, approveProvider, rejectProvider } from "@/lib/data/providers";
import { useAllBookings } from "@/lib/data/bookings";
import { useEmployer } from "@/lib/data/session";
import { findCurrentPeriod } from "@/store/useAppStore";
import type { Booking, DisputeDecisionOutcome, Provider } from "@/lib/data/types";

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function VettingDetailDialog({ provider, onClose }: { provider: Provider | null; onClose: () => void }) {
  const t = useT();
  const [reason, setReason] = useState("");

  if (!provider) return null;

  function handleApprove() {
    approveProvider(provider!.id);
    toast.success(t.admin.approvedToast);
    onClose();
  }

  function handleReject() {
    rejectProvider(provider!.id, reason);
    toast.success(t.admin.rejectedToast);
    onClose();
  }

  return (
    <Dialog open={!!provider} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <InitialsAvatar initials={provider.initials} color={provider.avatarColor} />
            {provider.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t.categories[provider.category]} &middot; {t.cities[provider.city]}, {t.neighbourhoods[provider.neighbourhood]}
          </p>
          {provider.interviewSlot && (
            <p className="text-sm text-muted-foreground">
              {t.admin.interviewSlotLabel}: {provider.interviewSlot.slice(0, 10)}
            </p>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold">{t.admin.documentsTitle}</p>
            <div className="grid grid-cols-2 gap-2">
              {provider.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 rounded-lg border border-border p-3 text-xs">
                  <FileCheck
                    className={`h-4 w-4 ${doc.status === "SUBMITTED" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div>
                    <p className="font-medium">{t.documents[doc.labelKey as keyof typeof t.documents]}</p>
                    <p className="text-muted-foreground">
                      {doc.status === "SUBMITTED" ? t.documents.submitted : t.documents.missing}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">{t.admin.rejectReasonLabel}</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.admin.rejectReasonPlaceholder}
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleApprove}>
              {t.admin.approve}
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleReject}>
              {t.admin.reject}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingProviderName({ providerId }: { providerId: string }) {
  const provider = useProviderById(providerId);
  return <span>{provider?.name ?? providerId}</span>;
}

function bookingAmount(booking: Booking): number {
  if (booking.contractKind === "SHORT_JOB") return booking.wage;
  const current = findCurrentPeriod(booking);
  return current?.employerPaysTotal ?? booking.wage;
}

export default function AdminDashboardPage() {
  useRequireRole("ADMIN");
  const t = useT();
  const locale = useLocale();
  const stats = useAdminStats();
  const pending = usePendingProviders();
  const bookings = useAllBookings();
  const disputes = useDisputes();
  const employer = useEmployer();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const selectedProvider = useProviderById(selectedProviderId ?? undefined) ?? null;

  const openDisputes = disputes.filter((d) => d.status === "OPEN");

  const flaggedPeriods = bookings.flatMap((b) =>
    b.periods
      .filter((p) => p.status === "OVERDUE" || p.status === "ON_HOLD" || p.status === "PARTLY_REFUNDED" || p.status === "REFUNDED")
      .map((p) => ({ booking: b, period: p }))
  );

  const replacementBookings = bookings.filter((b) => b.replacementOfBookingId);

  function handleResolve(disputeId: string, decision: DisputeDecisionOutcome) {
    resolveDispute(disputeId, decision);
    toast.success(t.admin.resolveButton);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">{t.admin.title}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard icon={Users} label={t.admin.kpiPlacements} value={stats.placementsPerMonth.at(-1)?.placements ?? 0} />
        <KpiCard icon={Banknote} label={t.admin.kpiContractValue} value={formatMoney(stats.totalContractValue, locale)} />
        <KpiCard icon={Receipt} label={t.admin.kpiCommission} value={formatMoney(stats.totalCommission, locale)} />
        <KpiCard icon={UserCheck} label={t.admin.kpiActiveProviders} value={stats.activeProviders} />
        <KpiCard icon={Clock} label={t.admin.kpiPending} value={stats.pendingVerifications} />
        <KpiCard icon={AlertTriangle} label={t.admin.kpiOverduePeriods} value={stats.overduePeriods} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlacementsChart data={stats.placementsPerMonth} />
        <CommissionChart data={stats.commissionPerMonth} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> {t.admin.disputesQueueTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openDisputes.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t.admin.noDisputesQueue}</p>
          ) : (
            openDisputes.map((d) => (
              <div key={d.id} className="space-y-2 rounded-xl border border-border p-4">
                <p className="text-sm font-medium">{d.description}</p>
                <p className="text-xs text-muted-foreground">{t.disputeCategoryLabels[d.category]}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleResolve(d.id, "FULL_RELEASE")}>
                    {t.admin.decisionFullRelease}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleResolve(d.id, "PARTIAL_RELEASE_WITH_REFUND")}>
                    {t.admin.decisionPartialRefund}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleResolve(d.id, "FULL_REFUND")}>
                    {t.admin.decisionFullRefund}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.vettingQueueTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t.admin.noVettingQueue}</p>
          ) : (
            pending.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProviderId(p.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-secondary/40"
              >
                <InitialsAvatar initials={p.initials} color={p.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.categories[p.category]} &middot; {t.cities[p.city]}, {t.neighbourhoods[p.neighbourhood]}
                  </p>
                </div>
                <Badge variant="secondary">{t.common.pending}</Badge>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {t.admin.paymentsMonitorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {flaggedPeriods.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t.admin.noPaymentsIssues}</p>
          ) : (
            flaggedPeriods.map(({ booking, period }) => (
              <div key={period.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookingProviderName providerId={booking.providerId} />
                  <span className="text-muted-foreground">
                    &middot; {interpolate(t.bookingDetail.periodOf, { current: period.periodNumber, total: booking.periods.length })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(period.employerPaysTotal, locale)}</span>
                  <Badge variant="secondary">{t.periodStatusLabels[period.status]}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-4 w-4" /> {t.admin.replacementsQueueTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {replacementBookings.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t.admin.noReplacements}</p>
          ) : (
            replacementBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookingProviderName providerId={b.providerId} />
                  <span className="text-muted-foreground">&middot; {t.admin.replacementLabel}</span>
                </div>
                <Badge variant="secondary">{t.statusLabels[b.status]}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.contractsTableTitle}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.tableProvider}</TableHead>
                <TableHead>{t.admin.tableEmployer}</TableHead>
                <TableHead>{t.admin.tableStatus}</TableHead>
                <TableHead className="text-right">{t.admin.tableAmount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <BookingProviderName providerId={b.providerId} />
                  </TableCell>
                  <TableCell>{employer.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.statusLabels[b.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(bookingAmount(b), locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <VettingDetailDialog provider={selectedProvider} onClose={() => setSelectedProviderId(null)} />
    </div>
  );
}
