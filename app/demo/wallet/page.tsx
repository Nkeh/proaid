"use client";

import Link from "next/link";
import { Lock, ArrowDownCircle, ArrowUpCircle, Receipt, Undo2, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDateTime, formatDate } from "@/lib/format";
import { useWalletSummary } from "@/lib/data/wallet";
import { CURRENT_EMPLOYER_ID } from "@/store/useAppStore";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import type { TransactionType } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  useRequireRole("EMPLOYER");
  const t = useT();
  const locale = useLocale();
  const wallet = useWalletSummary(CURRENT_EMPLOYER_ID);

  function typeLabel(type: TransactionType) {
    if (type === "FUNDING") return t.wallet.fundingType;
    if (type === "COMMISSION") return t.wallet.commissionType;
    if (type === "REFUND") return t.wallet.refundType;
    return t.wallet.payoutType;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">{t.wallet.title}</h1>
      <p className="text-sm text-muted-foreground">{t.wallet.noWalletBalanceNote}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t.wallet.heldInEscrow}</p>
              <p className="text-xl font-bold text-amber-foreground">{formatMoney(wallet.heldInEscrow, locale)}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber/15 text-amber">
              <Lock className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t.wallet.releasedTotal}</p>
              <p className="text-xl font-bold text-primary">{formatMoney(wallet.totalReleased, locale)}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowUpCircle className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t.wallet.refundedTotal}</p>
              <p className="text-xl font-bold">{formatMoney(wallet.totalRefunded, locale)}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Undo2 className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4" /> {t.wallet.upcomingPeriodsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wallet.upcomingPeriods.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.wallet.noUpcomingPeriods}</p>
          ) : (
            wallet.upcomingPeriods.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <p>{formatDate(p.startDate, locale)}</p>
                  <p className="text-xs text-muted-foreground">{t.periodStatusLabels[p.status]}</p>
                </div>
                <span className="font-semibold">{formatMoney(p.employerPaysTotal, locale)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.wallet.transactionHistory}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {wallet.transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.wallet.noTransactions}</p>
          ) : (
            wallet.transactions.map((tx) => (
              <Link
                key={tx.id}
                href={tx.bookingId ? `/demo/booking/${tx.bookingId}` : "#"}
                className="flex items-center gap-3 border-b border-border py-3 last:border-0"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    tx.type === "FUNDING" && "bg-primary/10 text-primary",
                    tx.type === "COMMISSION" && "bg-secondary text-muted-foreground",
                    tx.type === "PAYOUT" && "bg-amber/15 text-amber",
                    tx.type === "REFUND" && "bg-secondary text-muted-foreground"
                  )}
                >
                  {tx.type === "FUNDING" && <ArrowDownCircle className="h-4 w-4" />}
                  {tx.type === "COMMISSION" && <Receipt className="h-4 w-4" />}
                  {tx.type === "PAYOUT" && <ArrowUpCircle className="h-4 w-4" />}
                  {tx.type === "REFUND" && <Undo2 className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {locale === "fr" ? tx.descriptionFr : tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {typeLabel(tx.type)} &middot; {formatDateTime(tx.timestamp, locale)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">{formatMoney(tx.amount, locale)}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
