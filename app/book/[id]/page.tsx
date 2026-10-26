"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InitialsAvatar } from "@/components/brand/initials-avatar";
import { FeeBreakdownCard } from "@/components/booking/fee-breakdown-card";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { useProviderById } from "@/lib/data/providers";
import { createBooking } from "@/lib/data/bookings";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import type { ContractType } from "@/lib/fees";
import { cn } from "@/lib/utils";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingFormPage() {
  useRequireRole("EMPLOYER");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const provider = useProviderById(id);

  const [contractType, setContractType] = useState<ContractType>("MONTHLY");
  const [startDate, setStartDate] = useState(todayIso());
  const [durationMonths, setDurationMonths] = useState(6);
  const [amount, setAmount] = useState(provider?.monthlyRate ?? 0);
  const [notes, setNotes] = useState("");

  if (!provider) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.providerProfile.notFound}</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bookingId = createBooking({
      providerId: provider!.id,
      contractType,
      startDate,
      durationMonths: contractType === "SHORT_TERM" ? 1 : durationMonths,
      amount,
      notes,
    });
    toast.success(t.bookingForm.successToast);
    router.push(`/booking/${bookingId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <InitialsAvatar initials={provider.initials} color={provider.avatarColor} size="lg" />
        <div>
          <h1 className="text-xl font-bold">
            {t.bookingForm.title} {provider.name}
          </h1>
          <p className="text-sm text-muted-foreground">{t.bookingForm.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>{t.bookingForm.contractType}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContractType("SHORT_TERM")}
                    className={cn(
                      "h-16 rounded-xl border-2 text-sm font-semibold transition-colors",
                      contractType === "SHORT_TERM" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    {t.bookingForm.shortTerm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractType("MONTHLY")}
                    className={cn(
                      "h-16 rounded-xl border-2 text-sm font-semibold transition-colors",
                      contractType === "MONTHLY" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    {t.bookingForm.monthly}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t.bookingForm.startDate}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                {contractType === "MONTHLY" && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">{t.bookingForm.durationMonths}</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      max={36}
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value) || 1)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t.bookingForm.agreedAmount}</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t.providerProfile.rateLabel}: {formatMoney(provider.monthlyRate, locale)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t.bookingForm.notes} <span className="text-muted-foreground">({t.common.optional})</span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.bookingForm.notesPlaceholder}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <FeeBreakdownCard contractType={contractType} amount={amount} monthNumber={1} />
          <Button type="submit" size="lg" className="h-12 w-full">
            {t.bookingForm.submitButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
