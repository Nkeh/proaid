"use client";

import { useState } from "react";
import { Wallet as WalletIcon, Lock, ArrowDownCircle, ArrowUpCircle, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MomoModal } from "@/components/payment/momo-modal";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDateTime } from "@/lib/format";
import { useWallet, topUpWallet } from "@/lib/data/wallet";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import { cn } from "@/lib/utils";

const TOP_UP_AMOUNT = 200_000;

export default function WalletPage() {
  useRequireRole("EMPLOYER");
  const t = useT();
  const locale = useLocale();
  const wallet = useWallet();
  const [topUpOpen, setTopUpOpen] = useState(false);

  function typeLabel(type: "FUNDING" | "FEE" | "PAYOUT") {
    if (type === "FUNDING") return t.wallet.fundingType;
    if (type === "FEE") return t.wallet.feeType;
    return t.wallet.payoutType;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">{t.wallet.title}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t.wallet.balance}</p>
              <p className="text-2xl font-bold text-primary">{formatMoney(wallet.balance, locale)}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <WalletIcon className="h-6 w-6" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t.wallet.escrowHeld}</p>
              <p className="text-2xl font-bold text-amber-foreground">{formatMoney(wallet.escrowHeld, locale)}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-amber">
              <Lock className="h-6 w-6" />
            </span>
          </CardContent>
        </Card>
      </div>

      <Button className="h-11 gap-2" onClick={() => setTopUpOpen(true)}>
        <WalletIcon className="h-4 w-4" />
        {t.wallet.fundWalletButton}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t.wallet.transactionHistory}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {wallet.transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.wallet.noTransactions}</p>
          ) : (
            wallet.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    tx.type === "FUNDING" && "bg-primary/10 text-primary",
                    tx.type === "FEE" && "bg-secondary text-muted-foreground",
                    tx.type === "PAYOUT" && "bg-amber/15 text-amber"
                  )}
                >
                  {tx.type === "FUNDING" && <ArrowDownCircle className="h-4 w-4" />}
                  {tx.type === "FEE" && <Receipt className="h-4 w-4" />}
                  {tx.type === "PAYOUT" && <ArrowUpCircle className="h-4 w-4" />}
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
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <MomoModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        mode="TOPUP"
        amount={TOP_UP_AMOUNT}
        onConfirmed={(method, phone) => topUpWallet(TOP_UP_AMOUNT, method, phone)}
      />
    </div>
  );
}
