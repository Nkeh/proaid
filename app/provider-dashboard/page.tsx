"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowUpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDateTime } from "@/lib/format";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import { CURRENT_PROVIDER_ID } from "@/lib/data/session";
import { useProviderById } from "@/lib/data/providers";
import { useBookingsForProvider, acceptBooking, declineBooking } from "@/lib/data/bookings";
import { useWallet } from "@/lib/data/wallet";
import { useEmployer } from "@/lib/data/session";
import { isTerminal } from "@/lib/booking";

export default function ProviderDashboardPage() {
  useRequireRole("PROVIDER");
  const t = useT();
  const locale = useLocale();
  const provider = useProviderById(CURRENT_PROVIDER_ID);
  const employer = useEmployer();
  const bookings = useBookingsForProvider(CURRENT_PROVIDER_ID);
  const wallet = useWallet();

  if (!provider) return null;

  const incoming = bookings.filter((b) => b.status === "REQUESTED");
  const active = bookings.filter((b) => !isTerminal(b.status) && b.status !== "REQUESTED");

  const payouts = wallet.transactions.filter(
    (tx) => tx.type === "PAYOUT" && bookings.some((b) => b.id === tx.bookingId)
  );
  const earningsToDate = payouts.reduce((sum, tx) => sum + tx.amount, 0);

  const verificationItems: { key: keyof typeof provider.verification; label: string }[] = [
    { key: "idVerified", label: t.verification.idVerified },
    { key: "referencesConfirmed", label: t.verification.referencesConfirmed },
    { key: "medicalCertificate", label: t.verification.medicalCertificate },
    { key: "skillsCheck", label: t.verification.skillsCheck },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <InitialsAvatar initials={provider.initials} color={provider.avatarColor} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{t.providerDashboard.title}</h1>
          <p className="text-muted-foreground">{provider.name}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t.providerDashboard.earningsToDate}</p>
            <p className="text-2xl font-bold text-primary">{formatMoney(earningsToDate, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.providerDashboard.profileStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {verificationItems.map((item) => {
              const checked = provider.verification[item.key];
              return (
                <div key={item.key} className="flex items-center gap-2 text-xs">
                  {checked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.providerDashboard.incomingRequests}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incoming.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t.providerDashboard.noIncomingRequests}
            </p>
          ) : (
            incoming.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{employer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.categories[b.category]} &middot; {formatMoney(b.amount, locale)}
                  </p>
                </div>
                <Button size="sm" onClick={() => acceptBooking(b.id)}>
                  {t.providerDashboard.acceptButton}
                </Button>
                <Button size="sm" variant="outline" onClick={() => declineBooking(b.id)}>
                  {t.providerDashboard.declineButton}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.providerDashboard.activeJobs}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {active.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t.providerDashboard.noActiveJobs}</p>
          ) : (
            active.map((b) => (
              <Link
                key={b.id}
                href={`/booking/${b.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-secondary/40"
              >
                <div>
                  <p className="font-medium">{employer.name}</p>
                  <p className="text-xs text-muted-foreground">{t.categories[b.category]}</p>
                </div>
                <Badge variant="secondary">{t.statusLabels[b.status]}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.providerDashboard.payoutHistory}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payouts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t.wallet.noTransactions}</p>
          ) : (
            payouts.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber/15 text-amber">
                  <ArrowUpCircle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{provider.momoNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(tx.timestamp, locale)}</p>
                </div>
                <span className="font-semibold text-primary">{formatMoney(tx.amount, locale)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
