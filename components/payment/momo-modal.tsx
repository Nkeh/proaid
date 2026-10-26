"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PaymentMethod = "MTN" | "ORANGE";
export type PaymentModalMode = "FUND" | "TOPUP" | "PAYOUT";

type Step = "SELECT" | "WAITING" | "SUCCESS";

interface MomoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PaymentModalMode;
  amount: number;
  onConfirmed: (method: PaymentMethod, phoneNumber: string) => void;
  recipientNote?: string;
}

const CM_PHONE_REGEX = /^6\d{8}$/;

function fakeReference(): string {
  return `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function MomoModal({ open, onOpenChange, mode, amount, onConfirmed, recipientNote }: MomoModalProps) {
  const t = useT();
  const locale = useLocale();
  const [step, setStep] = useState<Step>(mode === "PAYOUT" ? "WAITING" : "SELECT");
  const [method, setMethod] = useState<PaymentMethod>("MTN");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState("");

  // Reset the modal's internal state whenever it transitions from closed to open.
  // Done during render (not an effect) per React's "adjusting state when a prop
  // changes" pattern, to avoid an extra render pass from a setState-in-effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(mode === "PAYOUT" ? "WAITING" : "SELECT");
      setPhone("");
      setError(null);
      setReference(fakeReference());
    }
  }

  useEffect(() => {
    if (step !== "WAITING") return;
    const timer = setTimeout(() => {
      setStep("SUCCESS");
      onConfirmed(method, phone || "6xxxxxxxx");
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handlePay() {
    if (!CM_PHONE_REGEX.test(phone)) {
      setError(t.paymentModal.invalidPhone);
      return;
    }
    setError(null);
    setStep("WAITING");
  }

  const title = mode === "PAYOUT" ? t.paymentModal.payoutTitle : t.paymentModal.fundTitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {step === "SELECT" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.paymentModal.chooseMethod}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("MTN")}
                className={cn(
                  "flex h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-semibold transition-colors",
                  method === "MTN" ? "border-[#FFCC08] bg-[#FFCC08]/15" : "border-border"
                )}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-black"
                  style={{ backgroundColor: "#FFCC08" }}
                >
                  MTN
                </span>
                {t.paymentModal.mtn}
              </button>
              <button
                type="button"
                onClick={() => setMethod("ORANGE")}
                className={cn(
                  "flex h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-semibold transition-colors",
                  method === "ORANGE" ? "border-[#FF7900] bg-[#FF7900]/15" : "border-border"
                )}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: "#FF7900" }}
                >
                  OM
                </span>
                {t.paymentModal.orange}
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="momo-phone">{t.paymentModal.phoneNumberLabel}</Label>
              <Input
                id="momo-phone"
                inputMode="numeric"
                placeholder={t.paymentModal.phoneNumberPlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <span className="text-muted-foreground">{t.paymentModal.amountLabel}</span>
              <span className="font-semibold">{formatMoney(amount, locale)}</span>
            </div>

            <p className="text-center text-xs text-muted-foreground">{t.paymentModal.simulatedLabel}</p>

            <Button className="w-full" onClick={handlePay}>
              {t.paymentModal.payButton}
            </Button>
          </div>
        )}

        {step === "WAITING" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>
              <p className="font-semibold">{t.paymentModal.waitingTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.paymentModal.waitingBody}</p>
            </div>
            {recipientNote && <p className="text-xs text-muted-foreground">{recipientNote}</p>}
            <p className="text-xs text-muted-foreground">{t.paymentModal.simulatedLabel}</p>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="text-lg font-semibold">{t.paymentModal.successTitle}</p>
            <p className="text-sm text-muted-foreground">{t.paymentModal.successBody}</p>
            <div className="w-full rounded-lg bg-secondary px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.paymentModal.amountLabel}</span>
                <span className="font-semibold">{formatMoney(amount, locale)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">{t.paymentModal.transactionRef}</span>
                <span className="font-mono font-semibold">{reference}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t.paymentModal.simulatedLabel}</p>
            <DialogFooter className="w-full">
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                {t.paymentModal.doneButton}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
