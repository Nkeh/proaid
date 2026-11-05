import { calculateContractMonthFee, calculateShortJobFee, SRS_V2_FEE_CONFIG, type ContractKind } from "@/src/domain/fees";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeeBreakdownCard({
  contractKind,
  wage,
  loyaltyMonthNumber,
}: {
  contractKind: ContractKind;
  wage: number;
  /** Required for LONG_CONTRACT: the loyalty month this would be assigned (e.g. reserved + 1). */
  loyaltyMonthNumber?: number;
}) {
  const t = useT();
  const locale = useLocale();
  const fee =
    contractKind === "SHORT_JOB"
      ? calculateShortJobFee(wage, SRS_V2_FEE_CONFIG)
      : calculateContractMonthFee(wage, loyaltyMonthNumber ?? 1, SRS_V2_FEE_CONFIG);

  return (
    <Card className="border-primary/20 bg-secondary/40">
      <CardHeader>
        <CardTitle className="text-base">{t.offerForm.summaryTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.offerForm.commissionRateLine}</span>
          <span className="font-semibold">{fee.rateBasisPoints / 100}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.offerForm.commissionAmountLine}</span>
          <span className="font-semibold text-amber-foreground">{formatMoney(fee.commission, locale)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.offerForm.employerPaysLine}</span>
          <span className="text-lg font-bold text-primary">{formatMoney(fee.employerPays, locale)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">{t.offerForm.workerReceivesLine}</span>
          <span className="font-semibold">{formatMoney(fee.workerReceives, locale)}</span>
        </div>
        {contractKind === "LONG_CONTRACT" && (
          <p className="pt-2 text-xs text-muted-foreground">{t.offerForm.loyaltyLevelNote}</p>
        )}
      </CardContent>
    </Card>
  );
}
