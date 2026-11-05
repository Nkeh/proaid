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
import { formatDate, formatMoney } from "@/lib/format";
import { useProviderById } from "@/lib/data/providers";
import { makeOffer } from "@/lib/data/bookings";
import { useLoyaltySummary } from "@/lib/data/loyalty";
import { useDemoDate } from "@/lib/data/clock";
import { useRequireRole } from "@/lib/hooks/use-require-role";
import { CURRENT_EMPLOYER_ID } from "@/store/useAppStore";
import type { ContractKind, ScheduleType } from "@/lib/data/types";
import { addMonthsClamped, addDays } from "@/src/domain/schedule";
import { cn } from "@/lib/utils";

export default function MakeOfferPage() {
  useRequireRole("EMPLOYER");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const provider = useProviderById(id);
  const demoDate = useDemoDate();
  const loyalty = useLoyaltySummary(CURRENT_EMPLOYER_ID);

  const [contractKind, setContractKind] = useState<ContractKind>("LONG_CONTRACT");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("MONTHLY");
  const [startDate, setStartDate] = useState(demoDate);
  const [durationMonths, setDurationMonths] = useState(6);
  const [wage, setWage] = useState(provider?.monthlyRate ?? 0);
  const [notes, setNotes] = useState("");

  if (!provider) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.providerProfile.notFound}</p>
      </div>
    );
  }

  const isHalfAndHalf = contractKind === "LONG_CONTRACT" && scheduleType === "HALF_AND_HALF";
  const oddDuration = isHalfAndHalf && durationMonths % 2 !== 0;
  const endDate = contractKind === "LONG_CONTRACT" ? addDays(addMonthsClamped(startDate, durationMonths), -1) : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (oddDuration) return;
    const bookingId = makeOffer({
      providerId: provider!.id,
      contractKind,
      scheduleType: contractKind === "LONG_CONTRACT" ? scheduleType : undefined,
      startDate,
      durationMonths: contractKind === "SHORT_JOB" ? 1 : durationMonths,
      endDate,
      wage,
      notes,
    });
    toast.success(t.offerForm.successToast);
    router.push(`/demo/booking/${bookingId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <InitialsAvatar initials={provider.initials} color={provider.avatarColor} size="lg" />
        <div>
          <h1 className="text-xl font-bold">
            {t.offerForm.title} - {provider.name}
          </h1>
          <p className="text-sm text-muted-foreground">{t.offerForm.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>{t.offerForm.contractKind}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContractKind("SHORT_JOB")}
                    className={cn(
                      "h-16 rounded-xl border-2 text-sm font-semibold transition-colors",
                      contractKind === "SHORT_JOB" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    {t.offerForm.shortJob}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractKind("LONG_CONTRACT")}
                    className={cn(
                      "h-16 rounded-xl border-2 text-sm font-semibold transition-colors",
                      contractKind === "LONG_CONTRACT" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    {t.offerForm.longContract}
                  </button>
                </div>
              </div>

              {contractKind === "LONG_CONTRACT" && (
                <div className="space-y-2">
                  <Label>{t.offerForm.scheduleType}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScheduleType("MONTHLY")}
                      className={cn(
                        "h-12 rounded-xl border-2 text-sm font-semibold transition-colors",
                        scheduleType === "MONTHLY" ? "border-primary bg-primary/10 text-primary" : "border-border"
                      )}
                    >
                      {t.offerForm.monthlySchedule}
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleType("HALF_AND_HALF")}
                      className={cn(
                        "h-12 rounded-xl border-2 text-sm font-semibold transition-colors",
                        scheduleType === "HALF_AND_HALF" ? "border-primary bg-primary/10 text-primary" : "border-border"
                      )}
                    >
                      {t.offerForm.halfAndHalfSchedule}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t.offerForm.startDate}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                {contractKind === "LONG_CONTRACT" && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">{t.offerForm.durationMonths}</Label>
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

              {oddDuration && <p className="text-sm text-destructive">{t.offerForm.oddDurationError}</p>}

              {contractKind === "LONG_CONTRACT" && endDate && (
                <p className="text-xs text-muted-foreground">
                  {t.offerForm.endDate}: {formatDate(endDate, locale)}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="wage">{t.offerForm.wageAmount}</Label>
                <Input
                  id="wage"
                  type="number"
                  min={0}
                  step={1000}
                  value={wage}
                  onChange={(e) => setWage(Number(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t.providerProfile.rateLabel}: {formatMoney(provider.monthlyRate, locale)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t.offerForm.notes} <span className="text-muted-foreground">({t.common.optional})</span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.offerForm.notesPlaceholder}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <FeeBreakdownCard
            contractKind={contractKind}
            wage={wage}
            loyaltyMonthNumber={loyalty.reservedMonths + 1}
          />
          <p className="text-xs text-muted-foreground">{t.offerForm.fundingWindowNote}</p>
          <Button type="submit" size="lg" className="h-12 w-full" disabled={oddDuration}>
            {t.offerForm.submitButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
