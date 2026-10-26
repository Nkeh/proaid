"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Printer, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import { useProviderById } from "@/lib/data/providers";
import { useEmployer, useRole } from "@/lib/data/session";
import { useBookingById, signContract } from "@/lib/data/bookings";
import { useRequireAnyRole } from "@/lib/hooks/use-require-role";
import { canTransition, toBookingLike } from "@/lib/booking";

export default function ContractPage() {
  useRequireAnyRole();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const role = useRole();
  const employer = useEmployer();

  const booking = useBookingById(id);
  const provider = useProviderById(booking?.providerId);

  const [consent, setConsent] = useState(false);
  const [fullName, setFullName] = useState("");

  if (!booking || !provider) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.bookingDetail.notFound}</p>
      </div>
    );
  }

  const canSign = canTransition(toBookingLike(booking), "SIGN");
  const isEmployerSigner = role === "EMPLOYER" && !booking.employerSignature.signed;
  const isProviderSigner = role === "PROVIDER" && !booking.providerSignature.signed;
  const canSignNow = canSign && (isEmployerSigner || isProviderSigner);

  function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || !fullName.trim() || !role) return;
    signContract(booking!.id, role, fullName.trim());
    toast.success(t.contract.signButton);
    setFullName("");
    setConsent(false);
  }

  const feeTerms =
    booking.contractType === "SHORT_TERM" ? t.contract.feeTermsShortTerm : t.contract.feeTermsMonthly;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" className="gap-2" onClick={() => router.push(`/booking/${booking.id}`)}>
          <ArrowLeft className="h-4 w-4" />
          {t.contract.backToBooking}
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          {t.contract.printButton}
        </Button>
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardContent className="space-y-6 pt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t.contract.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.contract.agreementIntro}</p>
          </div>

          <Separator />

          <div>
            <h2 className="mb-3 font-semibold">{t.contract.partiesTitle}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase text-muted-foreground">{t.contract.employerLabel}</p>
                <p className="font-medium">{employer.name}</p>
                <p className="text-sm text-muted-foreground">{t.neighbourhoods[employer.neighbourhood]}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase text-muted-foreground">{t.contract.providerLabel}</p>
                <p className="font-medium">{provider.name}</p>
                <p className="text-sm text-muted-foreground">{t.neighbourhoods[provider.neighbourhood]}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">{t.contract.serviceLabel}</span>
              <span className="font-medium">{t.categories[booking.category]}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">{t.contract.startDateLabel}</span>
              <span className="font-medium">{formatDate(booking.startDate, locale)}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2 sm:col-span-2">
              <span className="text-muted-foreground">{t.contract.amountLabel}</span>
              <span className="font-medium">
                {formatMoney(booking.amount, locale)}
                {booking.contractType === "MONTHLY" ? t.common.perMonth : ""}
              </span>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-semibold">{t.contract.feeTermsTitle}</h2>
            <p className="text-sm text-muted-foreground">{feeTerms}</p>
          </div>

          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground">{t.contract.notAgencyStatement}</p>
          </div>

          <div>
            <h2 className="mb-3 font-semibold">{t.contract.signatureSectionTitle}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SignatureBlock
                label={t.contract.employerLabel}
                signature={booking.employerSignature}
                locale={locale}
                t={t}
              />
              <SignatureBlock
                label={t.contract.providerLabel}
                signature={booking.providerSignature}
                locale={locale}
                t={t}
              />
            </div>
          </div>

          {canSignNow && (
            <form onSubmit={handleSign} className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5 print:hidden">
              <div className="flex items-start gap-2">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
                <Label htmlFor="consent" className="text-sm leading-relaxed font-normal">
                  {t.contract.consentLabel}
                </Label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t.contract.fullNameLabel}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.contract.fullNamePlaceholder}
                  required
                />
              </div>
              <Button type="submit" disabled={!consent || !fullName.trim()}>
                {t.contract.signButton}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <style>{`
        @media print {
          header, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function SignatureBlock({
  label,
  signature,
  locale,
  t,
}: {
  label: string;
  signature: { signed: boolean; fullName: string | null; timestamp: string | null };
  locale: ReturnType<typeof useLocale>;
  t: ReturnType<typeof useT>;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      {signature.signed ? (
        <>
          <p className="mt-1 text-xl italic text-foreground" style={{ fontFamily: "cursive" }}>
            {signature.fullName}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.contract.signedOn} {signature.timestamp && formatDateTime(signature.timestamp, locale)}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">{t.contract.awaitingSignature}</p>
      )}
    </div>
  );
}
