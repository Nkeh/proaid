import { calculateFee, type ContractType } from "@/lib/fees";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeeBreakdownCard({
  contractType,
  amount,
  monthNumber,
}: {
  contractType: ContractType;
  amount: number;
  monthNumber?: number;
}) {
  const t = useT();
  const locale = useLocale();
  const { feeRate, feeAmount, providerAmount } = calculateFee({ contractType, amount, monthNumber });

  return (
    <Card className="border-primary/20 bg-secondary/40">
      <CardHeader>
        <CardTitle className="text-base">{t.bookingForm.summaryTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.bookingForm.feeRateLine}</span>
          <span className="font-semibold">{Math.round(feeRate * 100)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.bookingForm.feeAmountLine}</span>
          <span className="font-semibold text-amber-foreground">{formatMoney(feeAmount, locale)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">{t.bookingForm.providerReceivesLine}</span>
          <span className="text-lg font-bold text-primary">{formatMoney(providerAmount, locale)}</span>
        </div>
        {contractType === "MONTHLY" && (
          <p className="pt-2 text-xs text-muted-foreground">{t.bookingForm.month6Note}</p>
        )}
      </CardContent>
    </Card>
  );
}
