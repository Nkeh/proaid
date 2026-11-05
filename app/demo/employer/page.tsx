"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Wallet as WalletIcon, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import { useEmployer, CURRENT_EMPLOYER_ID } from "@/lib/data/session";
import { useBookingsForEmployer } from "@/lib/data/bookings";
import { useFeaturedProviders, useProviderById } from "@/lib/data/providers";
import { useWallet } from "@/lib/data/wallet";
import type { Booking } from "@/lib/data/types";

function BookingRow({ booking }: { booking: Booking }) {
  const t = useT();
  const provider = useProviderById(booking.providerId);
  if (!provider) return null;

  return (
    <Link
      href={`/demo/booking/${booking.id}`}
      className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/40"
    >
      <InitialsAvatar initials={provider.initials} color={provider.avatarColor} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{provider.name}</p>
        <p className="text-xs text-muted-foreground">{t.categories[provider.category]}</p>
      </div>
      <Badge variant="secondary">{t.statusLabels[booking.status]}</Badge>
    </Link>
  );
}

export default function EmployerDashboardPage() {
  useRequireRole("EMPLOYER");
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const employer = useEmployer();
  const bookings = useBookingsForEmployer(CURRENT_EMPLOYER_ID);
  const wallet = useWallet();
  const recommended = useFeaturedProviders(3);
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/demo/search?q=${encodeURIComponent(query)}` : "/demo/search");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">{t.employerDashboard.title}</h1>
        <p className="text-muted-foreground">
          {t.employerDashboard.welcomeBack}, {employer.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t.employerDashboard.walletBalance}</p>
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
              <p className="text-sm text-muted-foreground">{t.employerDashboard.escrowHeld}</p>
              <p className="text-2xl font-bold text-amber-foreground">{formatMoney(wallet.escrowHeld, locale)}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-amber">
              <Lock className="h-6 w-6" />
            </span>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.employerDashboard.quickSearchPlaceholder}
          className="h-11"
        />
        <Button type="submit" size="lg" className="h-11 gap-2">
          <SearchIcon className="h-4 w-4" />
          {t.common.search}
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>{t.employerDashboard.activeBookings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t.employerDashboard.noActiveBookings}
            </p>
          ) : (
            bookings.map((b) => <BookingRow key={b.id} booking={b} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.employerDashboard.recommendedProviders}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {recommended.map((p) => (
            <Link
              key={p.id}
              href={`/demo/provider/${p.id}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-colors hover:bg-secondary/40"
            >
              <InitialsAvatar initials={p.initials} color={p.avatarColor} size="lg" />
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{t.categories[p.category]}</p>
              <p className="text-sm font-semibold text-primary">{formatMoney(p.monthlyRate, locale)}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
